// Demo-only use case. Production authorization belongs to PostgreSQL RPCs.
export function executeDemoCommand(state, change, event) {
  const next = structuredClone(state);
  change(next);
  next.audit.unshift(event);
  return next;
}
