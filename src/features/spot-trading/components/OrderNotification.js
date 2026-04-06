'use client';

export default function OrderNotification({ type = 'success', message = '', onClose }) {
  if (!message) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        type === 'success' ? 'bg-primary' : 'bg-error'
      }`}
    >
      <button
        className="absolute right-2 top-1 text-white/90 hover:text-white"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
      <p className="pr-5">{message}</p>
    </div>
  );
}
