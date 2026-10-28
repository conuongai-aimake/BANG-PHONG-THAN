export interface PageGroup {
  id: string;
  name: string;
  description: string;
  color_code: string;
}

export interface FacebookPage {
  page_id: string;
  name: string;
  category: string;
  avatar_url?: string;
  is_monetized: boolean;
  monetization_type: string;
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
    token_status: 'active',
    last_synced_at: '2026-10-28 08:00:00',
    group_ids: ['grp-cinema-review']
  },
  {
    page_id: '105829104820192',
    name: 'Khoảnh Khắc Triệu View (Reels)',
    category: 'Video Creator',
    avatar_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=100&auto=format&fit=crop&q=60',
    is_monetized: true,
    monetization_type: 'reels_bonus',
    token_status: 'active',
    last_synced_at: '2026-10-28 08:00:00',
    group_ids: ['grp-reels-network']
  }
];

export const getMockPeriodMetrics = (period: string, groupId?: string): MetricSummary => {
  // Base scale factors by period
  const multiplier = 
    period === '7d' ? 1 :
    period === '28d' ? 3.9 :
    period === '90d' ? 12.5 :
    period === '365d' ? 49.0 :
    period === 'this_month' ? 3.8 : 4.1; // last_month

  // Group scale
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
    
    // Tạo biến động ngẫu nhiên thực tế
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
