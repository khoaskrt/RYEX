export const sidebarItems = [
  { key: 'dashboard', icon: 'dashboard', label: 'Bảng điều khiển' },
  { key: 'security', icon: 'shield', label: 'Bảo mật' },
  { key: 'support', icon: 'help', label: 'Hỗ trợ' },
  { key: 'settings', icon: 'settings', label: 'Cài đặt' },
];

export function ProfileSidebar({ activeKey, onNavigate }) {
  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] overflow-auto rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-4 lg:block">
      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <button
            aria-current={activeKey === item.key ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${
              activeKey === item.key
                ? 'bg-surface-container-lowest font-bold text-[#006c4f] shadow-sm'
                : 'font-medium text-on-surface-variant hover:bg-surface-container-lowest'
            }`}
            key={item.key}
            onClick={() => onNavigate(item.key)}
            type="button"
          >
            <span className={`material-symbols-outlined text-[20px] ${activeKey === item.key ? 'text-[#01bc8d]' : 'text-[#64748b]'}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
