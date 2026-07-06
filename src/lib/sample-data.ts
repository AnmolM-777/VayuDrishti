/**
 * Sample data for hackathon demo.
 *
 * Provides realistic Delhi pollution reports, stations, alerts,
 * hotspots, dispatches, and user profiles for the demo flow.
 * In production, all this comes from Firestore.
 */

import type { PollutionReport } from '@/types/report';
import type { MonitoringStation } from '@/types/station';
import type { PollutionHotspot } from '@/types/hotspot';
import type { PollutionAlert, DispatchOrder, MunicipalResource } from '@/types/alert';
import type { AreaPrediction } from '@/types/prediction';
import type { UserProfile } from '@/types/user';

// ─── Sample reports (Delhi) ─────────────────────────────────────────
const SAMPLE_REPORTS: PollutionReport[] = [
  {
    id: 'rpt-001',
    userId: 'usr-001',
    userName: 'Priya Sharma',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    location: { lat: 28.6328, lng: 77.2197, address: 'Lajpat Nagar Market, South Delhi', city: 'Delhi', ward: 'Lajpat Nagar' },
    photoUrl: '/sample/garbage-burning-1.jpg',
    description: 'Garbage burning near market. Heavy smoke.',
    aiAnalysis: {
      sourceType: 'garbage_burning',
      confidence: 0.94,
      severity: 8,
      estimatedRadiusMeters: 200,
      healthRisk: 'high',
      description: 'Dense black/grey smoke from open waste burning near a market area. Visible flames and burning debris.',
      recommendedAction: 'Deploy fire crew to extinguish + cleanup crew for waste removal. Issue air quality advisory for 500m radius.',
      pollutants: ['PM2.5', 'PM10', 'VOC', 'CO'],
      isNighttime: false,
      weatherVisible: 'hazy',
    },
    status: 'verified',
    upvotes: 12,
    verifiedBy: ['usr-002', 'usr-005', 'usr-008'],
  },
  {
    id: 'rpt-002',
    userId: 'usr-003',
    userName: 'Rahul Verma',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    location: { lat: 28.6345, lng: 77.2180, address: 'Near Lajpat Nagar Metro', city: 'Delhi', ward: 'Lajpat Nagar' },
    photoUrl: '/sample/garbage-burning-2.jpg',
    description: 'Smoke from nala side. Waste burning.',
    aiAnalysis: {
      sourceType: 'garbage_burning',
      confidence: 0.89,
      severity: 7,
      estimatedRadiusMeters: 150,
      healthRisk: 'high',
      description: 'Open waste burning near a drainage channel (nala). Grey-black smoke reducing visibility.',
      recommendedAction: 'Deploy cleanup crew for waste removal. Coordinate with MCD for regular collection schedule.',
      pollutants: ['PM2.5', 'PM10', 'VOC'],
      isNighttime: false,
      weatherVisible: 'hazy',
    },
    status: 'verified',
    upvotes: 8,
    verifiedBy: ['usr-001', 'usr-007'],
  },
  {
    id: 'rpt-003',
    userId: 'usr-002',
    userName: 'Ankit Kumar',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    location: { lat: 28.5921, lng: 77.2507, address: 'Okhla Industrial Area Phase 1', city: 'Delhi', ward: 'Okhla' },
    photoUrl: '/sample/industrial-1.jpg',
    description: 'Factory chimney emitting thick smoke since morning.',
    aiAnalysis: {
      sourceType: 'industrial',
      confidence: 0.92,
      severity: 7,
      estimatedRadiusMeters: 500,
      healthRisk: 'high',
      description: 'Continuous white-grey plume from industrial chimney stack. Consistent emission pattern.',
      recommendedAction: 'Dispatch inspection team to verify emissions compliance. Check pollution clearance certificates.',
      pollutants: ['PM2.5', 'SO2', 'NOx'],
      isNighttime: false,
      weatherVisible: 'hazy',
    },
    status: 'verified',
    upvotes: 15,
    verifiedBy: ['usr-004', 'usr-006'],
  },
  {
    id: 'rpt-004',
    userId: 'usr-005',
    userName: 'Sneha Patel',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    location: { lat: 28.5935, lng: 77.2490, address: 'Okhla Industrial Estate', city: 'Delhi', ward: 'Okhla' },
    photoUrl: '/sample/industrial-2.jpg',
    description: 'Multiple factories releasing smoke.',
    aiAnalysis: {
      sourceType: 'industrial',
      confidence: 0.88,
      severity: 6,
      estimatedRadiusMeters: 400,
      healthRisk: 'medium',
      description: 'Multiple industrial stacks visible with intermittent white smoke plumes.',
      recommendedAction: 'Schedule industrial area inspection. Cross-check with DPCC emission records.',
      pollutants: ['PM2.5', 'PM10', 'SO2'],
      isNighttime: false,
      weatherVisible: 'clear',
    },
    status: 'verified',
    upvotes: 9,
    verifiedBy: ['usr-002'],
  },
  {
    id: 'rpt-005',
    userId: 'usr-004',
    userName: 'Mohammed Aziz',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    location: { lat: 28.6517, lng: 77.2219, address: 'ITO Junction', city: 'Delhi', ward: 'ITO' },
    photoUrl: '/sample/vehicle-exhaust-1.jpg',
    description: 'Heavy smog at ITO junction during rush hour.',
    aiAnalysis: {
      sourceType: 'vehicle_exhaust',
      confidence: 0.85,
      severity: 6,
      estimatedRadiusMeters: 300,
      healthRisk: 'medium',
      description: 'Dense traffic with visible vehicular haze at a major intersection. Multiple diesel vehicles.',
      recommendedAction: 'Deploy traffic management to reduce idling time. Consider anti-smog gun deployment.',
      pollutants: ['PM2.5', 'NOx', 'CO'],
      isNighttime: false,
      weatherVisible: 'hazy',
    },
    status: 'verified',
    upvotes: 6,
    verifiedBy: ['usr-001'],
  },
  {
    id: 'rpt-006',
    userId: 'usr-007',
    userName: 'Kavita Singh',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    location: { lat: 28.6692, lng: 77.2030, address: 'Connaught Place', city: 'Delhi', ward: 'New Delhi' },
    photoUrl: '/sample/construction-1.jpg',
    description: 'Construction site without covering. Dust everywhere.',
    aiAnalysis: {
      sourceType: 'construction_dust',
      confidence: 0.91,
      severity: 5,
      estimatedRadiusMeters: 150,
      healthRisk: 'medium',
      description: 'Active construction site with exposed earth and no dust suppression measures. Visible dust cloud.',
      recommendedAction: 'Issue notice to contractor for dust suppression. Deploy water sprinkler on nearby roads.',
      pollutants: ['PM10', 'PM2.5'],
      isNighttime: false,
      weatherVisible: 'clear',
    },
    status: 'pending',
    upvotes: 3,
    verifiedBy: [],
  },
  {
    id: 'rpt-007',
    userId: 'usr-006',
    userName: 'Deepak Yadav',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    location: { lat: 28.7041, lng: 77.1025, address: 'Dwarka Sector 21', city: 'Delhi', ward: 'Dwarka' },
    photoUrl: '/sample/road-dust-1.jpg',
    description: 'Unpaved road creating dust with every vehicle.',
    aiAnalysis: {
      sourceType: 'road_dust',
      confidence: 0.87,
      severity: 4,
      estimatedRadiusMeters: 200,
      healthRisk: 'low',
      description: 'Unpaved road surface with dry conditions. Each passing vehicle raises visible dust plume.',
      recommendedAction: 'Schedule road paving. Interim: water sprinkler deployment twice daily.',
      pollutants: ['PM10', 'PM2.5'],
      isNighttime: false,
      weatherVisible: 'clear',
    },
    status: 'pending',
    upvotes: 2,
    verifiedBy: [],
  },
  {
    id: 'rpt-008',
    userId: 'usr-008',
    userName: 'Arti Gupta',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    location: { lat: 28.6139, lng: 77.2090, address: 'India Gate, Central Delhi', city: 'Delhi', ward: 'New Delhi' },
    photoUrl: '/sample/haze-1.jpg',
    description: 'Very hazy. Can barely see India Gate from 200m.',
    aiAnalysis: {
      sourceType: 'unknown',
      confidence: 0.72,
      severity: 6,
      estimatedRadiusMeters: 1000,
      healthRisk: 'medium',
      description: 'Regional haze reducing visibility significantly. No single point source visible. Likely meteorological trapping.',
      recommendedAction: 'Issue city-wide air quality advisory. Monitor for temperature inversion.',
      pollutants: ['PM2.5', 'PM10'],
      isNighttime: false,
      weatherVisible: 'hazy',
    },
    status: 'verified',
    upvotes: 20,
    verifiedBy: ['usr-001', 'usr-003', 'usr-004'],
  },
];

