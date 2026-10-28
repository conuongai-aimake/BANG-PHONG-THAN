import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { metaGraphService } from '@/lib/meta/graph-api';

/**
 * VERCEL CRON ENDPOINT
 * Lịch chạy: 01:00 UTC (08:00 AM VN) mỗi ngày qua vercel.json
 */
export async function GET(req: NextRequest) {
  return handleSync(req, 'vercel_cron');
}

export async function POST(req: NextRequest) {
  return handleSync(req, 'manual_trigger');
}

async function handleSync(req: NextRequest, source: string) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  // Xác thực bảo mật khi gọi từ Vercel Cron hoặc bên ngoài
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Cho phép gọi trong môi trường dev nếu chưa đặt CRON_SECRET
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
    }
  }

  const supabase = getServiceSupabase();

  // Trường hợp chưa cấu hình Supabase
  if (!supabase || !isSupabaseServerConfigured) {
    return NextResponse.json({
      status: 'simulated_success',
      message: 'Supabase credentials chưa được cấu hình. Hệ thống chạy ở chế độ mô phỏng.',
      source,
      synced_at: new Date().toISOString()
    });
  }

  // 1. Tạo Log Record
  const { data: logRecord } = await supabase
    .from('cron_sync_logs')
    .insert({
      sync_source: source,
      status: 'running',
      started_at: new Date().toISOString()
    })
    .select('id')
    .single();

  const logId = logRecord?.id;

  try {
    // 2. Lấy danh sách Pages đang active
    const { data: pages, error: pageErr } = await supabase
      .from('pages')
      .select('page_id, name, access_token_encrypted, is_monetized')
      .eq('status', 'active');

    if (pageErr) throw pageErr;

    let succeeded = 0;
    let failed = 0;
    const errors: any[] = [];

    // 3. Lặp qua từng Page và lấy chỉ số ngày hôm qua
    for (const page of pages || []) {
      try {
        const token = page.access_token_encrypted || process.env.META_SYSTEM_USER_TOKEN;
        if (!token) {
          throw new Error(`Page ${page.name} (${page.page_id}) thiếu Access Token`);
        }

        const metrics = await metaGraphService.fetchPageDailyMetrics(page.page_id, token);

        // Upsert vào bảng daily_page_metrics
        await supabase
          .from('daily_page_metrics')
          .upsert({
            page_id: page.page_id,
            ...metrics
          }, { onConflict: 'page_id, metric_date' });

        // Cập nhật last_synced_at của page
        await supabase
          .from('pages')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('page_id', page.page_id);

        succeeded++;
      } catch (err: any) {
        failed++;
        errors.push({ page_id: page.page_id, error: err.message });
      }
    }

    // 4. Hoàn tất Log
    if (logId) {
      await supabase
        .from('cron_sync_logs')
        .update({
          status: failed === 0 ? 'success' : succeeded > 0 ? 'partial' : 'failed',
          finished_at: new Date().toISOString(),
          total_pages_attempted: (pages || []).length,
          total_pages_succeeded: succeeded,
          total_pages_failed: failed,
          error_summary: errors.length ? JSON.stringify(errors) : null
        })
        .eq('id', logId);
    }

    return NextResponse.json({
      status: 'completed',
      attempted: (pages || []).length,
      succeeded,
      failed,
      errors
    });
  } catch (err: any) {
    if (logId) {
      await supabase
        .from('cron_sync_logs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_summary: err.message
        })
        .eq('id', logId);
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
