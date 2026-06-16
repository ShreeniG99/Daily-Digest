import React from 'react';

export function Tag({ domain, keyword = false, children, className = '', ...rest }) {
  const cls = ['dd-tag', keyword && 'dd-tag--keyword', className].filter(Boolean).join(' ');
  return (
    <span className={cls} data-domain={domain || undefined} {...rest}>
      {domain && !keyword && <span className="dd-tag__dot" />}
      {children}
    </span>
  );
}
