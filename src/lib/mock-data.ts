export interface PayoutProfile {
  id: string;
  meta_payout_id: string;
  name: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  tax_id: string;
  currency: string;
  status: string;
}

export interface PageGroup {
  id: string;
  name: string;
  description: string;
  color_code: string;
}

export type MonetizationHealth = 'eligible' | 'restricted' | 'demonetized';
export type RecommendationHealth = 'normal' | 'warning' | 'dropped';
export type BmSyncStatus = 'active' | 'removed_from_bm' | 'permission_lost';

export interface FacebookPage {
  page_id: string;
  name: string;
  category: string;
  avatar_url?: string;
  is_monetized: boolean;
  monetization_type: string;
  monetization_status: MonetizationHealth;
  recommendation_status: RecommendationHealth;
  bm_sync_status: BmSyncStatus;
  payout_profile_id?: string;
  token_status: string;
  last_synced_at: string;
  group_ids: string[];
}

export interface MetricSummary {
  period: string;
  total_posts: number;
  total_videos: number;
  total_reach: number;
  reach_growth_pct: number;
  total_impressions: number;
  total_video_views_1m: number;
  views_1m_growth_pct: number;
  total_video_views_3s: number;
  total_estimated_earnings: number;
  earnings_growth_pct: number;
  avg_rpm: number;
  avg_cpm: number;
}

export interface DailyTrendPoint {
  date: string;
  display_date: string;
  reach: number;
  video_views_1m: number;
  video_views_3s: number;
  earnings: number;
  posts: number;
}

export interface PayoutReportItem {
  payout_id: string;
  payout_name: string;
  account_holder: string;
  bank_name: string;
  total_pages: number;
  pages_list: string[];
  total_earnings: number;
  status: string;
}

export interface UserCommissionItem {
  user_id: string;
  user_name: string;
  user_role: string;
  page_id: string;
  page_name: string;
  commission_rate_pct: number;
  page_total_earnings: number;
  user_payout_amount: number;
}

// ----------------------------------------------------------------------------
// MOCK DATA: HỒ SƠ PAYOUT
// ----------------------------------------------------------------------------
export const MOCK_PAYOUT_PROFILES: PayoutProfile[] = [
  {
    id: 'payout-vcb-main',
    meta_payout_id: 'PAY-META-889921',
    name: 'Tài Khoản VCB Doanh Nghiệp (Team Phim)',
    account_holder: 'CONG TY TNHH MEDIA PRO',
    bank_name: 'Vietcombank - CN Tân Bình',
    account_number: '**** **** 8829',
    tax_id: '0318928192',
    currency: 'USD',
    status: 'active'
  },
  {
    id: 'payout-tcb-personal',
    meta_payout_id: 'PAY-META-443312',
    name: 'Tài Khoản Techcombank (Team Giải Trí & Reels)',
    account_holder: 'NGUYEN VAN A',
    bank_name: 'Techcombank - CN Hội Sở',
    account_number: '**** **** 9012',
    tax_id: '8092819201',
    currency: 'USD',
    status: 'active'
  }
];

export const MOCK_PAGE_GROUPS: PageGroup[] = [
  {
    id: 'grp-entertainment',
    name: 'Nhóm Giải Trí & Showbiz',
    description: 'Tập hợp các Page tin tức giải trí, video hài hước (Page IDs: 109283..., 104829...)',
    color_code: '#8B5CF6'
  },
  {
    id: 'grp-cinema-review',
    name: 'Nhóm Review & Điện Ảnh',
    description: 'Các Page tóm tắt phim, review điện ảnh bật kiếm tiền In-stream Ads',
    color_code: '#3B82F6'
  },
  {
    id: 'grp-reels-network',
    name: 'Mạng Lưới Kênh Reels / Shorts',
    description: 'Hệ thống Page chuyên sản xuất Reels ngắn nhận bonus Meta',
    color_code: '#10B981'
  }
];

