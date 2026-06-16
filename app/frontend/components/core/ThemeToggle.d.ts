import * as React from 'react';

export interface ThemeToggleProps {
  /** true = night theme on. */
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  className?: string;
}

/** Sun/moon switch that toggles the sepia ↔ night theme. */
export function ThemeToggle(props: ThemeToggleProps): JSX.Element;