// ─── Sample CPCB stations (Delhi) ───────────────────────────────────
const SAMPLE_STATIONS: MonitoringStation[] = [
  {
    id: 'stn-ito', name: 'ITO', city: 'Delhi', state: 'Delhi',
    location: { lat: 28.6289, lng: 77.2413, city: 'Delhi' },
    source: 'cpcb', isActive: true,
    latestReading: { aqi: 186, category: 'moderate', dominantPollutant: 'PM2.5', pm25: 88, pm10: 142, no2: 45, so2: 12, timestamp: new Date().toISOString() },
  },
  {
    id: 'stn-anand-vihar', name: 'Anand Vihar', city: 'Delhi', state: 'Delhi',
    location: { lat: 28.6469, lng: 77.3164, city: 'Delhi' },
    source: 'cpcb', isActive: true,
    latestReading: { aqi: 287, category: 'poor', dominantPollutant: 'PM2.5', pm25: 145, pm10: 230, no2: 62, so2: 18, timestamp: new Date().toISOString() },
  },
  {
    id: 'stn-rk-puram', name: 'R.K. Puram', city: 'Delhi', state: 'Delhi',
    location: { lat: 28.5631, lng: 77.1868, city: 'Delhi' },
    source: 'cpcb', isActive: true,
    latestReading: { aqi: 205, category: 'poor', dominantPollutant: 'PM2.5', pm25: 102, pm10: 168, no2: 52, so2: 14, timestamp: new Date().toISOString() },
  },
  {
    id: 'stn-dwarka', name: 'Dwarka Sector 8', city: 'Delhi', state: 'Delhi',
    location: { lat: 28.5708, lng: 77.0686, city: 'Delhi' },
    source: 'cpcb', isActive: true,
    latestReading: { aqi: 165, category: 'moderate', dominantPollutant: 'PM10', pm25: 72, pm10: 155, no2: 38, timestamp: new Date().toISOString() },
  },
  {
    id: 'stn-mandir-marg', name: 'Mandir Marg', city: 'Delhi', state: 'Delhi',
    location: { lat: 28.6365, lng: 77.2013, city: 'Delhi' },
    source: 'cpcb', isActive: true,
    latestReading: { aqi: 158, category: 'moderate', dominantPollutant: 'PM2.5', pm25: 68, pm10: 120, timestamp: new Date().toISOString() },
  },
  {
    id: 'stn-lodhi-road', name: 'Lodhi Road', city: 'Delhi', state: 'Delhi',
    location: { lat: 28.5918, lng: 77.2273, city: 'Delhi' },
    source: 'cpcb', isActive: true,
    latestReading: { aqi: 142, category: 'moderate', dominantPollutant: 'PM2.5', pm25: 60, pm10: 105, timestamp: new Date().toISOString() },
  },
  {
    id: 'stn-okhla', name: 'Okhla Phase 2', city: 'Delhi', state: 'Delhi',
    location: { lat: 28.5308, lng: 77.2717, city: 'Delhi' },
    source: 'cpcb', isActive: true,
    latestReading: { aqi: 245, category: 'poor', dominantPollutant: 'PM2.5', pm25: 125, pm10: 198, so2: 22, timestamp: new Date().toISOString() },
  },
  {
    id: 'stn-punjabi-bagh', name: 'Punjabi Bagh', city: 'Delhi', state: 'Delhi',
    location: { lat: 28.6682, lng: 77.1309, city: 'Delhi' },
    source: 'cpcb', isActive: true,
    latestReading: { aqi: 198, category: 'moderate', dominantPollutant: 'PM2.5', pm25: 95, pm10: 160, timestamp: new Date().toISOString() },
  },
];

