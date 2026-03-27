export async function upsertUser(client, { firebaseUid, email, displayName = null, status = 'pending_email_verification' }) {
  const query = `
    INSERT INTO users (id, firebase_uid, email, display_name, status)
    VALUES (gen_random_uuid(), $1, $2, $3, $4)
    ON CONFLICT (firebase_uid)
    DO UPDATE SET
      email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, users.display_name),
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING id, email, status;
  `;
  const { rows } = await client.query(query, [firebaseUid, email, displayName, status]);
  return rows[0];
}

export async function upsertAuthIdentity(client, { userId, firebaseUid, email, emailVerified }) {
  const query = `
    INSERT INTO auth_identities (id, user_id, firebase_uid, provider, email, email_verified, email_verified_at)
    VALUES (gen_random_uuid(), $1, $2, 'password', $3, $4, CASE WHEN $4 THEN NOW() ELSE NULL END)
    ON CONFLICT (user_id, provider)
    DO UPDATE SET
      firebase_uid = EXCLUDED.firebase_uid,
      email = EXCLUDED.email,
      email_verified = EXCLUDED.email_verified,
      email_verified_at = CASE WHEN EXCLUDED.email_verified THEN NOW() ELSE auth_identities.email_verified_at END,
      last_sync_at = NOW(),
      updated_at = NOW()
    RETURNING id;
  `;
  await client.query(query, [userId, firebaseUid, email, emailVerified]);
}

export async function insertVerificationEvent(client, payload) {
  const query = `
    INSERT INTO auth_verification_events (
      id, user_id, firebase_uid, email, event_type, event_status, failure_reason_code, request_id, ip, user_agent, metadata
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8::inet, $9, $10::jsonb
    );
  `;
  await client.query(query, [
    payload.userId || null,
    payload.firebaseUid || null,
    payload.email || null,
    payload.eventType,
    payload.eventStatus,
    payload.failureReasonCode || null,
    payload.requestId || null,
    payload.ip || null,
    payload.userAgent || null,
    JSON.stringify(payload.metadata || {}),
  ]);
}

export async function insertLoginEvent(client, payload) {
  const query = `
    INSERT INTO auth_login_events (
      id, user_id, firebase_uid, email, login_method, result, failure_reason_code, request_id, ip, user_agent, device_id, metadata
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8::inet, $9, $10, $11::jsonb
    );
  `;
  await client.query(query, [
    payload.userId || null,
    payload.firebaseUid || null,
    payload.email || null,
    payload.loginMethod || 'email_link',
    payload.result,
    payload.failureReasonCode || null,
    payload.requestId || null,
    payload.ip || null,
    payload.userAgent || null,
    payload.deviceId || null,
    JSON.stringify(payload.metadata || {}),
  ]);
}

export async function insertAuditEvent(client, payload) {
  const query = `
    INSERT INTO audit_events (
      id, actor_type, actor_user_id, action, resource_type, resource_id, request_id, ip, user_agent, payload
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7::inet, $8, $9::jsonb
    );
  `;
  await client.query(query, [
    payload.actorType,
    payload.actorUserId || null,
    payload.action,
    payload.resourceType,
    payload.resourceId || null,
    payload.requestId || null,
    payload.ip || null,
    payload.userAgent || null,
    JSON.stringify(payload.payload || {}),
  ]);
}

export async function createUserSession(client, payload) {
  const query = `
    INSERT INTO user_sessions (
      id, user_id, session_ref, auth_provider, ip, user_agent, device_id, risk_level
    ) VALUES (
      gen_random_uuid(), $1, $2, 'firebase', $3::inet, $4, $5, 'low'
    )
    RETURNING session_ref;
  `;
  const { rows } = await client.query(query, [
    payload.userId,
    payload.sessionRef,
    payload.ip || null,
    payload.userAgent || null,
    payload.deviceId || null,
  ]);
  return rows[0];
}

export async function closeSession(client, sessionRef) {
  const query = `
    UPDATE user_sessions
    SET ended_at = NOW(), termination_reason = 'logout', last_seen_at = NOW()
    WHERE session_ref = $1 AND ended_at IS NULL
    RETURNING id;
  `;
  const { rows } = await client.query(query, [sessionRef]);
  return rows[0] || null;
}
