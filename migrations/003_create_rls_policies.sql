-- Migration: 003_create_rls_policies.sql
-- Description: Create RLS Isolation Policies for Multi-tenant Tables
-- Created: 2025-06-18
-- Dependencies: 001_rls_context_functions.sql, 002_enable_rls_core_tables.sql

BEGIN;

-- ================================
-- CLINIC TABLE POLICIES
-- ================================

-- Clinics: Users can only see their own clinic
CREATE POLICY clinics_clinic_isolation ON public.clinics
  FOR ALL 
  USING (id = auth.get_current_clinic_id());

-- ================================
-- USER TABLE POLICIES  
-- ================================

-- Users: Users can only see users from their own clinic
CREATE POLICY users_clinic_isolation ON public.users
  FOR ALL
  USING (clinic_id = auth.get_current_clinic_id());

-- ================================
-- USER-CLINIC ROLES POLICIES
-- ================================

-- User clinic roles: Users can only see roles for their clinic
CREATE POLICY user_clinic_roles_clinic_isolation ON public.user_clinic_roles
  FOR ALL
  USING (clinic_id = auth.get_current_clinic_id());

-- ================================
-- PROVIDER TABLE POLICIES
-- ================================

-- Providers: Clinic-based isolation
CREATE POLICY providers_clinic_isolation ON public.providers
  FOR ALL
  USING (clinic_id = auth.get_current_clinic_id());

-- ================================
-- LOCATION TABLE POLICIES
-- ================================

-- Locations: Clinic-based isolation  
CREATE POLICY locations_clinic_isolation ON public.locations
  FOR ALL
  USING (clinic_id = auth.get_current_clinic_id());

-- ================================
-- PRODUCTION TABLE POLICIES
-- ================================

-- Dentist Production: Access through location's clinic
CREATE POLICY dentist_production_clinic_isolation ON public.dentist_production
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.locations l 
      WHERE l.id = dentist_production.location_id 
      AND l.clinic_id = auth.get_current_clinic_id()
    )
  );

-- Hygiene Production: Access through location's clinic
CREATE POLICY hygiene_production_clinic_isolation ON public.hygiene_production
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.locations l 
      WHERE l.id = hygiene_production.location_id 
      AND l.clinic_id = auth.get_current_clinic_id()
    )
  );

-- ================================
-- FINANCIAL TABLE POLICIES
-- ================================

-- Location Financials: Access through location's clinic
CREATE POLICY location_financials_clinic_isolation ON public.location_financials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.locations l 
      WHERE l.id = location_financials.location_id 
      AND l.clinic_id = auth.get_current_clinic_id()
    )
  );

-- ================================
-- METRICS TABLE POLICIES
-- ================================

-- Metric Values: Access through location's clinic
CREATE POLICY metric_values_clinic_isolation ON public.metric_values
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.locations l 
      WHERE l.id = metric_values.location_id 
      AND l.clinic_id = auth.get_current_clinic_id()
    )
  );

-- ================================
-- DASHBOARD TABLE POLICIES
-- ================================

-- Dashboard Configs: User-specific with clinic isolation
CREATE POLICY dashboard_configs_clinic_isolation ON public.dashboard_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = dashboard_configs.user_id 
      AND u.clinic_id = auth.get_current_clinic_id()
    )
  );

-- Dashboard Widgets: Access through dashboard's user's clinic
CREATE POLICY dashboard_widgets_clinic_isolation ON public.dashboard_widgets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboard_configs dc
      JOIN public.users u ON u.id = dc.user_id
      WHERE dc.id = dashboard_widgets.dashboard_id 
      AND u.clinic_id = auth.get_current_clinic_id()
    )
  );

-- Log migration completion
INSERT INTO migrations (name, executed_at) VALUES ('003_create_rls_policies', NOW())
ON CONFLICT (name) DO UPDATE SET executed_at = NOW();

COMMIT;