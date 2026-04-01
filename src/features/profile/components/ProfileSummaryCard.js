function statusLabel(status) {
  switch (status) {
    case 'active':
      return 'Đang hoạt động';
    case 'locked':
      return 'Đã khóa';
    case 'disabled':
      return 'Vô hiệu';
    default:
      return 'Chờ xác minh';
  }
}

function kycLabel(status) {
  switch (status) {
    case 'approved':
      return 'KYC đã duyệt';
    case 'pending':
      return 'KYC đang xử lý';
    case 'rejected':
      return 'KYC bị từ chối';
    default:
      return 'KYC chưa bắt đầu';
  }
}

export function ProfileSummaryCard({
  profile,
  profileVisual,
  loading,
  displayNameDraft,
  onDisplayNameChange,
  onSaveDisplayName,
  isSavingDisplayName,
  displayNameError,
  displayNameSuccess,
}) {
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
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  profile.status === 'active'
                    ? 'bg-primary-container/20 text-primary'
                    : profile.status === 'locked' || profile.status === 'disabled'
                    ? 'bg-error-container text-error'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {statusLabel(profile.status)}
              </span>
              <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {kycLabel(profile.kycStatus)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  profile.emailVerified ? 'bg-primary-container/20 text-primary' : 'bg-error-container text-error'
                }`}
              >
                {profile.emailVerified ? 'Email đã xác minh' : 'Email chưa xác minh'}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-medium text-on-surface-variant">UID: {profile.uid}</p>
              <button className="text-on-surface-variant transition-colors hover:text-primary" type="button">
                <span className="material-symbols-outlined text-base">content_copy</span>
              </button>
            </div>
            <div className="mt-4 max-w-md">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tên hiển thị</label>
              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-container/40"
                  onChange={(event) => onDisplayNameChange(event.target.value)}
                  placeholder="Nhập tên hiển thị"
                  type="text"
                  value={displayNameDraft}
                />
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#005f46] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || isSavingDisplayName}
                  onClick={onSaveDisplayName}
                  type="button"
                >
                  {isSavingDisplayName ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
              {displayNameError ? <p className="mt-2 text-xs font-semibold text-error">{displayNameError}</p> : null}
              {displayNameSuccess ? <p className="mt-2 text-xs font-semibold text-primary">{displayNameSuccess}</p> : null}
            </div>
          </div>
        </div>
        <p className="text-xs font-semibold text-on-surface-variant">Thành viên từ: {profile.memberSince}</p>
      </div>
    </section>
  );
}