// ─── Sample hotspots ────────────────────────────────────────────────
const SAMPLE_HOTSPOTS: PollutionHotspot[] = [
  {
    id: 'hs-001',
    location: { lat: 28.6335, lng: 77.2190, address: 'Lajpat Nagar Market', city: 'Delhi', ward: 'Lajpat Nagar' },
    radius: 250,
    severity: 'critical',
    severityScore: 82,
    sourceType: 'garbage_burning',
    status: 'dispatched',
    detectedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    reportIds: ['rpt-001', 'rpt-002'],
    reportCount: 2,
    avgConfidence: 0.915,
    estimatedAqi: 340,
    description: '2 reports of garbage burning detected within 250m radius. Near Lajpat Nagar Market.',
    dispatch: { dispatchId: 'dsp-001', resourceType: 'fire_brigade', assignedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), eta: '8 min' },
  },
  {
    id: 'hs-002',
    location: { lat: 28.5928, lng: 77.2498, address: 'Okhla Industrial Area', city: 'Delhi', ward: 'Okhla' },
    radius: 400,
    severity: 'high',
    severityScore: 65,
    sourceType: 'industrial',
    status: 'confirmed',
    detectedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    reportIds: ['rpt-003', 'rpt-004'],
    reportCount: 2,
    avgConfidence: 0.90,
    estimatedAqi: 275,
    description: '2 reports of industrial emission detected within 400m radius. Near Okhla Industrial Area.',
  },
  {
    id: 'hs-003',
    location: { lat: 28.6692, lng: 77.2030, address: 'Connaught Place', city: 'Delhi', ward: 'New Delhi' },
    radius: 150,
    severity: 'medium',
    severityScore: 42,
    sourceType: 'construction_dust',
    status: 'detected',
    detectedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    reportIds: ['rpt-006'],
    reportCount: 1,
    avgConfidence: 0.91,
    description: 'Construction dust reported at Connaught Place. Single report — awaiting corroboration.',
  },
];

