'use client';

import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpvoteButtonProps {
  count: number;
  hotspotId: string;
}

export function UpvoteButton({ count, hotspotId: _hotspotId }: UpvoteButtonProps) {
  const [voted, setVoted] = useState(false);
  const [displayCount, setDisplayCount] = useState(count);
  const [animating, setAnimating] = useState(false);

  function handleVote() {
    if (voted) return;
    setVoted(true);
    setDisplayCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 500);
    // In production: POST /api/hotspots/${hotspotId}/upvote
    // console.log('Upvote hotspot:', hotspotId);
  }

  return (
    <button
      onClick={handleVote}
      disabled={voted}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
        voted
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
          : 'border-border text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 active:scale-95',
      )}
    >
      <ThumbsUp
        className={cn('size-3.5 transition-transform', animating ? 'scale-150' : 'scale-100', voted && 'fill-emerald-400')}
      />
      <span>{displayCount}</span>
      <span>{voted ? 'Verified!' : 'Verify'}</span>
    </button>
  );
}
