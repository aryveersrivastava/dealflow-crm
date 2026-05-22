-- ==============================================================
-- DealFlow CRM — Row Level Security (RLS) Migrations
-- Enforces multi-tenant data isolation at the database level.
-- ==============================================================

-- 1. Helper function to resolve tenant ID from Supabase auth.uid()
-- Marks as SECURITY DEFINER to bypass RLS recursion on the users table.
CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE supabase_id = auth.uid()::text;
$$;

-- 2. Enable Row Level Security (RLS) on all tenant-scoped tables
ALTER TABLE public.brokerage_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================
-- 3. RLS Policies Configuration
-- ==============================================================

-- --- brokerage_firms ---
CREATE POLICY brokerage_firm_tenant_policy ON public.brokerage_firms
  FOR ALL
  USING (id = public.get_tenant_id());

-- --- users ---
-- Allows reading or editing user records inside the same brokerage firm (tenant)
CREATE POLICY user_tenant_policy ON public.users
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- properties ---
-- Isolates property data completely to each brokerage firm
CREATE POLICY property_tenant_policy ON public.properties
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- requirements ---
-- Selects: Allow users within the brokerage to read their own requirements OR read public requirements from other tenants
CREATE POLICY requirement_select_policy ON public.requirements
  FOR SELECT
  USING (tenant_id = public.get_tenant_id() OR is_public = true);

-- Insert/Update/Delete: Restricts modifications only to users of the owning brokerage
CREATE POLICY requirement_write_policy ON public.requirements
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- leads ---
CREATE POLICY lead_tenant_policy ON public.leads
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- activities ---
CREATE POLICY activity_tenant_policy ON public.activities
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- tasks ---
CREATE POLICY task_tenant_policy ON public.tasks
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- notes ---
CREATE POLICY note_tenant_policy ON public.notes
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- visits ---
CREATE POLICY visit_tenant_policy ON public.visits
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- collaborations ---
CREATE POLICY collaboration_tenant_policy ON public.collaborations
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- notifications ---
CREATE POLICY notification_tenant_policy ON public.notifications
  FOR ALL
  USING (tenant_id = public.get_tenant_id());

-- --- audit_logs ---
CREATE POLICY audit_log_tenant_policy ON public.audit_logs
  FOR ALL
  USING (tenant_id = public.get_tenant_id());