// ─── Sample alerts ──────────────────────────────────────────────────
const SAMPLE_ALERTS: PollutionAlert[] = [
  {
    id: 'alt-001',
    priority: 'red',
    status: 'dispatched',
    title: 'Severe: Garbage burning at Lajpat Nagar',
    description: 'Multiple citizen reports confirm active garbage burning near Lajpat Nagar Market. PM2.5 estimated >300.',
    location: { lat: 28.6335, lng: 77.2190, address: 'Lajpat Nagar Market', city: 'Delhi' },
    radius: 500,
    sourceType: 'garbage_burning',
    estimatedAqi: 340,
    hotspotId: 'hs-001',
    reportIds: ['rpt-001', 'rpt-002'],
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    recommendedAction: 'Deploy fire brigade + cleanup crew. Issue air quality advisory for 500m radius.',
    affectedPopulation: 15000,
    nearbySchools: ['DPS Lajpat Nagar', 'Greenfield Public School'],
  },
  {
    id: 'alt-002',
    priority: 'orange',
    status: 'active',
    title: 'Hotspot: Industrial emissions at Okhla',
    description: 'Multiple factories releasing emissions in Okhla Industrial Area. PM2.5 rising.',
    location: { lat: 28.5928, lng: 77.2498, address: 'Okhla Industrial Area', city: 'Delhi' },
    radius: 500,
    sourceType: 'industrial',
    estimatedAqi: 275,
    hotspotId: 'hs-002',
    reportIds: ['rpt-003', 'rpt-004'],
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    recommendedAction: 'Dispatch inspection team. Deploy water mist cannon on perimeter roads.',
  },
  {
    id: 'alt-003',
    priority: 'yellow',
    status: 'active',
    title: 'Moderate: Construction dust at CP',
    description: 'Uncovered construction site generating dust near Connaught Place.',
    location: { lat: 28.6692, lng: 77.2030, address: 'Connaught Place', city: 'Delhi' },
    radius: 200,
    sourceType: 'construction_dust',
    estimatedAqi: 175,
    hotspotId: 'hs-003',
    reportIds: ['rpt-006'],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    recommendedAction: 'Issue notice for dust suppression to contractor.',
  },
  {
    id: 'alt-004',
    priority: 'red',
    status: 'resolved',
    title: 'Severe: Waste fire at Bhalswa Landfill',
    description: 'Large waste fire detected at Bhalswa landfill. Smoke visible for 2km.',
    location: { lat: 28.7358, lng: 77.1629, address: 'Bhalswa Landfill', city: 'Delhi' },
    radius: 2000,
    sourceType: 'garbage_burning',
    estimatedAqi: 420,
    reportIds: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    recommendedAction: 'Emergency fire response. Evacuate nearby residents.',
    affectedPopulation: 50000,
  },
];

