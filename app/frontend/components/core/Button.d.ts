import * as React from 'react';
import { IconName } from '../icon/Icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Default 'primary'. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Full-width. */
  block?: boolean;
  /** Leading icon name. */
  icon?: IconName;
  /** Trailing icon name. */
  iconRight?: IconName;
}

/**
 * Primary text button — actions like "Read all", "Apply", "Load new".
 * @startingPoint section="Core" subtitle="Button variants & sizes" viewport="700x150"
 */
export function Button(props: ButtonProps): JSX.Element;
