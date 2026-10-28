-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR FACEBOOK MONETIZED PAGES ANALYTICS
-- Target: Supabase SQL Editor
-- Features: Pages, Groups, Daily Metrics, Post Tracking, Aggregation Views
-- ============================================================================

-- Bật các extensions cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. BẢNG QUẢN LÝ NHÓM TRANG (PAGE GROUPS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_code VARCHAR(16) DEFAULT '#3B82F6', -- Hex color cho badge UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 2. BẢNG QUẢN LÝ TRANG FACEBOOK (PAGES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pages (
    page_id VARCHAR(64) PRIMARY KEY, -- Facebook Page ID (String)
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128),
    avatar_url TEXT,
    is_monetized BOOLEAN DEFAULT true, -- Có đang bật kiếm tiền không
    monetization_type VARCHAR(64) DEFAULT 'in_stream_ads', -- in_stream_ads, reels_bonus, stars, subscription
    access_token_encrypted TEXT, -- Page Access Token (Mã hóa AES-256)
    token_status VARCHAR(32) DEFAULT 'active', -- active, expired, revoked
    last_synced_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) DEFAULT 'active', -- active, paused, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 3. BẢNG LIÊN KẾT NHÓM VÀ TRANG (GROUP_PAGES - Quan hệ N-N)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.page_groups(id) ON DELETE CASCADE,
    page_id VARCHAR(64) NOT NULL REFERENCES public.pages(page_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(group_id, page_id)
);

-- ----------------------------------------------------------------------------
-- 4. BẢNG CHỈ SỐ THEO NGÀY CỦA TRANG (DAILY_PAGE_METRICS)
-- Lưu trữ Time-series snapshot hàng ngày
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_page_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id VARCHAR(64) NOT NULL REFERENCES public.pages(page_id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    
    -- Chỉ số nội dung & Đăng tải
    posts_count INT DEFAULT 0,                 -- Số bài đăng xuất bản trong ngày
    videos_count INT DEFAULT 0,                -- Số video / Reels xuất bản
    
    -- Chỉ số hiển thị & tiếp cận
    reach BIGINT DEFAULT 0,                    -- Page Reach
    impressions BIGINT DEFAULT 0,              -- Impressions
    engagements BIGINT DEFAULT 0,              -- Tương tác (Likes, shares, comments)
    
    -- Chỉ số Video chuyên sâu cho kiếm tiền
    video_views_3s BIGINT DEFAULT 0,           -- Lượt xem video >= 3 giây
    video_views_1m BIGINT DEFAULT 0,           -- Lượt xem video >= 1 phút (In-stream eligible)
    video_view_time_sec BIGINT DEFAULT 0,      -- Tổng thời gian xem video (giây)
    
    -- Chỉ số tài chính & kiếm tiền
    estimated_earnings NUMERIC(12, 4) DEFAULT 0.0000, -- Doanh thu ước tính (USD)
    rpm NUMERIC(10, 4) DEFAULT 0.0000,                -- Doanh thu trên 1000 lượt xem (RPM)
    cpm NUMERIC(10, 4) DEFAULT 0.0000,                -- Chi phí mỗi 1000 lượt hiển thị (CPM)
    
    -- Người theo dõi
    followers_net INT DEFAULT 0,               -- Tăng trưởng người theo dõi ròng
    
    raw_response JSONB,                        -- Lưu payload gốc từ Graph API để kiểm toán
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Đảm bảo mỗi Page chỉ có duy nhất 1 bản ghi cho 1 ngày
    CONSTRAINT uq_page_metric_date UNIQUE (page_id, metric_date)
);

-- ----------------------------------------------------------------------------
-- 5. BẢNG LỊCH SỬ CHẠY ĐỒNG BỘ (CRON_SYNC_LOGS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cron_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_source VARCHAR(64) DEFAULT 'vercel_cron', -- vercel_cron, manual_trigger
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    finished_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) DEFAULT 'running',          -- running, success, failed, partial
    total_pages_attempted INT DEFAULT 0,
    total_pages_succeeded INT DEFAULT 0,
    total_pages_failed INT DEFAULT 0,
    error_summary TEXT,
    details JSONB
);

