export function DepositHeroBanner() {
  return (
    <header className="rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-[0_24px_48px_rgba(0,108,79,0.22)] md:p-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/85">Deposit Center</p>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Nạp tiền vào tài khoản</h1>
          <p className="mt-3 text-sm text-white/90 md:text-base">
            Màn hình này là điểm đến chung sau khi user bấm <span className="font-bold">"Nạp tiền"</span> ở bất kỳ khu vực nào.
            Hiện tại UI hardcode để chốt UX, sau đó sẽ tích hợp API và flow xử lý thật.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/15 p-3 text-center backdrop-blur">
          <div>
            <p className="text-xs text-white/80">Trạng thái</p>
            <p className="text-sm font-bold">Live Mock</p>
          </div>
          <div>
            <p className="text-xs text-white/80">Độ ưu tiên</p>
            <p className="text-sm font-bold">P0 UI</p>
          </div>
          <div>
            <p className="text-xs text-white/80">Ngôn ngữ</p>
            <p className="text-sm font-bold">VI (EN)</p>
          </div>
        </div>
      </div>
    </header>
  );
}
