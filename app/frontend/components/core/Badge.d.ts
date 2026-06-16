import * as React from 'react';

export type ItemKind = 'news' | 'youtube' | 'paper' | 'repo' | 'opportunity';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content kind — sets icon, label and warm hue. */
  kind?: ItemKind;
  /** Filled (solid hue) instead of tinted. */
  solid?: boolean;
  /** Override the default kind label. */
  label?: string;
}

/** Kind badge — icon + label tinted by content kind. */
export function Badge(props: BadgeProps): JSX.Element;