-- ----------------------------------------------------------------------------
-- INDEXES TỐI ƯU HÓA TRUY VẤN BÁO CÁO
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_daily_metrics_page_date ON public.daily_page_metrics(page_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON public.daily_page_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_group_pages_lookup ON public.group_pages(group_id, page_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status, is_monetized);

-- ============================================================================
-- CÁC DATABASE VIEWS TÍNH TOÁN BÁO CÁO TỰ ĐỘNG THEO CHU KỲ
-- ============================================================================

-- 1. BÁO CÁO 7 NGÀY GẦN NHẤT (7 DAYS ROLLING)
CREATE OR REPLACE VIEW public.view_report_7d AS
SELECT 
    p.page_id,
    p.name AS page_name,
    p.is_monetized,
    COUNT(m.id) AS days_recorded,
    COALESCE(SUM(m.posts_count), 0) AS total_posts,
    COALESCE(SUM(m.reach), 0) AS total_reach,
    COALESCE(SUM(m.impressions), 0) AS total_impressions,
    COALESCE(SUM(m.video_views_1m), 0) AS total_video_views_1m,
    COALESCE(SUM(m.estimated_earnings), 0) AS total_estimated_earnings,
    CASE 
        WHEN SUM(m.video_views_1m) > 0 
        THEN (SUM(m.estimated_earnings) / (SUM(m.video_views_1m) / 1000.0))
        ELSE 0 
    END AS avg_rpm
FROM public.pages p
LEFT JOIN public.daily_page_metrics m 
    ON p.page_id = m.page_id 
    AND m.metric_date >= (CURRENT_DATE - INTERVAL '7 days') 
    AND m.metric_date < CURRENT_DATE
GROUP BY p.page_id, p.name, p.is_monetized;

-- 2. BÁO CÁO 28 NGÀY GẦN NHẤT (28 DAYS ROLLING - CHUẨN FACEBOOK STUDIO)
CREATE OR REPLACE VIEW public.view_report_28d AS
SELECT 
    p.page_id,
    p.name AS page_name,
    p.is_monetized,
    COUNT(m.id) AS days_recorded,
    COALESCE(SUM(m.posts_count), 0) AS total_posts,
    COALESCE(SUM(m.reach), 0) AS total_reach,
    COALESCE(SUM(m.impressions), 0) AS total_impressions,
    COALESCE(SUM(m.video_views_1m), 0) AS total_video_views_1m,
    COALESCE(SUM(m.estimated_earnings), 0) AS total_estimated_earnings,
    CASE 
        WHEN SUM(m.video_views_1m) > 0 
        THEN (SUM(m.estimated_earnings) / (SUM(m.video_views_1m) / 1000.0))
        ELSE 0 
    END AS avg_rpm
FROM public.pages p
LEFT JOIN public.daily_page_metrics m 
    ON p.page_id = m.page_id 
    AND m.metric_date >= (CURRENT_DATE - INTERVAL '28 days') 
    AND m.metric_date < CURRENT_DATE
GROUP BY p.page_id, p.name, p.is_monetized;

-- 3. BÁO CÁO 90 NGÀY GẦN NHẤT (90 DAYS ROLLING - QUÝ)
CREATE OR REPLACE VIEW public.view_report_90d AS
SELECT 
    p.page_id,
    p.name AS page_name,
    p.is_monetized,
    COALESCE(SUM(m.posts_count), 0) AS total_posts,
    COALESCE(SUM(m.reach), 0) AS total_reach,
    COALESCE(SUM(m.impressions), 0) AS total_impressions,
    COALESCE(SUM(m.video_views_1m), 0) AS total_video_views_1m,
    COALESCE(SUM(m.estimated_earnings), 0) AS total_estimated_earnings
FROM public.pages p
LEFT JOIN public.daily_page_metrics m 
    ON p.page_id = m.page_id 
    AND m.metric_date >= (CURRENT_DATE - INTERVAL '90 days') 
    AND m.metric_date < CURRENT_DATE
GROUP BY p.page_id, p.name, p.is_monetized;

-- 4. BÁO CÁO 365 NGÀY (365 DAYS ROLLING - NĂM)
CREATE OR REPLACE VIEW public.view_report_365d AS
SELECT 
    p.page_id,
    p.name AS page_name,
    p.is_monetized,
    COALESCE(SUM(m.posts_count), 0) AS total_posts,
    COALESCE(SUM(m.reach), 0) AS total_reach,
    COALESCE(SUM(m.impressions), 0) AS total_impressions,
    COALESCE(SUM(m.video_views_1m), 0) AS total_video_views_1m,
    COALESCE(SUM(m.estimated_earnings), 0) AS total_estimated_earnings
FROM public.pages p
LEFT JOIN public.daily_page_metrics m 
    ON p.page_id = m.page_id 
    AND m.metric_date >= (CURRENT_DATE - INTERVAL '365 days') 
    AND m.metric_date < CURRENT_DATE
GROUP BY p.page_id, p.name, p.is_monetized;

-- 5. BÁO CÁO THÁNG NÀY (THIS MONTH - MTD)
CREATE OR REPLACE VIEW public.view_report_this_month AS
SELECT 
    p.page_id,
    p.name AS page_name,
    p.is_monetized,
    COALESCE(SUM(m.posts_count), 0) AS total_posts,
    COALESCE(SUM(m.reach), 0) AS total_reach,
    COALESCE(SUM(m.impressions), 0) AS total_impressions,
    COALESCE(SUM(m.video_views_1m), 0) AS total_video_views_1m,
    COALESCE(SUM(m.estimated_earnings), 0) AS total_estimated_earnings
FROM public.pages p
LEFT JOIN public.daily_page_metrics m 
    ON p.page_id = m.page_id 
    AND m.metric_date >= DATE_TRUNC('month', CURRENT_DATE) 
    AND m.metric_date <= CURRENT_DATE
GROUP BY p.page_id, p.name, p.is_monetized;

-- 6. BÁO CÁO THÁNG TRƯỚC (LAST MONTH - ĐỐI SOÁT PAYOUT)
CREATE OR REPLACE VIEW public.view_report_last_month AS
SELECT 
    p.page_id,
    p.name AS page_name,
    p.is_monetized,
    COALESCE(SUM(m.posts_count), 0) AS total_posts,
    COALESCE(SUM(m.reach), 0) AS total_reach,
    COALESCE(SUM(m.impressions), 0) AS total_impressions,
    COALESCE(SUM(m.video_views_1m), 0) AS total_video_views_1m,
    COALESCE(SUM(m.estimated_earnings), 0) AS total_estimated_earnings
FROM public.pages p
LEFT JOIN public.daily_page_metrics m 
    ON p.page_id = m.page_id 
    AND m.metric_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND m.metric_date < DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p.page_id, p.name, p.is_monetized;

-- 7. FUNCTION TRUY VẤN BÁO CÁO TỔNG HỢP THEO NHÓM (GROUP AGGREGATE FUNCTION)
CREATE OR REPLACE FUNCTION public.get_group_report(
    p_group_id UUID,
    p_period VARCHAR(16) -- '7d', '28d', '90d', '365d', 'this_month', 'last_month'
)
RETURNS TABLE (
    group_id UUID,
    group_name VARCHAR,
    total_pages BIGINT,
    total_posts BIGINT,
    total_reach BIGINT,
    total_impressions BIGINT,
    total_video_views_1m BIGINT,
    total_estimated_earnings NUMERIC
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Xác định khoảng thời gian
    IF p_period = '7d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '7 days';
        v_end_date := CURRENT_DATE;
    ELSIF p_period = '28d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '28 days';
        v_end_date := CURRENT_DATE;
    ELSIF p_period = '90d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '90 days';
        v_end_date := CURRENT_DATE;
    ELSIF p_period = '365d' THEN
        v_start_date := CURRENT_DATE - INTERVAL '365 days';
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
        g.id AS group_id,
        g.name AS group_name,
        COUNT(DISTINCT gp.page_id) AS total_pages,
        COALESCE(SUM(m.posts_count), 0)::BIGINT AS total_posts,
        COALESCE(SUM(m.reach), 0)::BIGINT AS total_reach,
        COALESCE(SUM(m.impressions), 0)::BIGINT AS total_impressions,
        COALESCE(SUM(m.video_views_1m), 0)::BIGINT AS total_video_views_1m,
        COALESCE(SUM(m.estimated_earnings), 0)::NUMERIC AS total_estimated_earnings
    FROM public.page_groups g
    JOIN public.group_pages gp ON g.id = gp.group_id
    JOIN public.pages p ON gp.page_id = p.page_id
    LEFT JOIN public.daily_page_metrics m 
        ON p.page_id = m.page_id 
        AND m.metric_date >= v_start_date 
        AND m.metric_date <= v_end_date
    WHERE g.id = p_group_id
    GROUP BY g.id, g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
