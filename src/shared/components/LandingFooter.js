export default function LandingFooter() {
  return (
    <footer className="w-full border-t border-[#bbcac1]/15 bg-[#f7f9fb] py-16 dark:bg-slate-950">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 px-8 font-['Manrope'] text-sm leading-relaxed md:grid-cols-4">
        <div className="col-span-1 md:col-span-1">
          <span className="mb-6 block text-xl font-bold text-[#006c4f] font-headline">RYEX</span>
          <p className="mb-8 text-[#3c4a43] opacity-80">
            RYEX - Sàn giao dịch Crypto được cấp phép tại Việt Nam, mang đến giải pháp đầu tư an toàn và hiệu quả.
          </p>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface-container text-primary transition-all hover:bg-primary hover:text-white">
              <span className="material-symbols-outlined text-sm">public</span>
            </div>
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface-container text-primary transition-all hover:bg-primary hover:text-white">
              <span className="material-symbols-outlined text-sm">share</span>
            </div>
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface-container text-primary transition-all hover:bg-primary hover:text-white">
              <span className="material-symbols-outlined text-sm">alternate_email</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface">Sản phẩm</h4>
          <ul className="space-y-4 text-[#3c4a43] opacity-80">
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Giao dịch Spot</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Giao dịch P2P</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Staking &amp; Earn</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Ví RYEX</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface">Tài nguyên</h4>
          <ul className="space-y-4 text-[#3c4a43] opacity-80">
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Học viện RYEX</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Blog thị trường</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">API Documentation</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Trợ giúp</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface">Pháp lý &amp; Tuân thủ</h4>
          <ul className="space-y-4 text-[#3c4a43] opacity-80">
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Điều khoản dịch vụ</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Chính sách bảo mật</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Giấy phép hoạt động</li>
            <li className="cursor-pointer transition-colors duration-200 hover:text-[#01BC8D]">Phòng chống rửa tiền</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-screen-2xl flex-col items-center justify-between gap-4 border-t border-[#bbcac1]/10 px-8 pt-8 md:flex-row">
        <p className="text-xs text-[#3c4a43] opacity-60">© 2024 RYEX. All rights reserved.</p>
        <p className="text-center text-xs text-[#3c4a43] opacity-60 md:text-right">
          RYEX - Sàn giao dịch Crypto được cấp phép tại Việt Nam
        </p>
      </div>
    </footer>
  );
}
