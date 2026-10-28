'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PeriodSelector } from '@/components/PeriodSelector';
import { GroupSelector } from '@/components/GroupSelector';
import { KpiCards } from '@/components/KpiCards';
import { PerformanceChart } from '@/components/PerformanceChart';
import { PagesTable } from '@/components/PagesTable';
import { PageHealthBanner } from '@/components/PageHealthBanner';
import { PayoutReportView } from '@/components/PayoutReportView';
import { CommissionReportView } from '@/components/CommissionReportView';
import { AddPageModal } from '@/components/AddPageModal';
import { AddGroupModal } from '@/components/AddGroupModal';
import { 
  FacebookPage, 
  PageGroup, 
  PayoutProfile,
  MetricSummary, 
  DailyTrendPoint, 
  MOCK_PAGE_GROUPS, 
  MOCK_PAGES, 
  MOCK_PAYOUT_PROFILES,
  getMockPeriodMetrics, 
  getMockDailyTrend,
  getMockPayoutReports,
  getMockUserCommissions
} from '@/lib/mock-data';
import { BarChart2, Landmark, Award, Sparkles, Database } from 'lucide-react';

export default function DashboardPage() {
  // Navigation View Mode: 'overview' (V1 đầy đủ), 'payouts' (Hồ sơ Payout), 'commissions' (Hoa hồng nhân sự)
  const [activeViewMode, setActiveViewMode] = useState<'overview' | 'payouts' | 'commissions'>('overview');
  
  // Core V1 state: Period & Group filtering
  const [period, setPeriod] = useState('7d');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  
  // User Role (Admin vs Member)
  const [userRole, setUserRole] = useState('admin');

  // Metrics & Data
  const [summary, setSummary] = useState<MetricSummary>(getMockPeriodMetrics('7d'));
  const [trendData, setTrendData] = useState<DailyTrendPoint[]>(getMockDailyTrend(7));
  const [pages, setPages] = useState<FacebookPage[]>(MOCK_PAGES);
  const [groups, setGroups] = useState<PageGroup[]>(MOCK_PAGE_GROUPS);
  const [payoutProfiles, setPayoutProfiles] = useState<PayoutProfile[]>(MOCK_PAYOUT_PROFILES);

  // Status & Modals
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBmSyncing, setIsBmSyncing] = useState(false);
  const [isMock, setIsMock] = useState(true);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  // Fetch report data whenever period or group changes
  const fetchReport = async () => {
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
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, selectedGroupId]);

  // V1 Core: Trigger manual sync
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/cron/sync-facebook', { method: 'POST' });
      const data = await res.json();
      alert(`Đồng bộ chỉ số hoàn tất!\nKết quả: ${data.message || `Thành công ${data.succeeded || 0} Trang`}`);
      await fetchReport();
    } catch (err: any) {
      alert(`Lỗi đồng bộ: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // V2 Extension: Trigger BM Sync
  const handleSyncBm = async () => {
    setIsBmSyncing(true);
    setTimeout(() => {
      setIsBmSyncing(false);
      alert('Đồng bộ Business Manager hoàn tất!\n- Phát hiện: 5 Pages trong BM\n- 4 Pages hoạt động bình thường\n- 1 Page đã bị gỡ khỏi BM (đã đánh dấu giữ nguyên lịch sử doanh thu)');
    }, 1200);
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

  // Data for V2 Views
  const payoutReports = getMockPayoutReports(period);
  const userCommissions = getMockUserCommissions(period, userRole);

  return (
    <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 60px' }}>
      
      {/* Header with Role switcher and Actions */}
      <Header
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        onSyncBm={handleSyncBm}
        isBmSyncing={isBmSyncing}
        onOpenAddPage={() => setIsAddPageOpen(true)}
        onOpenAddGroup={() => setIsAddGroupOpen(true)}
        isMock={isMock}
        userRole={userRole}
        onRoleChange={setUserRole}
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

      {/* CẢNH BÁO SỨC KHỎE TRANG (VÀNG, ĐỎ, MẤT ĐỀ XUẤT, GỠ KHỎI BM) */}
      <PageHealthBanner pages={pages} />

      {/* THANH ĐIỀU HƯỚNG PHÂN HỆ (VIEW MODES: V1 CORE vs V2 EXTENSIONS) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '14px'
      }}>
        {/* Module Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`tab-btn ${activeViewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveViewMode('overview')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <BarChart2 size={16} />
            <span>Tổng Quan & Phân Tích Nhóm (V1 Cốt Lõi)</span>
          </button>

          <button
            className={`tab-btn ${activeViewMode === 'payouts' ? 'active' : ''}`}
            onClick={() => setActiveViewMode('payouts')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <Landmark size={16} />
            <span>Báo Cáo Hồ Sơ Payout</span>
          </button>

          <button
            className={`tab-btn ${activeViewMode === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveViewMode('commissions')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <Award size={16} />
            <span>Báo Cáo Hoa Hồng Nhân Sự</span>
          </button>
        </div>

        {/* Chu kỳ thời gian chung cho tất cả các phân hệ */}
        <PeriodSelector
          currentPeriod={period}
          onSelectPeriod={setPeriod}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VIEW 1: V1 CORE TOÀN DIỆN (TỔNG QUAN, NHÓM PAGE, BIỂU ĐỒ, BẢNG TRANG) */}
      {/* ------------------------------------------------------------------ */}
      {activeViewMode === 'overview' && (
        <>
          {/* Bộ lọc theo Nhóm Page ID */}
          <div style={{ marginBottom: '20px' }}>
            <GroupSelector
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              totalPagesCount={pages.length}
            />
          </div>

          {/* 6 Thẻ KPI cốt lõi */}
          <KpiCards summary={summary} />

          {/* Biểu đồ tăng trưởng hàng ngày (Daily Trend SVG) */}
          <PerformanceChart trendData={trendData} period={period} />

          {/* Bảng quản trị danh sách Page chi tiết */}
          <PagesTable
            pages={displayedPages}
            groups={groups}
            payoutProfiles={payoutProfiles}
            period={period}
          />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VIEW 2: BÁO CÁO GOM THEO HỒ SƠ PAYOUT */}
      {/* ------------------------------------------------------------------ */}
      {activeViewMode === 'payouts' && (
        <PayoutReportView
          payoutReports={payoutReports}
          period={period}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VIEW 3: BÁO CÁO HOA HỒNG DOANH THU THÀNH VIÊN */}
      {/* ------------------------------------------------------------------ */}
      {activeViewMode === 'commissions' && (
        <CommissionReportView
          commissions={userCommissions}
          userRole={userRole}
          period={period}
        />
      )}

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
