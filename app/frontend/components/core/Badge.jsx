import React from 'react';
import { Icon } from '../icon/Icon.jsx';

const KIND_ICON = {
  news: 'newspaper',
  youtube: 'youtube',
  paper: 'file-text',
  repo: 'github',
  opportunity: 'briefcase',
};
const KIND_LABEL = {
  news: 'News', youtube: 'Video', paper: 'Paper', repo: 'Repo', opportunity: 'Opportunity',
};

export function Badge({ kind = 'news', solid = false, label, children, className = '', ...rest }) {
  const cls = ['dd-badge', solid && 'dd-badge--solid', className].filter(Boolean).join(' ');
  return (
    <span className={cls} data-kind={kind} {...rest}>
      <Icon name={KIND_ICON[kind] || 'newspaper'} size={13} />
      {label || children || KIND_LABEL[kind] || kind}
    </span>
  );
}
