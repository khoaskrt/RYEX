import { ModuleCard } from '../../shared/components/ModuleCard';

const copyByMode = {
  login: {
    title: 'Authentication - Login',
    description: 'Entry point for user sign-in flow and session initialization.',
  },
  signup: {
    title: 'Authentication - Signup',
    description: 'Entry point for onboarding flow, verification, and account creation.',
  },
};

export function AuthModulePage({ mode }) {
  const copy = copyByMode[mode] || copyByMode.login;

  return (
    <ModuleCard title={copy.title} description={copy.description}>
      <ul className="space-y-2 text-sm text-slate-300">
        <li>Domain folder: src/features/auth</li>
        <li>Routes: /app/auth/login and /app/auth/signup</li>
        <li>Next steps: forms, validation schema, API handlers, and auth state management</li>
      </ul>
    </ModuleCard>
  );
}
