"use client"

import { DataAnalyticsDashboard } from '@/components/data-analytics-dashboard';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="container py-8">
          <DataAnalyticsDashboard />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
} 