CREATE TABLE public.automation_settings (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  booking_confirm_sms boolean NOT NULL DEFAULT false,
  booking_confirm_email boolean NOT NULL DEFAULT false,
  reminder_24h_sms boolean NOT NULL DEFAULT false,
  reminder_24h_email boolean NOT NULL DEFAULT false,
  receipt_sms boolean NOT NULL DEFAULT false,
  receipt_email boolean NOT NULL DEFAULT false,
  recall_6m_sms boolean NOT NULL DEFAULT false,
  recall_6m_email boolean NOT NULL DEFAULT false,
  custom_templates jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.automation_settings TO authenticated;
GRANT ALL ON public.automation_settings TO service_role;

ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members can view automation settings"
  ON public.automation_settings
  FOR SELECT
  TO authenticated
  USING (public.has_org_access((SELECT auth.uid()), org_id));

CREATE POLICY "Clinic owners and admins can create automation settings"
  ON public.automation_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_org_role((SELECT auth.uid()), org_id) IN ('owner'::public.org_role, 'admin'::public.org_role)
  );

CREATE POLICY "Clinic owners and admins can update automation settings"
  ON public.automation_settings
  FOR UPDATE
  TO authenticated
  USING (
    public.get_org_role((SELECT auth.uid()), org_id) IN ('owner'::public.org_role, 'admin'::public.org_role)
  )
  WITH CHECK (
    public.get_org_role((SELECT auth.uid()), org_id) IN ('owner'::public.org_role, 'admin'::public.org_role)
  );

CREATE TRIGGER automation_settings_updated_at
  BEFORE UPDATE ON public.automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.automation_logs
  ADD COLUMN recipient text,
  ADD COLUMN provider_id text,
  ADD COLUMN idempotency_key text;

CREATE UNIQUE INDEX idx_automation_logs_idempotency_key
  ON public.automation_logs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

DROP POLICY IF EXISTS "System can insert automation logs" ON public.automation_logs;