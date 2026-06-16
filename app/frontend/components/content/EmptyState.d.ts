import * as React from 'react';
import { IconName } from '../icon/Icon';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 'empty' (default), 'loading' (spinner), or 'error'. */
  variant?: 'empty' | 'loading' | 'error';
  /** Icon for empty/error states. */
  icon?: IconName;
  title?: string;
  /** Optional action node (e.g. a <Button/>). */
  action?: React.ReactNode;
}

/** Feed placeholder for empty, loading, and error states. */
export function EmptyState(props: EmptyStateProps): JSX.Element;
