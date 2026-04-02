// Repository layer sử dụng Supabase JS Client
import { supabaseAdmin } from '../../shared/lib/supabase/server.js';

/**
 * Upsert user vào Supabase
 */
export async function upsertUserSupabase({ firebaseUid, email, displayName = null, status = 'pending_email_verification' }) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        firebase_uid: firebaseUid,
        email,
        display_name: displayName,
        status,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'firebase_uid',
        returning: 'representation',
      }
    )
    .select('id, email, status')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upsert auth identity
 */
export async function upsertAuthIdentitySupabase({ userId, firebaseUid, email, emailVerified }) {
  const { data, error } = await supabaseAdmin
    .from('auth_identities')
    .upsert(
      {
        user_id: userId,
        firebase_uid: firebaseUid,
        provider: 'password',
        email,
        email_verified: emailVerified,
        email_verified_at: emailVerified ? new Date().toISOString() : null,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,provider',
      }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Insert verification event
 */
export async function insertVerificationEventSupabase(payload) {
  const { error } = await supabaseAdmin.from('auth_verification_events').insert({
    user_id: payload.userId || null,
    firebase_uid: payload.firebaseUid || null,
    email: payload.email || null,
    event_type: payload.eventType,
    event_status: payload.eventStatus,
    failure_reason_code: payload.failureReasonCode || null,
    request_id: payload.requestId || null,
    ip: payload.ip || null,
    user_agent: payload.userAgent || null,
    metadata: payload.metadata || {},
  });

  if (error) throw error;
}

/**
 * Get user by email
 */
export async function getVerifiedAuthUserByEmailSupabase(email) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      id,
      email,
      auth_identities!inner(firebase_uid, email_verified)
    `)
    .eq('email', email)
    .eq('auth_identities.provider', 'password')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return {
    user_id: data.id,
    email: data.email,
    firebase_uid: data.auth_identities[0]?.firebase_uid,
    email_verified: data.auth_identities[0]?.email_verified,
  };
}

/**
 * Create user session
 */
export async function createUserSessionSupabase(payload) {
  const { data, error } = await supabaseAdmin
    .from('user_sessions')
    .insert({
      user_id: payload.userId,
      session_ref: payload.sessionRef,
      auth_provider: 'firebase',
      ip: payload.ip || null,
      user_agent: payload.userAgent || null,
      device_id: payload.deviceId || null,
      risk_level: 'low',
    })
    .select('session_ref')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Close session
 */
export async function closeSessionSupabase(sessionRef) {
  const { data, error } = await supabaseAdmin
    .from('user_sessions')
    .update({
      ended_at: new Date().toISOString(),
      termination_reason: 'logout',
      last_seen_at: new Date().toISOString(),
    })
    .eq('session_ref', sessionRef)
    .is('ended_at', null)
    .select('id, user_id')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}
