BEGIN;

ALTER TABLE auth_verification_events DROP CONSTRAINT IF EXISTS auth_verification_events_type_check;

ALTER TABLE auth_verification_events
  ADD CONSTRAINT auth_verification_events_type_check
  CHECK (
    event_type IN (
      'verification_email_sent',
      'verification_link_clicked',
      'verification_succeeded',
      'verification_failed',
      'challenge_email_sent',
      'resend_email_sent'
    )
  );

COMMIT;
