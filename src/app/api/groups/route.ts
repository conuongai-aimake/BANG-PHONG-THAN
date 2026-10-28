import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { MOCK_PAGE_GROUPS } from '@/lib/mock-data';

export async function GET() {
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ groups: MOCK_PAGE_GROUPS, is_mock: true });
  }

  const { data, error } = await supabase.from('page_groups').select('*, group_pages(page_id)');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ groups: data, is_mock: false });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, color_code } = body;

    if (!name) {
      return NextResponse.json({ error: 'Tên nhóm là bắt buộc' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({
        message: 'Đã tạo nhóm thành công (chế độ demo)',
        group: {
          id: `grp-${Date.now()}`,
          name,
          description: description || '',
          color_code: color_code || '#3B82F6'
        }
      });
    }

    const { data, error } = await supabase
      .from('page_groups')
      .insert({
        name,
        description,
        color_code: color_code || '#3B82F6'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ group: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
