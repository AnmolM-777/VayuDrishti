'use client';

import { useState, useEffect } from 'react';
import type { AreaPrediction } from '@/types/prediction';
import { PageHeader } from '@/components/feedback/page-header';
import { ForecastChart } from '@/components/predictions/forecast-chart';
import { HourlyBreakdown } from '@/components/predictions/hourly-breakdown';
import { SafeHours } from '@/components/predictions/safe-hours';
import { TrendingUp } from 'lucide-react';

export default function PredictionsPage() {
  const [prediction, setPrediction] = useState<AreaPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const currentHour = new Date().getHours();

  useEffect(() => {
    fetch('/api/predictions')
      .then((r) => r.json())
      .then((data) => {
        setPrediction(data.prediction ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="24-Hour Predictions"
        description="AI-powered AQI forecast combining weather patterns, historical trends, and live sensor data."
      />

      {loading ? (
        <div className="space-y-4">
          <div className="bg-card border-border h-64 animate-pulse rounded-xl border" />
          <div className="bg-card border-border h-40 animate-pulse rounded-xl border" />
          <div className="bg-card border-border h-48 animate-pulse rounded-xl border" />
        </div>
      ) : !prediction ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <TrendingUp className="text-muted-foreground mb-3 size-12" />
          <p className="font-medium">Prediction data unavailable</p>
          <p className="text-muted-foreground mt-1 text-sm">
            The prediction engine is warming up. Try again shortly.
          </p>
        </div>
      ) : (
        <>
          <ForecastChart prediction={prediction} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SafeHours
              safeHours={prediction.safeHours}
              forecast={prediction.forecast}
            />
            <div className="bg-card border-border space-y-3 rounded-xl border p-5">
              <h3 className="font-semibold">Prediction Factors</h3>
              {prediction.forecast.slice(0, 1).map((f) => (
                <div key={f.hour} className="space-y-2.5">
                  {[
                    {
                      label: 'Historical Baseline',
                      value: f.factors.historical,
                      desc: 'Based on past 30-day patterns',
                    },
                    {
                      label: 'Weather Impact',
                      value: f.factors.weather,
                      desc: 'Temperature, humidity, wind',
                    },
                    {
                      label: 'Wind Dispersal',
                      value: f.factors.wind,
                      desc: 'Pollutant dilution via wind',
                    },
                    {
                      label: 'Special Events',
                      value: f.factors.events,
                      desc: 'Local events & industrial activity',
                    },
                  ].map(({ label, value, desc }) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium">{label}</span>
                        <span
                          className={
                            value >= 0 ? 'text-red-400' : 'text-emerald-400'
                          }
                        >
                          {value >= 0 ? '+' : ''}
                          {(value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="bg-secondary h-1.5 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.abs(value) * 100}%`,
                            backgroundColor: value >= 0 ? '#f97316' : '#22c55e',
                            marginLeft:
                              value < 0
                                ? `${(1 - Math.abs(value)) * 100}%`
                                : undefined,
                          }}
                        />
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-[10px]">
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <HourlyBreakdown
            forecast={prediction.forecast}
            currentHour={currentHour}
          />
        </>
      )}
    </div>
  );
}
