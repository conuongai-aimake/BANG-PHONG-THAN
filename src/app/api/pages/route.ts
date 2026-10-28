import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { MOCK_PAGES } from '@/lib/mock-data';

export async function GET() {
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ pages: MOCK_PAGES, is_mock: true });
  }

  const { data, error } = await supabase.from('pages').select('*, group_pages(group_id)');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ pages: data, is_mock: false });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page_id, name, category, is_monetized, access_token, group_id } = body;

    if (!page_id || !name) {
      return NextResponse.json({ error: 'Page ID và Tên trang là bắt buộc' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({
        message: 'Đã thêm Page thành công (chế độ demo)',
        page: {
          page_id,
          name,
          category: category || 'General',
          is_monetized: is_monetized !== false,
          token_status: 'active',
          last_synced_at: new Date().toISOString(),
          group_ids: group_id ? [group_id] : []
        }
      });
    }

    // 1. Thêm Page
    const { data: pageData, error: pageErr } = await supabase
      .from('pages')
      .upsert({
        page_id,
        name,
        category: category || 'General',
        is_monetized: is_monetized !== false,
        access_token_encrypted: access_token || null,
        token_status: access_token ? 'active' : 'pending_token',
        status: 'active'
      })
      .select()
      .single();

    if (pageErr) throw pageErr;

    // 2. Gán vào Group nếu có
    if (group_id) {
      await supabase.from('group_pages').upsert({
        group_id,
        page_id
      }, { onConflict: 'group_id, page_id' });
    }

    return NextResponse.json({ page: pageData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
