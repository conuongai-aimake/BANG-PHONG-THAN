/**
 * META GRAPH API INTEGRATION SERVICE
 * Hỗ trợ chuẩn Graph API v23.0 và backward-compatible v19.0+
 */

export interface ContentMonetizationResult {
  amount?: number;
  micro_amount?: number;
  currency?: string;
  is_available: boolean;
  raw?: any;
}

export interface ApproximateEarningsResult {
  approximate_amount?: number;
  raw_value?: any;
  has_currency: boolean;
  currency?: string;
  is_available: boolean;
  raw?: any;
}

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
  earnings_currency?: string;
  content_monetization?: ContentMonetizationResult;
  approximate_monetization?: ApproximateEarningsResult;
  rpm: number;
  cpm: number;
  followers_net: number;
  raw_response?: any;
}

export class MetaGraphService {
  private baseUrl = 'https://graph.facebook.com/v23.0';
  private legacyBaseUrl = 'https://graph.facebook.com/v19.0';

  /**
   * Đồng bộ chỉ số của 1 Page cho 1 ngày cụ thể (mặc định là ngày hôm qua)
   */
  async fetchPageDailyMetrics(pageId: string, accessToken: string, targetDate?: string): Promise<MetaPageInsights> {
    const date = targetDate ? new Date(targetDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const startTimestamp = Math.floor(new Date(`${dateStr}T00:00:00Z`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${dateStr}T23:59:59Z`).getTime() / 1000);

    try {
      // 1. Lấy số lượng bài đăng & video trong ngày
      const postsCount = await this.getPublishedPostsCount(pageId, accessToken, startTimestamp, endTimestamp);

      // 2. Lấy Page Insights cơ bản
      const insightsData = await this.getPageInsights(pageId, accessToken, startTimestamp, endTimestamp);

      // 3. Lấy Monetization Insights qua các endpoint chuyên biệt Graph API v23.0
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
        earnings_currency: monetizationData.currency,
        content_monetization: monetizationData.content_earnings,
        approximate_monetization: monetizationData.approximate_earnings,
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
    try {
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
    } catch {
      return { total: 0, videos: 0 };
    }
  }

  /**
   * Gọi Insights API lấy tương tác và lượt xem video
   */
  private async getPageInsights(pageId: string, accessToken: string, since: number, until: number) {
    try {
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
    } catch {
      return {};
    }
  }

  /**
   * METRIC 1 (Graph API v23.0): POST /{page_id}/content_monetization_earnings
   * Hỗ trợ cấp Page và cấp bài đăng /{page_id}_{asset_id}/content_monetization_earnings.
   * Xử lý trường micro_amount (1 đơn vị tiền tệ = 1,000,000 micro_amount) kèm currency.
   */
  async fetchContentMonetizationEarnings(
    targetId: string,
    accessToken: string,
    options?: { since?: number; until?: number; breakdown?: string }
  ): Promise<ContentMonetizationResult> {
    try {
      const url = new URL(`${this.baseUrl}/${targetId}/content_monetization_earnings`);
      url.searchParams.set('access_token', accessToken);
      if (options?.since) url.searchParams.set('since', String(options.since));
      if (options?.until) url.searchParams.set('until', String(options.until));
      if (options?.breakdown) url.searchParams.set('breakdown', options.breakdown);

      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        return { is_available: false };
      }

      const data = await res.json();
      
      // Parse dữ liệu trả về
      let amount: number | undefined;
      let microAmount: number | undefined;
      let currency: string | undefined;

      const item = Array.isArray(data.data) ? data.data[0] : data;
      if (item) {
        if (item.micro_amount !== undefined) {
          microAmount = Number(item.micro_amount);
          amount = microAmount / 1_000_000;
        } else if (item.amount !== undefined) {
          amount = Number(item.amount);
        }
        if (item.currency) {
          currency = String(item.currency).toUpperCase();
        }
      }

      return {
        amount,
        micro_amount: microAmount,
        currency,
        is_available: amount !== undefined,
        raw: data
      };
    } catch (err) {
      console.warn(`[MetaGraphService] content_monetization_earnings unavailable for ${targetId}:`, err);
      return { is_available: false };
    }
  }

  /**
   * METRIC 2 (Graph API v23.0): POST /{page_id}/monetization_approximate_earnings
   * Doanh thu ước tính (không phải thanh toán cuối cùng, có thể thay đổi do kiểm duyệt/bản quyền).
   * LƯU Ý QUAN TRỌNG: Có thể trả về số thuần không kèm currency/unit.
   * KHÔNG được tự động coi mọi giá trị là USD nếu API không trả currency.
   */
  async fetchMonetizationApproximateEarnings(
    targetId: string,
    accessToken: string,
    options?: { since?: number; until?: number; breakdown?: string }
  ): Promise<ApproximateEarningsResult> {
    try {
      const url = new URL(`${this.baseUrl}/${targetId}/monetization_approximate_earnings`);
      url.searchParams.set('access_token', accessToken);
      if (options?.since) url.searchParams.set('since', String(options.since));
      if (options?.until) url.searchParams.set('until', String(options.until));
      if (options?.breakdown) url.searchParams.set('breakdown', options.breakdown);

      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        return { has_currency: false, is_available: false };
      }

      const data = await res.json();
      let approximateAmount: number | undefined;
      let currency: string | undefined;
      let hasCurrency = false;

      const item = Array.isArray(data.data) ? data.data[0] : data;
      if (item) {
        if (item.earnings !== undefined) {
          approximateAmount = Number(item.earnings);
        } else if (item.value !== undefined) {
          approximateAmount = Number(item.value);
        } else if (typeof item === 'number') {
          approximateAmount = item;
        }

        if (item.currency) {
          currency = String(item.currency).toUpperCase();
          hasCurrency = true;
        }
      }

      return {
        approximate_amount: approximateAmount,
        raw_value: approximateAmount,
        has_currency: hasCurrency,
        currency,
        is_available: approximateAmount !== undefined,
        raw: data
      };
    } catch (err) {
      console.warn(`[MetaGraphService] monetization_approximate_earnings unavailable for ${targetId}:`, err);
      return { has_currency: false, is_available: false };
    }
  }

  /**
   * Tổng hợp Monetization Insights gọi riêng 2 metrics v23.0 và fallback legacy
   */
  private async getMonetizationInsights(pageId: string, accessToken: string, since: number, until: number) {
    const result: {
      earnings: number;
      currency?: string;
      rpm: number;
      cpm: number;
      content_earnings?: ContentMonetizationResult;
      approximate_earnings?: ApproximateEarningsResult;
    } = { earnings: 0, rpm: 0, cpm: 0 };

    // 1. Gọi song song 2 metric mới v23.0 độc lập
    const [contentRes, approxRes] = await Promise.allSettled([
      this.fetchContentMonetizationEarnings(pageId, accessToken, { since, until }),
      this.fetchMonetizationApproximateEarnings(pageId, accessToken, { since, until })
    ]);

    if (contentRes.status === 'fulfilled' && contentRes.value.is_available) {
      result.content_earnings = contentRes.value;
      if (contentRes.value.amount !== undefined) {
        result.earnings = contentRes.value.amount;
        result.currency = contentRes.value.currency;
      }
    }

    if (approxRes.status === 'fulfilled' && approxRes.value.is_available) {
      result.approximate_earnings = approxRes.value;
      // Nếu chưa có earnings từ content_monetization, dùng approximate_earnings
      if (result.earnings === 0 && approxRes.value.approximate_amount !== undefined) {
        result.earnings = approxRes.value.approximate_amount;
        if (approxRes.value.has_currency) {
          result.currency = approxRes.value.currency;
        }
      }
    }

    // 2. Fallback nếu Page chưa tham gia chương trình v23.0 hoặc dùng legacy endpoint
    if (result.earnings === 0) {
      try {
        const legacyMetrics = 'page_daily_video_ad_break_earnings,page_daily_video_ad_break_cpm';
        const url = `${this.legacyBaseUrl}/${pageId}/insights?metric=${legacyMetrics}&period=day&since=${since}&until=${until}&access_token=${accessToken}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          (data.data || []).forEach((item: any) => {
            const val = item.values?.[0]?.value || 0;
            if (item.name === 'page_daily_video_ad_break_earnings') result.earnings = Number(val);
            if (item.name === 'page_daily_video_ad_break_cpm') result.cpm = Number(val);
          });
        }
      } catch {
        // Bỏ qua lỗi fallback
      }
    }

    return result;
  }
}

export const metaGraphService = new MetaGraphService();

