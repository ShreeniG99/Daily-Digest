import * as React from 'react';

export interface ScoreSignalProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Raw relevance score from the ranker. */
  score?: number;
  /** Score that maps to a full 5-pip meter. Default 12. */
  max?: number;
  /** Show numeric readout. Default true. */
  showNumber?: boolean;
  /** Show the "Match" eyebrow label. */
  showLabel?: boolean;
}

/** Gold pip-meter + number expressing how well an item matches interests. */
export function ScoreSignal(props: ScoreSignalProps): JSX.Element;
