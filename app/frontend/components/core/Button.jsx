import React from 'react';
import { Icon } from '../icon/Icon.jsx';

export function Button({
  children, variant = 'primary', size = 'md', block = false,
  icon, iconRight, className = '', ...rest
}) {
  const cls = [
    'dd-btn',
    variant !== 'primary' && `dd-btn--${variant}`,
    size !== 'md' && `dd-btn--${size}`,
    block && 'dd-btn--block',
    className,
  ].filter(Boolean).join(' ');
  const ic = size === 'sm' ? 15 : 17;
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={ic} />}
      {children}
      {iconRight && <Icon name={iconRight} size={ic} />}
    </button>
  );
}
