export function ProfileSummaryCard({ profile, profileVisual, loading }) {
  return (
    <section className="mb-10 rounded-2xl border border-[#bbcac1]/30 bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-surface-container-low shadow-lg">
            {profileVisual.avatarUrl ? (
              <img alt="Profile avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" src={profileVisual.avatarUrl} />
            ) : (
              <span className="text-2xl font-bold uppercase text-[#3c4a43]">{profileVisual.initial}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">
              {loading ? 'Đang tải hồ sơ...' : `Xin chào, ${profile.emailMasked}`}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-medium text-on-surface-variant">UID: {profile.uid}</p>
              <button className="text-on-surface-variant transition-colors hover:text-primary" type="button">
                <span className="material-symbols-outlined text-base">content_copy</span>
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs font-semibold text-on-surface-variant">Thành viên từ: {profile.memberSince}</p>
      </div>
    </section>
  );
}