export const MOCK_PAGES: FacebookPage[] = [
  {
    page_id: '109283748291029',
    name: 'Góc Giải Trí 24h',
    category: 'Media / News Company',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    is_monetized: true,
    monetization_type: 'in_stream_ads',
    monetization_status: 'eligible', // 🟢 Xanh
    recommendation_status: 'normal',
    bm_sync_status: 'active',
    payout_profile_id: 'payout-tcb-personal',
    token_status: 'active',
    last_synced_at: '2026-10-28 08:00:00',
    group_ids: ['grp-entertainment']
  },
  {
    page_id: '102938475618293',
    name: 'Thế Giới Điện Ảnh & Phim Hay',
    category: 'Entertainment Website',
    avatar_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&auto=format&fit=crop&q=60',
    is_monetized: true,
    monetization_type: 'in_stream_ads',
    monetization_status: 'eligible', // 🟢 Xanh
    recommendation_status: 'normal',
    bm_sync_status: 'active',
    payout_profile_id: 'payout-vcb-main',
    token_status: 'active',
    last_synced_at: '2026-10-28 08:00:00',
    group_ids: ['grp-cinema-review']
  },
  {
    page_id: '104829104829104',
    name: 'Đời Sống Showbiz Plus',
    category: 'News & Media',
    avatar_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60',
    is_monetized: true,
    monetization_type: 'in_stream_ads',
    monetization_status: 'restricted', // 🟡 Bị vàng - Hạn chế kiếm tiền
    recommendation_status: 'warning',
    bm_sync_status: 'active',
    payout_profile_id: 'payout-tcb-personal',
    token_status: 'active',
    last_synced_at: '2026-10-28 08:00:00',
    group_ids: ['grp-entertainment']
  },
  {
    page_id: '109482019482019',
    name: 'Vũ Trụ Phim Chiếu Rạp',
    category: 'Film Review',
    avatar_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=60',
    is_monetized: true,
    monetization_type: 'in_stream_ads',
    monetization_status: 'eligible',
    recommendation_status: 'dropped', // ⚠️ MẤT ĐỀ XUẤT (Viral ratio drop > 65%)
    bm_sync_status: 'active',
    payout_profile_id: 'payout-vcb-main',
    token_status: 'active',
    last_synced_at: '2026-10-28 08:00:00',
    group_ids: ['grp-cinema-review']
  },
  {
    page_id: '105829104820192',
    name: 'Khoảnh Khắc Triệu View (Reels)',
    category: 'Video Creator',
    avatar_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=100&auto=format&fit=crop&q=60',
    is_monetized: false, // 🔴 Bị tắt kiếm tiền
    monetization_type: 'reels_bonus',
    monetization_status: 'demonetized',
    recommendation_status: 'dropped',
    bm_sync_status: 'removed_from_bm', // ❌ Đã bị gỡ khỏi BM
    payout_profile_id: 'payout-tcb-personal',
    token_status: 'expired',
    last_synced_at: '2026-10-25 08:00:00',
    group_ids: ['grp-reels-network']
  }
];

export const getMockPeriodMetrics = (period: string, groupId?: string): MetricSummary => {
  const multiplier = 
    period === '7d' ? 1 :
    period === '28d' ? 3.9 :
    period === '90d' ? 12.5 :
    period === '365d' ? 49.0 :
    period === 'this_month' ? 3.8 : 4.1;

  const groupScale = groupId ? 0.45 : 1.0;
  const earnings = Math.round(1840.50 * multiplier * groupScale * 100) / 100;
  const views1m = Math.round(3150000 * multiplier * groupScale);
  const reach = Math.round(12400000 * multiplier * groupScale);
  const posts = Math.round(56 * multiplier * groupScale);
  const videos = Math.round(posts * 0.75);

  return {
    period,
    total_posts: posts,
    total_videos: videos,
    total_reach: reach,
    reach_growth_pct: 14.8,
    total_impressions: Math.round(reach * 1.6),
    total_video_views_1m: views1m,
    views_1m_growth_pct: 22.4,
    total_video_views_3s: Math.round(views1m * 3.4),
    total_estimated_earnings: earnings,
    earnings_growth_pct: 18.2,
    avg_rpm: Number((earnings / (views1m / 1000)).toFixed(2)),
    avg_cpm: 2.45
  };
};

export const getMockDailyTrend = (days: number = 7): DailyTrendPoint[] => {
  const points: DailyTrendPoint[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;
    
    const baseFactor = 1 + (Math.sin(i * 1.2) * 0.25);
    const views1m = Math.round(420000 * baseFactor);
    const earnings = Math.round((views1m * 0.00062) * 100) / 100;
    const reach = Math.round(views1m * 3.8);

    points.push({
      date: dateStr,
      display_date: displayDate,
      reach,
      video_views_1m: views1m,
      video_views_3s: Math.round(views1m * 3.2),
      earnings,
      posts: Math.floor(6 + Math.random() * 4)
    });
  }

  return points;
};

