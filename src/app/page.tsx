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
import { FacebookConnectModal } from '@/components/FacebookConnectModal';
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
import { BarChart2, Landmark, Award, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [activeViewMode, setActiveViewMode] = useState<'overview' | 'payouts' | 'commissions'>('overview');
  const [period, setPeriod] = useState('7d');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [userRole, setUserRole] = useState('admin');

  const [summary, setSummary] = useState<MetricSummary>(getMockPeriodMetrics('7d'));
  const [trendData, setTrendData] = useState<DailyTrendPoint[]>(getMockDailyTrend(7));
  const [pages, setPages] = useState<FacebookPage[]>(MOCK_PAGES);
  const [groups, setGroups] = useState<PageGroup[]>(MOCK_PAGE_GROUPS);
  const [payoutProfiles, setPayoutProfiles] = useState<PayoutProfile[]>(MOCK_PAYOUT_PROFILES);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isBmSyncing, setIsBmSyncing] = useState(false);
  const [isMock, setIsMock] = useState(true);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isFacebookConnectOpen, setIsFacebookConnectOpen] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReport = async () => {
    try {
      const url = `/api/reports?period=${period}${selectedGroupId ? `&group_id=${selectedGroupId}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        if (data.trend) setTrendData(data.trend);
        if (data.pages && data.pages.length > 0) setPages(data.pages);
        if (data.groups && data.groups.length > 0) setGroups(data.groups);
        setIsMock(Boolean(data.is_mock));
      }
    } catch (err) {
      console.error('Error loading report:', err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, selectedGroupId]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/cron/sync-facebook', { method: 'POST' });
      const data = await res.json();
      setToastMessage({
        type: 'success',
        text: `Đồng bộ chỉ số hoàn tất! ${data.message || `Thành công ${data.succeeded || 0} Trang`}`
      });
      await fetchReport();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: `Lỗi đồng bộ: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncBm = async () => {
    setIsBmSyncing(true);
    setTimeout(() => {
      setIsBmSyncing(false);
      setToastMessage({
        type: 'success',
        text: 'Đồng bộ Business Manager hoàn tất: Phát hiện 5 Pages trong BM, 4 Pages hoạt động bình thường, 1 Page đã bị gỡ khỏi BM.'
      });
    }, 1200);
  };

  const handlePageAdded = (newPage: FacebookPage) => {
    setPages(prev => [newPage, ...prev]);
    fetchReport();
  };

  const handleGroupAdded = (newGroup: PageGroup) => {
    setGroups(prev => [...prev, newGroup]);
  };

  const handleFacebookConnectSuccess = (count: number) => {
    setToastMessage({
      type: 'success',
      text: `Kết nối Facebook thành công! Đã tự động quét và lưu ${count} Trang vào cơ sở dữ liệu.`
    });
    fetchReport();
  };

  const displayedPages = selectedGroupId
    ? pages.filter(p => p.group_ids && p.group_ids.includes(selectedGroupId))
    : pages;

  const payoutReports = getMockPayoutReports(period);
  const userCommissions = getMockUserCommissions(period, userRole);

  return (
    <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 60px' }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
          color: toastMessage.type === 'success' ? '#34D399' : '#F87171',
          fontSize: '0.85rem',
          fontWeight: 500
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toastMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{toastMessage.text}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        onSyncBm={handleSyncBm}
        isBmSyncing={isBmSyncing}
        onOpenAddPage={() => setIsAddPageOpen(true)}
        onOpenAddGroup={() => setIsAddGroupOpen(true)}
        onOpenFacebookConnect={() => setIsFacebookConnectOpen(true)}
        isMock={isMock}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      {/* SỨC KHỎE TRANG & CẢNH BÁO MẤT ĐỀ XUẤT */}
      <PageHealthBanner pages={pages} />

      {/* THANH ĐIỀU HƯỚNG PHÂN HỆ */}
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`tab-btn ${activeViewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveViewMode('overview')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <BarChart2 size={16} />
            <span>Tổng Quan & Phân Tích Nhóm (V1)</span>
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

        <PeriodSelector
          currentPeriod={period}
          onSelectPeriod={setPeriod}
        />
      </div>

      {/* VIEW 1: V1 CORE TOÀN DIỆN */}
      {activeViewMode === 'overview' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <GroupSelector
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              totalPagesCount={pages.length}
            />
          </div>

          <KpiCards summary={summary} />
          <PerformanceChart trendData={trendData} period={period} />
          <PagesTable
            pages={displayedPages}
            groups={groups}
            payoutProfiles={payoutProfiles}
            period={period}
          />
        </>
      )}

      {/* VIEW 2: HỒ SƠ PAYOUT */}
      {activeViewMode === 'payouts' && (
        <PayoutReportView
          payoutReports={payoutReports}
          period={period}
        />
      )}

      {/* VIEW 3: HOA HỒNG THÀNH VIÊN */}
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

      <FacebookConnectModal
        isOpen={isFacebookConnectOpen}
        onClose={() => setIsFacebookConnectOpen(false)}
        onSuccess={handleFacebookConnectSuccess}
      />
    </main>
  );
}
