/**
 * Example page: Query Supabase data (theo docs Supabase)
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

import { createClient } from '@/utils/supabase/server';

export default async function UsersPage() {
  const supabase = await createClient();

  // Query users từ Supabase (ĐÚNG CÁCH theo docs)
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, display_name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-error">Error loading users</h1>
        <pre className="mt-4 text-sm text-error">{error.message}</pre>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Users from Supabase</h1>
      <p className="text-sm text-on-surface-variant mb-4">
        Total users: {users?.length || 0}
      </p>

      {users && users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-lg bg-surface-container-low border border-outline-variant"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-on-surface">{user.email}</p>
                  {user.display_name && (
                    <p className="text-sm text-on-surface-variant">{user.display_name}</p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active'
                        ? 'bg-primary-container text-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {user.status}
                  </span>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-on-surface-variant">No users found</p>
          <p className="text-sm text-on-surface-variant mt-2">
            Try logging in to create a user
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-surface-container rounded-lg">
        <p className="text-sm font-semibold mb-2">💡 Debug Info:</p>
        <pre className="text-xs text-on-surface-variant overflow-auto">
          {JSON.stringify(users, null, 2)}
        </pre>
      </div>
    </div>
  );
}
