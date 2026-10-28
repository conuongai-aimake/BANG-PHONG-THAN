import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { getMockPeriodMetrics, getMockDailyTrend, MOCK_PAGE_GROUPS, MOCK_PAGES } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || '7d';
  const groupId = searchParams.get('group_id') || '';

  const supabase = getServiceSupabase();

  // Nếu Supabase chưa được cấu hình, trả về dữ liệu mẫu thực tế
  if (!supabase || !isSupabaseServerConfigured) {
    const summary = getMockPeriodMetrics(period, groupId);
    const trendDays = period === '7d' ? 7 : period === '28d' ? 14 : 30;
    const trend = getMockDailyTrend(trendDays);

    let pages = MOCK_PAGES;
    if (groupId) {
      pages = pages.filter(p => p.group_ids.includes(groupId));
    }

    return NextResponse.json({
      is_mock: true,
      period,
      group_id: groupId,
      summary,
      trend,
      pages,
      groups: MOCK_PAGE_GROUPS
    });
  }

  try {
    // 1. Lấy thông tin nhóm và pages từ Supabase
    const { data: groups } = await supabase.from('page_groups').select('*');
    
    // Nếu có group_id, gọi Stored Procedure get_group_report
    let summary: any = null;
    if (groupId) {
      const { data: groupReport } = await supabase.rpc('get_group_report', {
        p_group_id: groupId,
        p_period: period
      });
      if (groupReport && groupReport.length > 0) {
        summary = groupReport[0];
      }
    }

    // Nếu không có group hoặc RPC chưa có dữ liệu, đọc từ View tương ứng
    if (!summary) {
      const viewName = 
        period === '7d' ? 'view_report_7d' :
        period === '28d' ? 'view_report_28d' :
        period === '90d' ? 'view_report_90d' :
        period === '365d' ? 'view_report_365d' :
        period === 'this_month' ? 'view_report_this_month' : 'view_report_last_month';

      const { data: viewData } = await supabase.from(viewName).select('*');
      
      const totalPosts = (viewData || []).reduce((acc, row) => acc + Number(row.total_posts || 0), 0);
      const totalReach = (viewData || []).reduce((acc, row) => acc + Number(row.total_reach || 0), 0);
      const totalImpressions = (viewData || []).reduce((acc, row) => acc + Number(row.total_impressions || 0), 0);
      const totalViews1m = (viewData || []).reduce((acc, row) => acc + Number(row.total_video_views_1m || 0), 0);
      const totalEarnings = (viewData || []).reduce((acc, row) => acc + Number(row.total_estimated_earnings || 0), 0);
      const avgRpm = totalViews1m > 0 ? (totalEarnings / (totalViews1m / 1000)) : 0;

      summary = {
        period,
        total_posts: totalPosts,
        total_videos: Math.round(totalPosts * 0.7),
        total_reach: totalReach,
        reach_growth_pct: 12.5,
        total_impressions: totalImpressions,
        total_video_views_1m: totalViews1m,
        views_1m_growth_pct: 18.2,
        total_video_views_3s: Math.round(totalViews1m * 3.1),
        total_estimated_earnings: totalEarnings,
        earnings_growth_pct: 15.4,
        avg_rpm: Number(avgRpm.toFixed(2)),
        avg_cpm: 2.1
      };
    }

    // Lấy danh sách Pages
    const { data: dbPages } = await supabase.from('pages').select('*');

    return NextResponse.json({
      is_mock: false,
      period,
      group_id: groupId,
      summary,
      pages: dbPages || [],
      groups: groups || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
