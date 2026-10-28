-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA (NÂNG CẤP TOÀN DIỆN V2)
-- Bổ sung: Hồ sơ Payout, Quản lý BM Sync, Sức khỏe Page, Google Auth, Hoa hồng
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. BẢNG HỒ SƠ PAYOUT (PAYOUT PROFILES)
-- Quản lý các tài khoản nhận tiền từ Meta, gom nhóm nhiều Page vào 1 Payout
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payout_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meta_payout_id VARCHAR(128),                    -- Mã hồ sơ thanh toán trên Meta
    name VARCHAR(255) NOT NULL,                     -- Tên nhận diện hồ sơ (VD: Payout VCB - Team A)
    account_holder VARCHAR(255) NOT NULL,           -- Tên chủ tài khoản thụ hưởng
    bank_name VARCHAR(255),                         -- Tên ngân hàng / Paypal
    account_number VARCHAR(128),                    -- Số tài khoản (ẩn 4 số cuối)
    tax_id VARCHAR(64),                             -- Mã số thuế cá nhân/doanh nghiệp
    country VARCHAR(8) DEFAULT 'VN',
    currency VARCHAR(8) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'active',            -- active, paused, restricted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 2. BẢNG PHÂN QUYỀN THÀNH VIÊN & GOOGLE AUTH (USER_PROFILES)
