import * as React from 'react';

export interface DigestItem {
  id?: string;
  kind?: 'news' | 'youtube' | 'paper' | 'repo' | 'opportunity';
  source?: string;
  title?: string;
  url?: string;
  author?: string;
  published_ts?: number;
  raw_text?: string;
  tags?: string[];
  domain?: 'ai' | 'tech' | 'fintech' | 'healthtech' | 'agrotech';
  score?: number;
  status?: 'new' | 'read' | 'saved';
}

export interface ItemCardProps extends React.HTMLAttributes<HTMLElement> {
  /** One item matching the items.json shape. */
  item: DigestItem;
  /** Denser layout for desktop list / multi-column. */
  compact?: boolean;
  /** Score that maps to a full meter. Default 12. */
  scoreMax?: number;
  onRead?: (item: DigestItem) => void;
  onSave?: (item: DigestItem) => void;
  onOpen?: (item: DigestItem) => void;
}

/**
 * The core Daily Digest content card: kind badge, domain, score, title
 * (links out), source + relative time, truncated abstract, tags, actions.
 * @startingPoint section="Content" subtitle="Ranked content card with actions" viewport="700x320"
 */
export function ItemCard(props: ItemCardProps): JSX.Element;