// ─── Sample dispatches ──────────────────────────────────────────────
const SAMPLE_DISPATCHES: DispatchOrder[] = [
  {
    id: 'dsp-001',
    alertId: 'alt-001',
    hotspotId: 'hs-001',
    resourceId: 'res-001',
    resourceType: 'fire_brigade',
    resourceName: 'Fire Unit Delta-7',
    status: 'en_route',
    targetLocation: { lat: 28.6335, lng: 77.2190, address: 'Lajpat Nagar Market' },
    assignedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    departedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    eta: '3 min',
    distanceKm: 4.2,
    assignedBy: 'municipal-001',
  },
  {
    id: 'dsp-002',
    alertId: 'alt-001',
    hotspotId: 'hs-001',
    resourceId: 'res-003',
    resourceType: 'cleanup_crew',
    resourceName: 'MCD Ward 45 Crew',
    status: 'assigned',
    targetLocation: { lat: 28.6335, lng: 77.2190, address: 'Lajpat Nagar Market' },
    assignedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    distanceKm: 2.8,
    assignedBy: 'municipal-001',
  },
  {
    id: 'dsp-003',
    alertId: 'alt-004',
    hotspotId: 'hs-004',
    resourceId: 'res-002',
    resourceType: 'water_mist_cannon',
    resourceName: 'Anti-Smog Gun Unit 3',
    status: 'completed',
    targetLocation: { lat: 28.7358, lng: 77.1629, address: 'Bhalswa Landfill' },
    assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    departedAt: new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString(),
    arrivedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    distanceKm: 8.5,
    aqiBefore: 420,
    aqiAfter: 285,
    notes: 'Deployed for 90 minutes. AQI reduced by 32%.',
    assignedBy: 'municipal-002',
  },
];

// ─── Sample resources ───────────────────────────────────────────────
const SAMPLE_RESOURCES: MunicipalResource[] = [
  { id: 'res-001', type: 'fire_brigade', name: 'Fire Unit Delta-7', location: { lat: 28.6180, lng: 77.2100 }, isAvailable: false, assignedDispatchId: 'dsp-001', capacity: '4-person crew + fire engine' },
  { id: 'res-002', type: 'water_mist_cannon', name: 'Anti-Smog Gun Unit 3', location: { lat: 28.6500, lng: 77.1800 }, isAvailable: true, capacity: '5000L tank, 100m range' },
  { id: 'res-003', type: 'cleanup_crew', name: 'MCD Ward 45 Crew', location: { lat: 28.6400, lng: 77.2300 }, isAvailable: false, assignedDispatchId: 'dsp-002', capacity: '6-person crew' },
  { id: 'res-004', type: 'water_mist_cannon', name: 'Anti-Smog Gun Unit 1', location: { lat: 28.5800, lng: 77.2600 }, isAvailable: true, capacity: '5000L tank, 100m range' },
  { id: 'res-005', type: 'inspection_team', name: 'DPCC Inspection Team A', location: { lat: 28.6139, lng: 77.2090 }, isAvailable: true, capacity: '3-person team' },
  { id: 'res-006', type: 'road_sweeper', name: 'Mechanical Sweeper MCD-12', location: { lat: 28.6700, lng: 77.2000 }, isAvailable: true, capacity: 'Covers 10km/hr' },
];

