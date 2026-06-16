import * as React from 'react';
import { IconName } from '../icon/Icon';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon glyph. */
  icon: IconName;
  /** Accessible label (also the tooltip). */
  label: string;
  size?: 'sm' | 'md';
  /** Show a hairline border + card fill. */
  bordered?: boolean;
  /** Toggled-on state (e.g. saved). Colors gold, or sienna when `accent`. */
  active?: boolean;
  /** Use the sienna accent for the active color instead of gold. */
  accent?: boolean;
}

/** Square icon-only button for card actions, toolbars, toggles. */
export function IconButton(props: IconButtonProps): JSX.Element;
