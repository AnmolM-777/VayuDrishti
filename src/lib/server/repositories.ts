import { FieldValue, type Firestore } from 'firebase-admin/firestore';

import { ApiError } from '@/lib/server/api';
import { getAdminDb } from '@/lib/server/firebase-admin';
import {
  getSampleAlerts,
  getSampleDispatches,
  getSampleHotspots,
  getSampleReports,
  getSampleResources,
} from '@/lib/sample-data';
import type {
  DispatchOrder,
  MunicipalResource,
  PollutionAlert,
} from '@/types/alert';
import type { PollutionHotspot } from '@/types/hotspot';
import type {
  PollutionReport,
  PollutionSourceType,
  ReportStatus,
} from '@/types/report';

interface ReportFilters {
  status?: ReportStatus;
  sourceType?: PollutionSourceType;
}

interface HotspotFilters {
  status?: PollutionHotspot['status'];
  severity?: PollutionHotspot['severity'];
}

interface AlertFilters {
  status?: PollutionAlert['status'];
  priority?: PollutionAlert['priority'];
}

const demoReports: PollutionReport[] = [];
const demoDispatches: DispatchOrder[] = [];

function firestore(): Firestore | undefined {
  return getAdminDb();
}

function sortReports(reports: PollutionReport[]): PollutionReport[] {
  return [...reports].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

function applyReportFilters(
  reports: PollutionReport[],
  filters: ReportFilters,
): PollutionReport[] {
  return sortReports(
    reports.filter((report) => {
      if (filters.status && report.status !== filters.status) return false;
      if (
        filters.sourceType &&
        report.aiAnalysis?.sourceType !== filters.sourceType
      )
        return false;
      return true;
    }),
  );
}

function applyHotspotFilters(
  hotspots: PollutionHotspot[],
  filters: HotspotFilters,
): PollutionHotspot[] {
  return hotspots
    .filter((hotspot) => {
      if (filters.status && hotspot.status !== filters.status) return false;
      if (filters.severity && hotspot.severity !== filters.severity)
        return false;
      return true;
    })
    .sort((a, b) => b.severityScore - a.severityScore);
}

function applyAlertFilters(
  alerts: PollutionAlert[],
  filters: AlertFilters,
): PollutionAlert[] {
  const priorityOrder: PollutionAlert['priority'][] = [
    'green',
    'yellow',
    'orange',
    'red',
    'purple',
  ];

  return alerts
    .filter((alert) => {
      if (filters.status && alert.status !== filters.status) return false;
      if (filters.priority && alert.priority !== filters.priority) return false;
      return true;
    })
    .sort((a, b) => {
      const priorityDiff =
        priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function getReports(
  filters: ReportFilters = {},
): Promise<PollutionReport[]> {
  const db = firestore();
  if (!db) {
    return applyReportFilters([...demoReports, ...getSampleReports()], filters);
  }

  try {
    let query: FirebaseFirestore.Query = db.collection('reports');
    if (filters.status) query = query.where('status', '==', filters.status);
    query = query.orderBy('timestamp', 'desc').limit(250);

    const snapshot = await query.get();
    const reports = snapshot.docs.map((doc) => doc.data() as PollutionReport);
    return applyReportFilters(reports, filters);
  } catch {
    return applyReportFilters([...demoReports, ...getSampleReports()], filters);
  }
}

export async function createReport(
  input: Omit<
    PollutionReport,
    'id' | 'timestamp' | 'status' | 'upvotes' | 'verifiedBy'
  > &
    Partial<
      Pick<
        PollutionReport,
        'id' | 'timestamp' | 'status' | 'upvotes' | 'verifiedBy'
      >
    >,
): Promise<PollutionReport> {
  const report: PollutionReport = {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId,
    userName: input.userName,
    userAvatar: input.userAvatar,
    timestamp: input.timestamp ?? new Date().toISOString(),
    location: input.location,
    photoUrl: input.photoUrl,
    thumbnailUrl: input.thumbnailUrl,
    description: input.description,
    aiAnalysis: input.aiAnalysis,
    status: input.status ?? 'pending',
    upvotes: input.upvotes ?? 0,
    verifiedBy: input.verifiedBy ?? [],
  };

  const db = firestore();
  if (!db) {
    demoReports.unshift(report);
    return report;
  }

  await db
    .collection('reports')
    .doc(report.id)
    .set({
      ...report,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return report;
}

export async function getHotspots(
  filters: HotspotFilters = {},
): Promise<PollutionHotspot[]> {
  const db = firestore();
  if (!db) return applyHotspotFilters(getSampleHotspots(), filters);

  try {
    let query: FirebaseFirestore.Query = db.collection('hotspots');
    if (filters.status) query = query.where('status', '==', filters.status);
    query = query.orderBy('severityScore', 'desc').limit(250);
    const snapshot = await query.get();
    return applyHotspotFilters(
      snapshot.docs.map((doc) => doc.data() as PollutionHotspot),
      filters,
    );
  } catch {
    return applyHotspotFilters(getSampleHotspots(), filters);
  }
}

export async function upsertHotspots(
  hotspots: PollutionHotspot[],
): Promise<void> {
  const db = firestore();
  if (!db || hotspots.length === 0) return;

  const batch = db.batch();
  for (const hotspot of hotspots) {
    batch.set(
      db.collection('hotspots').doc(hotspot.id),
      {
        ...hotspot,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
  await batch.commit();
}

export async function getAlerts(
  filters: AlertFilters = {},
): Promise<PollutionAlert[]> {
  const db = firestore();
  if (!db) return applyAlertFilters(getSampleAlerts(), filters);

  try {
    let query: FirebaseFirestore.Query = db.collection('alerts');
    if (filters.status) query = query.where('status', '==', filters.status);
    query = query.orderBy('createdAt', 'desc').limit(250);
    const snapshot = await query.get();
    return applyAlertFilters(
      snapshot.docs.map((doc) => doc.data() as PollutionAlert),
      filters,
    );
  } catch {
    return applyAlertFilters(getSampleAlerts(), filters);
  }
}

export async function getDispatches(): Promise<DispatchOrder[]> {
  const db = firestore();
  if (!db) return [...demoDispatches, ...getSampleDispatches()];

  try {
    const snapshot = await db
      .collection('dispatches')
      .orderBy('assignedAt', 'desc')
      .limit(250)
      .get();
    return snapshot.docs.map((doc) => doc.data() as DispatchOrder);
  } catch {
    return [...demoDispatches, ...getSampleDispatches()];
  }
}

export async function getResources(): Promise<MunicipalResource[]> {
  const db = firestore();
  if (!db) return getSampleResources();

  try {
    const snapshot = await db.collection('resources').limit(250).get();
    const resources = snapshot.docs.map(
      (doc) => doc.data() as MunicipalResource,
    );
    return resources.length > 0 ? resources : getSampleResources();
  } catch {
    return getSampleResources();
  }
}

export async function createDispatchOrder(input: {
  alertId: string;
  hotspotId: string;
  resourceId: string;
  notes?: string;
  assignedBy: string;
}): Promise<DispatchOrder> {
  const db = firestore();
  if (!db) {
    const resource = getSampleResources().find(
      (item) => item.id === input.resourceId,
    );
    if (!resource)
      throw new ApiError(404, 'resource_not_found', 'Resource not found');
    if (!resource.isAvailable) {
      throw new ApiError(
        409,
        'resource_unavailable',
        'Resource is not available',
      );
    }

    const hotspot = getSampleHotspots().find(
      (item) => item.id === input.hotspotId,
    );
    const dispatch: DispatchOrder = {
      id: `dsp-${Date.now()}`,
      alertId: input.alertId,
      hotspotId: input.hotspotId,
      resourceId: resource.id,
      resourceType: resource.type,
      resourceName: resource.name,
      status: 'assigned',
      targetLocation: hotspot?.location ?? resource.location,
      assignedAt: new Date().toISOString(),
      eta: 'Pending route',
      distanceKm: undefined,
      notes: input.notes,
      assignedBy: input.assignedBy,
    };
    demoDispatches.unshift(dispatch);
    return dispatch;
  }

  const dispatchId = `dsp-${crypto.randomUUID()}`;
  const assignedAt = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const resourceRef = db.collection('resources').doc(input.resourceId);
    const hotspotRef = db.collection('hotspots').doc(input.hotspotId);
    const alertRef = db.collection('alerts').doc(input.alertId);
    const dispatchRef = db.collection('dispatches').doc(dispatchId);

    const [resourceDoc, hotspotDoc] = await Promise.all([
      transaction.get(resourceRef),
      transaction.get(hotspotRef),
    ]);

    const resource = resourceDoc.exists
      ? (resourceDoc.data() as MunicipalResource)
      : getSampleResources().find((item) => item.id === input.resourceId);

    if (!resource)
      throw new ApiError(404, 'resource_not_found', 'Resource not found');
    if (!resource.isAvailable) {
      throw new ApiError(
        409,
        'resource_unavailable',
        'Resource is not available',
      );
    }

    const hotspot = hotspotDoc.exists
      ? (hotspotDoc.data() as PollutionHotspot)
      : getSampleHotspots().find((item) => item.id === input.hotspotId);

    const dispatch: DispatchOrder = {
      id: dispatchId,
      alertId: input.alertId,
      hotspotId: input.hotspotId,
      resourceId: resource.id,
      resourceType: resource.type,
      resourceName: resource.name,
      status: 'assigned',
      targetLocation: hotspot?.location ?? resource.location,
      assignedAt,
      eta: 'Pending route',
      notes: input.notes,
      assignedBy: input.assignedBy,
    };

    transaction.set(dispatchRef, {
      ...dispatch,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (resourceDoc.exists) {
      transaction.update(resourceRef, {
        isAvailable: false,
        assignedDispatchId: dispatch.id,
        lastDeployedAt: assignedAt,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    if (hotspotDoc.exists) {
      transaction.update(hotspotRef, {
        status: 'dispatched',
        dispatch: {
          dispatchId: dispatch.id,
          resourceType: dispatch.resourceType,
          assignedAt,
          eta: dispatch.eta,
        },
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    transaction.set(
      alertRef,
      {
        id: input.alertId,
        status: 'dispatched',
        acknowledgedAt: assignedAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return dispatch;
  });
}