// ─── Sample prediction ──────────────────────────────────────────────
function generateSamplePrediction(): AreaPrediction {
  const now = new Date();
  const currentHour = now.getHours();
  
  const forecast = Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHour + i) % 24;
    const ts = new Date(now);
    ts.setHours(hour, 0, 0, 0);
    if (i > 0 && hour <= currentHour) ts.setDate(ts.getDate() + 1);

    // Simulate realistic daily AQI pattern
    // Peak during morning (7-10 AM) and evening rush (5-8 PM)
    // Low during afternoon (1-4 PM) and late night (1-4 AM)
    let baseAqi = 160;
    if (hour >= 7 && hour <= 10) baseAqi = 240 + Math.random() * 60;
    else if (hour >= 17 && hour <= 20) baseAqi = 220 + Math.random() * 50;
    else if (hour >= 13 && hour <= 16) baseAqi = 140 + Math.random() * 30;
    else if (hour >= 1 && hour <= 4) baseAqi = 120 + Math.random() * 20;
    else baseAqi = 170 + Math.random() * 40;

    const aqi = Math.round(baseAqi);
    const category = aqi <= 50 ? 'good' : aqi <= 100 ? 'satisfactory' : aqi <= 200 ? 'moderate' : aqi <= 300 ? 'poor' : aqi <= 400 ? 'very_poor' : 'severe';

    return {
      hour,
      timestamp: ts.toISOString(),
      predictedAqi: aqi,
      category: category as AreaPrediction['currentCategory'],
      confidence: 0.7 + Math.random() * 0.25,
      pm25: Math.round(aqi * 0.45),
      pm10: Math.round(aqi * 0.8),
      dominantPollutant: 'PM2.5',
      factors: {
        weather: hour >= 7 && hour <= 10 ? 0.3 : -0.1,
        historical: 0.5,
        events: 0,
        wind: hour >= 13 && hour <= 16 ? -0.3 : 0.1,
      },
    };
  });

  const peakEntry = forecast.reduce((max, e) => e.predictedAqi > max.predictedAqi ? e : max);
  const safeHours = forecast.filter((e) => e.predictedAqi <= 100).map((e) => e.hour);

  return {
    id: 'pred-delhi-central',
    areaName: 'Central Delhi',
    city: 'Delhi',
    currentAqi: 186,
    currentCategory: 'moderate',
    forecast,
    safeHours,
    peakHour: peakEntry.hour,
    peakAqi: peakEntry.predictedAqi,
    trend: 'worsening',
    lastUpdated: now.toISOString(),
  };
}

