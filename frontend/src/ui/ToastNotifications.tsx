import { useUiStore } from '../stores/uiStore';

const typeStyles = {
  success: 'bg-green-800 border-green-500 text-green-200',
  error: 'bg-red-800 border-red-500 text-red-200',
  info: 'bg-blue-800 border-blue-500 text-blue-200',
};

const typeIcons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

export default function ToastNotifications() {
  const notifications = useUiStore((s) => s.notifications);
  const removeNotification = useUiStore((s) => s.removeNotification);

  // Show max 3 notifications
  const visibleNotifications = notifications.slice(-3);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="absolute top-2 right-2 font-pixel text-[8px] flex flex-col gap-1 pointer-events-none z-[100]">
      {visibleNotifications.map((n, index) => (
        <div
          key={n.id}
          className={`
            ${typeStyles[n.type]}
            border-2 rounded px-3 py-1.5 pointer-events-auto cursor-pointer
            transform transition-all duration-200 ease-out
            ${index === visibleNotifications.length - 1 ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-90'}
            hover:scale-105
          `}
          style={{
            animation: 'slideIn 0.2s ease-out',
          }}
          onClick={() => removeNotification(n.id)}
        >
          <span className="mr-1">{typeIcons[n.type]}</span>
          {n.message}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