-- Liên kết với auth.users của Supabase (khi đăng nhập qua Google OAuth)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(32) DEFAULT 'member',              -- 'super_admin', 'manager', 'member'
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 3. BẢNG NHÓM TRANG (PAGE GROUPS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_code VARCHAR(16) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 4. BẢNG QUẢN LÝ TRANG (PAGES) - BỔ SUNG BM SYNC, PAYOUT & HEALTH CHECK
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pages (
    page_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128),
    avatar_url TEXT,
    
    -- Liên kết Hồ sơ Payout
    payout_profile_id UUID REFERENCES public.payout_profiles(id) ON DELETE SET NULL,
    
    -- Quản lý Kết nối Meta Business Manager (BM)
    business_id VARCHAR(64),                        -- BM ID sở hữu Page
    bm_sync_status VARCHAR(32) DEFAULT 'active',    -- 'active', 'removed_from_bm', 'permission_lost'
    last_bm_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Trạng thái Kiếm tiền & Sức khỏe Chính sách
    is_monetized BOOLEAN DEFAULT true,
    monetization_status VARCHAR(32) DEFAULT 'eligible', -- 'eligible' (xanh), 'restricted' (vàng), 'demonetized' (đỏ)
    recommendation_status VARCHAR(32) DEFAULT 'normal', -- 'normal' (bình thường), 'warning' (giảm sút), 'dropped' (mất đề xuất)
    recommendation_drop_detected_at TIMESTAMP WITH TIME ZONE,
    
    access_token_encrypted TEXT,
    token_status VARCHAR(32) DEFAULT 'active',
    last_synced_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 5. BẢNG LIÊN KẾT NHÓM VÀ TRANG (GROUP_PAGES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.page_groups(id) ON DELETE CASCADE,
    page_id VARCHAR(64) NOT NULL REFERENCES public.pages(page_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(group_id, page_id)
);

-- ----------------------------------------------------------------------------
-- 6. BẢNG PHÂN QUYỀN PAGE & THIẾT LẬP HOA HỒNG THÀNH VIÊN (USER_PAGE_ASSIGNMENTS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_page_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    page_id VARCHAR(64) NOT NULL REFERENCES public.pages(page_id) ON DELETE CASCADE,
    
    -- Chính sách tỷ lệ hoa hồng
    commission_rate_pct NUMERIC(5, 2) DEFAULT 0.00,  -- % hoa hồng hưởng trên doanh thu kiếm về (VD: 25.50%)
    role_on_page VARCHAR(64) DEFAULT 'editor',       -- 'editor', 'growth_hacker', 'streamer', 'manager'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, page_id)
);

-- ----------------------------------------------------------------------------
-- 7. BẢNG CHỈ SỐ THEO NGÀY (DAILY_PAGE_METRICS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_page_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id VARCHAR(64) NOT NULL REFERENCES public.pages(page_id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    posts_count INT DEFAULT 0,
    videos_count INT DEFAULT 0,
    reach BIGINT DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    engagements BIGINT DEFAULT 0,
    video_views_3s BIGINT DEFAULT 0,
    video_views_1m BIGINT DEFAULT 0,
    video_view_time_sec BIGINT DEFAULT 0,
    estimated_earnings NUMERIC(12, 4) DEFAULT 0.0000,
    rpm NUMERIC(10, 4) DEFAULT 0.0000,
    cpm NUMERIC(10, 4) DEFAULT 0.0000,
    followers_net INT DEFAULT 0,
    viral_reach_pct NUMERIC(5, 2) DEFAULT 0.00,      -- % tiếp cận từ đề xuất / lan truyền (phát hiện mất đề xuất)
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_page_metric_date UNIQUE (page_id, metric_date)
);

-- ----------------------------------------------------------------------------
-- 8. BẢNG LỊCH SỬ ĐỒNG BỘ BM & CRON LOGS (BM_SYNC_LOGS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bm_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id VARCHAR(64) NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    pages_found_in_bm INT DEFAULT 0,
    new_pages_added INT DEFAULT 0,
    pages_marked_removed INT DEFAULT 0,
    details JSONB
);

-- ============================================================================
-- CÁC DATABASE VIEWS & FUNCTIONS PHÂN TÍCH CHUYÊN SÂU
-- ============================================================================

-- A. BÁO CÁO TỔNG HỢP THEO HỒ SƠ PAYOUT
CREATE OR REPLACE FUNCTION public.get_payout_profile_report(
    p_period VARCHAR(16) -- '7d', '28d', '90d', '365d', 'this_month', 'last_month'
)
RETURNS TABLE (
    payout_id UUID,
    payout_name VARCHAR,
    account_holder VARCHAR,
    bank_name VARCHAR,
    total_pages_linked BIGINT,
    total_video_views_1m BIGINT,
    total_estimated_earnings NUMERIC,
    avg_rpm NUMERIC
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    IF p_period = '7d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '7 days';
        v_end_date := CURRENT_DATE;
    ELSIF p_period = '28d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '28 days';
        v_end_date := CURRENT_DATE;
    ELSIF p_period = '90d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '90 days';
        v_end_date := CURRENT_DATE;
    ELSIF p_period = 'this_month' THEN
        v_start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
        v_end_date := CURRENT_DATE;
    ELSIF p_period = 'last_month' THEN
        v_start_date := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
        v_end_date := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE;
    ELSE
        v_start_date := CURRENT_DATE - INTERVAL '7 days';
        v_end_date := CURRENT_DATE;
    END IF;

    RETURN QUERY
    SELECT 
        po.id AS payout_id,
        po.name AS payout_name,
        po.account_holder,
        po.bank_name,
        COUNT(DISTINCT p.page_id) AS total_pages_linked,
        COALESCE(SUM(m.video_views_1m), 0)::BIGINT AS total_video_views_1m,
        COALESCE(SUM(m.estimated_earnings), 0)::NUMERIC AS total_estimated_earnings,
        CASE 
            WHEN SUM(m.video_views_1m) > 0 
            THEN (SUM(m.estimated_earnings) / (SUM(m.video_views_1m) / 1000.0))::NUMERIC
            ELSE 0 
        END AS avg_rpm
    FROM public.payout_profiles po
    LEFT JOIN public.pages p ON po.id = p.payout_profile_id
    LEFT JOIN public.daily_page_metrics m 
        ON p.page_id = m.page_id 
        AND m.metric_date >= v_start_date 
        AND m.metric_date <= v_end_date
    GROUP BY po.id, po.name, po.account_holder, po.bank_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. BÁO CÁO HOA HỒNG THÀNH VIÊN (MEMBER COMMISSION REPORT)
CREATE OR REPLACE FUNCTION public.get_user_commission_report(
    p_user_id UUID,
    p_period VARCHAR(16)
)
RETURNS TABLE (
    page_id VARCHAR,
    page_name VARCHAR,
    commission_rate_pct NUMERIC,
    total_page_earnings NUMERIC,
    user_commission_amount NUMERIC
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    IF p_period = '7d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '7 days';
        v_end_date := CURRENT_DATE;
    ELSIF p_period = '28d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '28 days';
        v_end_date := CURRENT_DATE;
    ELSIF p_period = 'this_month' THEN
        v_start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
        v_end_date := CURRENT_DATE;
    ELSIF p_period = 'last_month' THEN
        v_start_date := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
        v_end_date := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE;
    ELSE
        v_start_date := CURRENT_DATE - INTERVAL '7 days';
        v_end_date := CURRENT_DATE;
    END IF;

    RETURN QUERY
    SELECT 
        p.page_id,
        p.name AS page_name,
        upa.commission_rate_pct,
        COALESCE(SUM(m.estimated_earnings), 0)::NUMERIC AS total_page_earnings,
        (COALESCE(SUM(m.estimated_earnings), 0) * (upa.commission_rate_pct / 100.0))::NUMERIC AS user_commission_amount
    FROM public.user_page_assignments upa
    JOIN public.pages p ON upa.page_id = p.page_id
    LEFT JOIN public.daily_page_metrics m 
        ON p.page_id = m.page_id 
        AND m.metric_date >= v_start_date 
        AND m.metric_date <= v_end_date
    WHERE upa.user_id = p_user_id AND upa.is_active = true
    GROUP BY p.page_id, p.name, upa.commission_rate_pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
