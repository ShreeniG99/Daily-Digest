import * as React from 'react';
import { IconName } from '../icon/Icon';

export interface SegOption {
  value: string;
  label: string;
  icon?: IconName;
  count?: number;
}

export interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  options: SegOption[];
  value: string;
  onChange?: (value: string) => void;
}

/** Pill segmented control — the kind filter (All / News / Papers / …). */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
