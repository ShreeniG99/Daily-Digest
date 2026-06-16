import * as React from 'react';

export type Domain = 'ai' | 'tech' | 'fintech' | 'healthtech' | 'agrotech';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Domain — renders a colored dot in the domain's warm hue. */
  domain?: Domain;
  /** Keyword/tag style (prefixes "#", no dot). */
  keyword?: boolean;
}

/** Small chip for a domain or a keyword tag. */
export function Tag(props: TagProps): JSX.Element;
