'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/feedback/page-header';
import { ReportForm } from '@/components/reports/report-form';
import { ReportHistory } from '@/components/reports/report-history';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Pollution"
        description="Capture and submit pollution incidents. AI will classify the source and alert municipal teams."
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit">
        {([
          { key: 'submit', label: '📸 Submit Report' },
          { key: 'history', label: '📋 My Reports' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'submit' ? <ReportForm /> : <ReportHistory />}
    </div>
  );
}
