import * as React from 'react';

export type IconName =
  | 'newspaper' | 'youtube' | 'file-text' | 'github' | 'briefcase'
  | 'check' | 'check-circle' | 'bookmark' | 'bookmark-check' | 'external-link'
  | 'volume-2' | 'headphones' | 'play' | 'pause' | 'skip-forward'
  | 'sun' | 'moon' | 'search' | 'sliders' | 'bell'
  | 'chevron-right' | 'chevron-down' | 'arrow-right' | 'x' | 'clock'
  | 'sparkles' | 'rss' | 'more-horizontal' | 'alert-triangle' | 'inbox';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Which glyph to render (Lucide-sourced set). */
  name: IconName;
  /** Pixel size for width & height. Default 20. */
  size?: number;
  /** Stroke width. Default 2. */
  strokeWidth?: number;
}

/** Inline stroke icon from the Daily Digest (Lucide) set. */
export function Icon(props: IconProps): JSX.Element;
