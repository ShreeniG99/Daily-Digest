import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/* Segmented control for the kind filter. options: [{value, label, icon?, count?}] */
export function SegmentedControl({ options = [], value, onChange, className = '', ...rest }) {
  const cls = ['dd-seg', className].filter(Boolean).join(' ');
  return (
    <div className={cls} role="tablist" {...rest}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={selected}
            className="dd-seg__opt"
            onClick={() => onChange && onChange(opt.value)}
          >
            {opt.icon && <Icon name={opt.icon} size={15} />}
            {opt.label}
            {opt.count != null && <span className="dd-seg__count">{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
