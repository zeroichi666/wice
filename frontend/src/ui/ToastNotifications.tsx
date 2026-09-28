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

  if (notifications.length === 0) return null;

  return (
    <div className="absolute top-2 right-2 font-pixel text-[8px] flex flex-col gap-1 pointer-events-none z-[100]">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`
            ${typeStyles[n.type]}
            border-2 rounded px-3 py-1.5 pointer-events-auto cursor-pointer
            animate-in slide-in-from-right fade-in duration-200
          `}
          onClick={() => removeNotification(n.id)}
        >
          <span className="mr-1">{typeIcons[n.type]}</span>
          {n.message}
        </div>
      ))}
    </div>
  );
}
