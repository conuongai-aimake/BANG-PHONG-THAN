'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PeriodSelector } from '@/components/PeriodSelector';
import { GroupSelector } from '@/components/GroupSelector';
import { KpiCards } from '@/components/KpiCards';
import { PerformanceChart } from '@/components/PerformanceChart';
import { PagesTable } from '@/components/PagesTable';
import { AddPageModal } from '@/components/AddPageModal';
import { AddGroupModal } from '@/components/AddGroupModal';
import { FacebookPage, PageGroup, MetricSummary, DailyTrendPoint, MOCK_PAGE_GROUPS, MOCK_PAGES, getMockPeriodMetrics, getMockDailyTrend } from '@/lib/mock-data';
import { Info, Sparkles, ExternalLink, Database } from 'lucide-react';

export default function DashboardPage() {
  const [period, setPeriod] = useState('7d');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  
  const [summary, setSummary] = useState<MetricSummary>(getMockPeriodMetrics('7d'));
  const [trendData, setTrendData] = useState<DailyTrendPoint[]>(getMockDailyTrend(7));
  const [pages, setPages] = useState<FacebookPage[]>(MOCK_PAGES);
  const [groups, setGroups] = useState<PageGroup[]>(MOCK_PAGE_GROUPS);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMock, setIsMock] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  // Fetch report data whenever period or group changes
  const fetchReport = async () => {
    setLoading(true);
    try {
      const url = `/api/reports?period=${period}${selectedGroupId ? `&group_id=${selectedGroupId}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        if (data.trend) setTrendData(data.trend);
        if (data.pages) setPages(data.pages);
        if (data.groups) setGroups(data.groups);
        setIsMock(Boolean(data.is_mock));
      }
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, selectedGroupId]);

  // Trigger manual sync
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/cron/sync-facebook', { method: 'POST' });
      const data = await res.json();
      alert(`Đồng bộ hoàn tất!\nKết quả: ${data.message || `Thành công ${data.succeeded || 0} Trang`}`);
      await fetchReport();
    } catch (err: any) {
      alert(`Lỗi đồng bộ: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePageAdded = (newPage: FacebookPage) => {
    setPages(prev => [newPage, ...prev]);
    fetchReport();
  };

  const handleGroupAdded = (newGroup: PageGroup) => {
    setGroups(prev => [...prev, newGroup]);
  };

  // Filter pages by selected group
  const displayedPages = selectedGroupId
    ? pages.filter(p => p.group_ids && p.group_ids.includes(selectedGroupId))
    : pages;

  return (
    <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 60px' }}>
      
      {/* Header */}
      <Header
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        onOpenAddPage={() => setIsAddPageOpen(true)}
        onOpenAddGroup={() => setIsAddGroupOpen(true)}
        isMock={isMock}
      />

      {/* Supabase & Meta connection banner */}
      {isMock && (
        <div className="glass-panel" style={{
          padding: '14px 20px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#A78BFA" />
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>Hệ thống đang chạy chế độ dữ liệu mẫu trực quan. </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Để kết nối cơ sở dữ liệu thật, hãy chạy file <code>database-schema.sql</code> trên Supabase và điền khóa trong <code>.env.local</code>.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="outline-btn"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              <Database size={13} />
              Mở Supabase
            </a>
          </div>
        </div>
      )}

      {/* Filter Toolbar: Group Selector + Period Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* Nhóm Page Filter */}
        <GroupSelector
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          totalPagesCount={pages.length}
        />

        {/* Chu kỳ thời gian */}
        <PeriodSelector
          currentPeriod={period}
          onSelectPeriod={setPeriod}
        />
      </div>

      {/* Key Metric KPI Cards */}
      <KpiCards summary={summary} />

      {/* Daily Performance Trend Chart */}
      <PerformanceChart trendData={trendData} period={period} />

      {/* Pages Detailed Table */}
      <PagesTable pages={displayedPages} groups={groups} period={period} />

      {/* Modals */}
      <AddPageModal
        isOpen={isAddPageOpen}
        onClose={() => setIsAddPageOpen(false)}
        groups={groups}
        onPageAdded={handlePageAdded}
      />

      <AddGroupModal
        isOpen={isAddGroupOpen}
        onClose={() => setIsAddGroupOpen(false)}
        onGroupAdded={handleGroupAdded}
      />
    </main>
  );
}