// ----------------------------------------------------------------------------
// BÁO CÁO THEO HỒ SƠ PAYOUT
// ----------------------------------------------------------------------------
export const getMockPayoutReports = (period: string): PayoutReportItem[] => {
  const multiplier = 
    period === '7d' ? 1 :
    period === '28d' ? 3.9 :
    period === 'this_month' ? 3.8 : 4.1;

  return [
    {
      payout_id: 'payout-vcb-main',
      payout_name: 'Tài Khoản VCB Doanh Nghiệp (Team Phim)',
      account_holder: 'CONG TY TNHH MEDIA PRO',
      bank_name: 'Vietcombank (**** 8829)',
      total_pages: 2,
      pages_list: ['Thế Giới Điện Ảnh & Phim Hay', 'Vũ Trụ Phim Chiếu Rạp'],
      total_earnings: Math.round(1120.40 * multiplier * 100) / 100,
      status: 'active'
    },
    {
      payout_id: 'payout-tcb-personal',
      payout_name: 'Tài Khoản Techcombank (Team Giải Trí & Reels)',
      account_holder: 'NGUYEN VAN A',
      bank_name: 'Techcombank (**** 9012)',
      total_pages: 3,
      pages_list: ['Góc Giải Trí 24h', 'Đời Sống Showbiz Plus', 'Khoảnh Khắc Triệu View'],
      total_earnings: Math.round(720.10 * multiplier * 100) / 100,
      status: 'active'
    }
  ];
};

// ----------------------------------------------------------------------------
// BÁO CÁO HOA HỒNG THÀNH VIÊN
// ----------------------------------------------------------------------------
export const getMockUserCommissions = (period: string, userRole: string = 'member'): UserCommissionItem[] => {
  const multiplier = 
    period === '7d' ? 1 :
    period === '28d' ? 3.9 :
    period === 'this_month' ? 3.8 : 4.1;

  // Nếu là Member (Editor Minh Tuấn)
  if (userRole === 'member') {
    const page1Earnings = Math.round(680.00 * multiplier * 100) / 100;
    const page2Earnings = Math.round(440.40 * multiplier * 100) / 100;
    return [
      {
        user_id: 'usr-minh-tuan',
        user_name: 'Minh Tuấn (Editor Phim)',
        user_role: 'member',
        page_id: '102938475618293',
        page_name: 'Thế Giới Điện Ảnh & Phim Hay',
        commission_rate_pct: 25.0, // Hưởng 25% doanh thu
        page_total_earnings: page1Earnings,
        user_payout_amount: Math.round(page1Earnings * 0.25 * 100) / 100
      },
      {
        user_id: 'usr-minh-tuan',
        user_name: 'Minh Tuấn (Editor Phim)',
        user_role: 'member',
        page_id: '109482019482019',
        page_name: 'Vũ Trụ Phim Chiếu Rạp',
        commission_rate_pct: 20.0, // Hưởng 20% doanh thu
        page_total_earnings: page2Earnings,
        user_payout_amount: Math.round(page2Earnings * 0.20 * 100) / 100
      }
    ];
  }

  // Nếu là Admin: xem bảng tổng hợp hoa hồng của tất cả nhân sự
  return [
    {
      user_id: 'usr-minh-tuan',
      user_name: 'Minh Tuấn (Editor Phim)',
      user_role: 'member',
      page_id: '102938475618293',
      page_name: 'Thế Giới Điện Ảnh & Phim Hay',
      commission_rate_pct: 25.0,
      page_total_earnings: Math.round(680.00 * multiplier * 100) / 100,
      user_payout_amount: Math.round(680.00 * multiplier * 0.25 * 100) / 100
    },
    {
      user_id: 'usr-hoang-long',
      user_name: 'Hoàng Long (Lead Team Giải Trí)',
      user_role: 'manager',
      page_id: '109283748291029',
      page_name: 'Góc Giải Trí 24h',
      commission_rate_pct: 30.0,
      page_total_earnings: Math.round(520.00 * multiplier * 100) / 100,
      user_payout_amount: Math.round(520.00 * multiplier * 0.30 * 100) / 100
    },
    {
      user_id: 'usr-lan-anh',
      user_name: 'Lan Anh (Content Creator)',
      user_role: 'member',
      page_id: '104829104829104',
      page_name: 'Đời Sống Showbiz Plus',
      commission_rate_pct: 20.0,
      page_total_earnings: Math.round(200.10 * multiplier * 100) / 100,
      user_payout_amount: Math.round(200.10 * multiplier * 0.20 * 100) / 100
    }
  ];
};
