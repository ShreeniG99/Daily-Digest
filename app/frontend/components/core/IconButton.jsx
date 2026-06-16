import React from 'react';
import { Icon } from '../icon/Icon.jsx';

export function IconButton({
  icon, label, size = 'md', bordered = false, active = false,
  accent = false, className = '', ...rest
}) {
  const cls = [
    'dd-iconbtn',
    size === 'sm' && 'dd-iconbtn--sm',
    bordered && 'dd-iconbtn--bordered',
    active && 'dd-iconbtn--active',
    accent && 'dd-iconbtn--accent',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button className={cls} aria-label={label} title={label} aria-pressed={active || undefined} {...rest}>
      <Icon name={icon} size={size === 'sm' ? 16 : 19} />
    </button>
  );
}
