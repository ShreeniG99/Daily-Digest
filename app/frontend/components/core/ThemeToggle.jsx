import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/* Theme toggle styled as a switch; sun → moon. Controlled via `checked`
   (true = night). Pairs with document.documentElement[data-theme]. */
export function ThemeToggle({ checked = false, onChange, label = 'Toggle night theme', className = '', ...rest }) {
  const cls = ['dd-switch', className].filter(Boolean).join(' ');
  return (
    <button
      className={cls}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange && onChange(!checked)}
      {...rest}
    >
      <span className="dd-switch__knob">
        <Icon name={checked ? 'moon' : 'sun'} size={12} />
      </span>
    </button>
  );
}
