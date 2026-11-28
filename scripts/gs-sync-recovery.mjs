import { BSON } from "mongodb";

const SYNC_NAME = "mongodb_registrations";

export async function loadResumeToken(postgres) {
  const result = await postgres.query(`
    SELECT resume_token
    FROM public.sync_status
    WHERE sync_name = $1
  `, [SYNC_NAME]);

  if (result.rowCount !== 1) {
    throw new Error("Synchronization state missing");
  }

  const token = result.rows[0].resume_token;

  if (!token) {
    return null;
  }

  return BSON.EJSON.parse(
    JSON.stringify(token),
    { relaxed: false }
  );
}

export function requiresFullReconciliation(error) {
  const recoveryCodes = new Set([
    260,
    280,
    286
  ]);

  return recoveryCodes.has(Number(error?.code));
}

export async function recordRecovery(
  postgres,
  mode
) {
  if (![
    "resume_token",
    "full_reconciliation"
  ].includes(mode)) {
    throw new Error("Invalid recovery mode");
  }

  const result = await postgres.query(`
    UPDATE public.sync_status
    SET recovery_count = recovery_count + 1,
        last_recovery_at = NOW(),
        last_recovery_mode = $1,
        updated_at = NOW()
    WHERE sync_name = $2
  `, [mode, SYNC_NAME]);

  if (result.rowCount !== 1) {
    throw new Error("Recovery state update failed");
  }
}