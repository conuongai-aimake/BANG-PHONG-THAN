/**
 * META GRAPH API INTEGRATION SERVICE
 * Phiên bản Graph API v19.0
 */

export interface MetaPageInsights {
  metric_date: string;
  posts_count: number;
  videos_count: number;
  reach: number;
  impressions: number;
  engagements: number;
  video_views_3s: number;
  video_views_1m: number;
  video_view_time_sec: number;
  estimated_earnings: number;
  rpm: number;
  cpm: number;
  followers_net: number;
  raw_response?: any;
}

export class MetaGraphService {
  private baseUrl = 'https://graph.facebook.com/v19.0';

  /**
   * Đồng bộ chỉ số của 1 Page cho 1 ngày cụ thể (mặc định là ngày hôm qua)
   */
  async fetchPageDailyMetrics(pageId: string, accessToken: string, targetDate?: string): Promise<MetaPageInsights> {
    // Tính toán mốc thời gian ngày cần lấy (Mặc định hôm qua)
    const date = targetDate ? new Date(targetDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const startTimestamp = Math.floor(new Date(`${dateStr}T00:00:00Z`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${dateStr}T23:59:59Z`).getTime() / 1000);

    try {
      // 1. Lấy số lượng bài đăng trong ngày
      const postsCount = await this.getPublishedPostsCount(pageId, accessToken, startTimestamp, endTimestamp);

      // 2. Lấy Page Insights
      const insightsData = await this.getPageInsights(pageId, accessToken, startTimestamp, endTimestamp);

      // 3. Lấy Monetization Insights (nếu Page đã bật kiếm tiền)
      const monetizationData = await this.getMonetizationInsights(pageId, accessToken, startTimestamp, endTimestamp);

      return {
        metric_date: dateStr,
        posts_count: postsCount.total,
        videos_count: postsCount.videos,
        reach: insightsData.reach || 0,
        impressions: insightsData.impressions || 0,
        engagements: insightsData.engagements || 0,
        video_views_3s: insightsData.video_views_3s || 0,
        video_views_1m: insightsData.video_views_1m || 0,
        video_view_time_sec: insightsData.video_view_time_sec || 0,
        estimated_earnings: monetizationData.earnings || 0,
        rpm: monetizationData.rpm || 0,
        cpm: monetizationData.cpm || 0,
        followers_net: insightsData.followers_net || 0,
        raw_response: { insightsData, monetizationData }
      };
    } catch (error: any) {
      console.error(`[MetaGraphService] Error fetching for page ${pageId}:`, error.message);
      throw error;
    }
  }

  /**
   * Đếm số lượng bài đăng và video xuất bản trong ngày
   */
  private async getPublishedPostsCount(pageId: string, accessToken: string, since: number, until: number) {
    const url = `${this.baseUrl}/${pageId}/published_posts?since=${since}&until=${until}&fields=id,created_time,attachments{media_type}&limit=100&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { total: 0, videos: 0 };
    }
    const data = await res.json();
    const posts = data.data || [];
    let videoCount = 0;
    posts.forEach((p: any) => {
      const type = p.attachments?.data?.[0]?.media_type;
      if (type === 'video' || type === 'reel') videoCount++;
    });

    return {
      total: posts.length,
      videos: videoCount
    };
  }

  /**
   * Gọi Insights API lấy tương tác và lượt xem video
   */
  private async getPageInsights(pageId: string, accessToken: string, since: number, until: number) {
    const metrics = [
      'page_impressions',
      'page_impressions_unique',
      'page_engaged_users',
      'page_video_views',
      'page_video_views_click_to_play',
      'page_video_view_time'
    ].join(',');

    const url = `${this.baseUrl}/${pageId}/insights?metric=${metrics}&period=day&since=${since}&until=${until}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) {
      return {};
    }
    const data = await res.json();
    const result: any = {};

    (data.data || []).forEach((item: any) => {
      const val = item.values?.[0]?.value || 0;
      if (item.name === 'page_impressions_unique') result.reach = val;
      if (item.name === 'page_impressions') result.impressions = val;
      if (item.name === 'page_engaged_users') result.engagements = val;
      if (item.name === 'page_video_views') result.video_views_3s = val;
      if (item.name === 'page_video_views_click_to_play') result.video_views_1m = val;
      if (item.name === 'page_video_view_time') result.video_view_time_sec = Math.round(val / 1000);
    });

    return result;
  }

  /**
   * Lấy doanh thu ước tính từ Creator / In-Stream Ads Insights
   */
  private async getMonetizationInsights(pageId: string, accessToken: string, since: number, until: number) {
    try {
      const metrics = 'page_daily_video_ad_break_earnings,page_daily_video_ad_break_ad_impressions,page_daily_video_ad_break_cpm';
      const url = `${this.baseUrl}/${pageId}/insights?metric=${metrics}&period=day&since=${since}&until=${until}&access_token=${accessToken}`;
      const res = await fetch(url);
      if (!res.ok) {
        return { earnings: 0, rpm: 0, cpm: 0 };
      }
      const data = await res.json();
      const result: any = { earnings: 0, rpm: 0, cpm: 0 };

      (data.data || []).forEach((item: any) => {
        const val = item.values?.[0]?.value || 0;
        if (item.name === 'page_daily_video_ad_break_earnings') result.earnings = Number(val);
        if (item.name === 'page_daily_video_ad_break_cpm') result.cpm = Number(val);
      });

      return result;
    } catch {
      return { earnings: 0, rpm: 0, cpm: 0 };
    }
  }
}

export const metaGraphService = new MetaGraphService();
