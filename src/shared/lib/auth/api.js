import { NextResponse } from 'next/server';

export function jsonError({ status, code, message, details }) {
  const payload = {
    code,
    message,
    error: code,
  };

  if (details) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status });
}

export function jsonOk(body, status = 200) {
  return NextResponse.json(body, { status });
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

export async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
