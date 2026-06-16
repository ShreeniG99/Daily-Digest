import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/* Empty / loading / error states for the feed. variant:
   'empty' | 'loading' | 'error'. */
export function EmptyState({
  variant = 'empty', icon, title, children, action, className = '', ...rest
}) {
  const cls = ['dd-empty', variant === 'error' && 'dd-empty--error', className].filter(Boolean).join(' ');
  const fallbackIcon = variant === 'error' ? 'alert-triangle' : 'inbox';
  return (
    <div className={cls} role={variant === 'error' ? 'alert' : 'status'} {...rest}>
      <span className="dd-empty__icon">
        {variant === 'loading'
          ? <span className="dd-spinner" />
          : <Icon name={icon || fallbackIcon} size={26} />}
      </span>
      {title && <p className="dd-empty__title">{title}</p>}
      {children && <p className="dd-empty__body">{children}</p>}
      {action}
    </div>
  );
}
