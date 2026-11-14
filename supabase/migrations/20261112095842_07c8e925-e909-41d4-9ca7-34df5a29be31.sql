-- automation_settings: email on by default, paid SMS stays opt-in
ALTER TABLE public.automation_settings
  ALTER COLUMN booking_confirm_email SET DEFAULT true,
  ALTER COLUMN reminder_24h_email SET DEFAULT true,
  ALTER COLUMN receipt_email SET DEFAULT true;

-- automation_logs: plan columns
ALTER TABLE public.automation_logs
  ADD COLUMN workflow_type text,
  ADD COLUMN rendered_text text,
  ADD COLUMN error_details text,
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.automation_logs
  ADD CONSTRAINT automation_logs_workflow_type_check
    CHECK (workflow_type IS NULL OR workflow_type IN ('booking_confirmation','appointment_reminder','payment_receipt','hygiene_recall')),
  ADD CONSTRAINT automation_logs_channel_check
    CHECK (channel IN ('sms','email','in_app')),
  ADD CONSTRAINT automation_logs_status_check
    CHECK (status IN ('sent','delivered','failed','skipped')),
  ADD CONSTRAINT automation_logs_patient_workflow_type_required
    CHECK (channel = 'in_app' OR workflow_type IS NOT NULL);

-- Database-enforced idempotency: one successful send per entity/workflow/channel
CREATE UNIQUE INDEX idx_automation_idempotency
  ON public.automation_logs (org_id, entity_id, workflow_type, channel)
  WHERE entity_id IS NOT NULL AND workflow_type IS NOT NULL AND status IN ('sent','delivered');

CREATE INDEX idx_automation_logs_org_date
  ON public.automation_logs (org_id, created_at DESC);

GRANT SELECT ON public.automation_logs TO authenticated;
GRANT ALL ON public.automation_logs TO service_role;