import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../shared/lib/supabase/server.js';
import { getFirebaseAuth } from '../../../../../server/auth/firebaseAdmin.js';

/**
 * GET /api/v1/user/profile
 * Lấy thông tin profile của user hiện tại
 */
export async function GET(request) {
  try {
    // Verify Firebase token từ Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Query user từ Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        display_name,
        status,
        created_at,
        auth_identities(email_verified, email_verified_at)
      `)
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        status: user.status,
        emailVerified: user.auth_identities[0]?.email_verified || false,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/user/profile
 * Update user profile
 */
export async function PATCH(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const body = await request.json();
    const { displayName } = body;

    // Update user trong Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      user: {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
