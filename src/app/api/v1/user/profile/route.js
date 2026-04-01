import { NextResponse } from 'next/server';
import { createClient } from '../../../../../shared/lib/supabase/server.js';

function extractBearerToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return '';
  return authHeader.split('Bearer ')[1];
}

async function verifyAuthUser(request) {
  const token = extractBearerToken(request);
  if (!token) return null;
  const supabaseAdmin = await createClient();
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user;
}

function mapProfilePayload(user, authUser) {
  const emailVerified = Boolean(authUser?.email_confirmed_at || authUser?.confirmed_at);
  return {
    id: user.users_id || user.id || user.supa_id,
    email: user.email,
    displayName: user.display_name || '',
    status: user.status || 'pending_email_verification',
    kycStatus: user.kyc_status || 'not_started',
    emailVerified,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function validateDisplayName(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) return 'Display name is required.';
  if (value.length < 2) return 'Display name must be at least 2 characters.';
  if (value.length > 60) return 'Display name must be 60 characters or less.';
  return '';
}

export async function GET(request) {
  try {
    const authUser = await verifyAuthUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = await createClient();
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(
        `
          users_id,
          supa_id,
          email,
          display_name,
          created_at,
          updated_at
        `
      )
      .eq('supa_id', authUser.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ user: mapProfilePayload(user, authUser) });
  } catch (error) {
    if (String(error?.message || '').toLowerCase().includes('token')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const authUser = await verifyAuthUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const displayName = String(body?.displayName || '').trim();
    const displayNameError = validateDisplayName(displayName);
    if (displayNameError) {
      return NextResponse.json({ error: displayNameError }, { status: 400 });
    }

    const supabaseAdmin = await createClient();
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq('supa_id', authUser.id)
      .select('users_id, supa_id, email, display_name, created_at, updated_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      user: {
        id: data.users_id || data.supa_id,
        email: data.email,
        displayName: data.display_name || '',
        status: data.status || 'pending_email_verification',
        kycStatus: data.kyc_status || 'not_started',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    if (String(error?.message || '').toLowerCase().includes('token')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
