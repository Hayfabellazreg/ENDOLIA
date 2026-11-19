import React from 'react';
import { useApp } from '../context/AppContext';

/**
 * NotificationItem renders a single notification line.
 * It calls `markRead` from the context when clicked.
 */
export default function NotificationItem({ notification, onClick }) {
  const { markRead } = useApp();

  const handleClick = () => {
    if (!notification.read) {
      markRead(notification.id);
    }
    if (onClick) onClick(notification);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        background: notification.read ? 'transparent' : 'var(--bg-glass)',
        borderBottom: '1px solid var(--border)',
        transition: 'var(--transition)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-glass)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = notification.read ? 'transparent' : '')}
    >
      {/* Icon */}
      <div style={{ fontSize: '1.2rem' }}>{notification.icon || '🔔'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-100)' }}>{notification.title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-400)' }}>{notification.message}</div>
      </div>
    </div>
  );
}
