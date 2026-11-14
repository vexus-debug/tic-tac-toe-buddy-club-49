import type { Channel, WorkflowType } from "./defaultTemplates";

/** Deterministic key matching the unique index on automation_logs.idempotency_key. */
export function buildIdempotencyKey(p: { orgId: string; workflow: WorkflowType; channel: Channel; entityId: string; eventDate?: string }): string {
  return [p.orgId, p.workflow, p.channel, p.entityId, p.eventDate ?? ""].join(":");
}