// ─── Sample users ───────────────────────────────────────────────────
const SAMPLE_USERS: UserProfile[] = [
  {
    id: 'usr-001', displayName: 'Priya Sharma', email: 'priya@example.com', avatarUrl: '', trustScore: 88, level: 'champion',
    totalReports: 127, verifiedReports: 115, falseFlagCount: 1,
    badges: ['first_report', 'hundred_reports', 'hotspot_hunter', 'streak_30_days', 'community_validator'],
    impactStats: { deploymentsTriggered: 23, hotspotsDetected: 31, upvotesReceived: 456 },
    preferredLanguage: 'en', city: 'Delhi', ward: 'Lajpat Nagar',
    createdAt: '2025-03-15T00:00:00Z', lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'usr-002', displayName: 'Ankit Kumar', email: 'ankit@example.com', avatarUrl: '', trustScore: 76, level: 'sentinel',
    totalReports: 89, verifiedReports: 78, falseFlagCount: 2,
    badges: ['first_report', 'fifty_reports', 'hotspot_hunter', 'night_watch', 'streak_7_days'],
    impactStats: { deploymentsTriggered: 15, hotspotsDetected: 18, upvotesReceived: 312 },
    preferredLanguage: 'hi', city: 'Delhi', ward: 'Okhla',
    createdAt: '2025-05-01T00:00:00Z', lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'usr-003', displayName: 'Rahul Verma', avatarUrl: '', trustScore: 65, level: 'guardian',
    totalReports: 54, verifiedReports: 45, falseFlagCount: 3,
    badges: ['first_report', 'fifty_reports', 'monsoon_reporter'],
    impactStats: { deploymentsTriggered: 8, hotspotsDetected: 12, upvotesReceived: 198 },
    preferredLanguage: 'en', city: 'Delhi',
    createdAt: '2025-07-10T00:00:00Z', lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'usr-004', displayName: 'Mohammed Aziz', avatarUrl: '', trustScore: 58, level: 'guardian',
    totalReports: 42, verifiedReports: 36, falseFlagCount: 1,
    badges: ['first_report', 'ten_reports', 'streak_7_days'],
    impactStats: { deploymentsTriggered: 6, hotspotsDetected: 9, upvotesReceived: 145 },
    preferredLanguage: 'hi', city: 'Delhi', ward: 'ITO',
    createdAt: '2025-09-01T00:00:00Z', lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'usr-005', displayName: 'Sneha Patel', avatarUrl: '', trustScore: 52, level: 'guardian',
    totalReports: 38, verifiedReports: 30, falseFlagCount: 2,
    badges: ['first_report', 'ten_reports'],
    impactStats: { deploymentsTriggered: 5, hotspotsDetected: 7, upvotesReceived: 112 },
    preferredLanguage: 'en', city: 'Delhi',
    createdAt: '2025-11-15T00:00:00Z', lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'usr-006', displayName: 'Deepak Yadav', avatarUrl: '', trustScore: 44, level: 'scout',
    totalReports: 22, verifiedReports: 18, falseFlagCount: 1,
    badges: ['first_report', 'ten_reports'],
    impactStats: { deploymentsTriggered: 3, hotspotsDetected: 4, upvotesReceived: 67 },
    preferredLanguage: 'hi', city: 'Delhi', ward: 'Dwarka',
    createdAt: '2026-01-20T00:00:00Z', lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'usr-007', displayName: 'Kavita Singh', avatarUrl: '', trustScore: 35, level: 'scout',
    totalReports: 15, verifiedReports: 12, falseFlagCount: 0,
    badges: ['first_report', 'ten_reports'],
    impactStats: { deploymentsTriggered: 2, hotspotsDetected: 3, upvotesReceived: 34 },
    preferredLanguage: 'en', city: 'Delhi',
    createdAt: '2026-03-01T00:00:00Z', lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'usr-008', displayName: 'Arti Gupta', avatarUrl: '', trustScore: 28, level: 'observer',
    totalReports: 8, verifiedReports: 6, falseFlagCount: 0,
    badges: ['first_report'],
    impactStats: { deploymentsTriggered: 1, hotspotsDetected: 2, upvotesReceived: 22 },
    preferredLanguage: 'hi', city: 'Delhi',
    createdAt: '2026-05-10T00:00:00Z', lastActiveAt: new Date().toISOString(),
  },
];

// ─── Exports ────────────────────────────────────────────────────────
export function getSampleReports(): PollutionReport[] {
  return SAMPLE_REPORTS;
}

export function getSampleStations(): MonitoringStation[] {
  return SAMPLE_STATIONS;
}

export function getSampleHotspots(): PollutionHotspot[] {
  return SAMPLE_HOTSPOTS;
}

export function getSampleAlerts(): PollutionAlert[] {
  return SAMPLE_ALERTS;
}

export function getSampleDispatches(): DispatchOrder[] {
  return SAMPLE_DISPATCHES;
}

export function getSampleResources(): MunicipalResource[] {
  return SAMPLE_RESOURCES;
}

export function getSamplePrediction(): AreaPrediction {
  return generateSamplePrediction();
}

export function getSampleUsers(): UserProfile[] {
  return SAMPLE_USERS;
}

// Aggregate stats for the dashboard
export function getSampleStats() {
  const reports = getSampleReports();
  const hotspots = getSampleHotspots();
  const alerts = getSampleAlerts();
  const dispatches = getSampleDispatches();
  const stations = getSampleStations();

  const avgAqi = Math.round(
    stations.reduce((sum, s) => sum + (s.latestReading?.aqi ?? 0), 0) / stations.length,
  );

  return {
    totalReportsToday: reports.length,
    activeHotspots: hotspots.filter((h) => h.status !== 'resolved' && h.status !== 'false_alarm').length,
    activeAlerts: alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').length,
    activeDispatches: dispatches.filter((d) => d.status !== 'completed' && d.status !== 'cancelled').length,
    resolvedToday: hotspots.filter((h) => h.status === 'resolved').length + alerts.filter((a) => a.status === 'resolved').length,
    avgCityAqi: avgAqi,
    totalCitizens: 1247,
    stationCount: stations.length,
  };
}
