/**
 * GET /api/leaderboard
 *
 * Returns citizen sentinel leaderboard sorted by trust score.
 */

import { NextResponse } from 'next/server';

import { getSampleUsers } from '@/lib/sample-data';

export async function GET() {
  try {
    const users = getSampleUsers()
      .sort((a, b) => b.trustScore - a.trustScore)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('[/api/leaderboard] Error:', error);
    return NextResponse.json(
      { success: false, users: [], error: 'Failed to fetch leaderboard' },
      { status: 500 },
    );
  }
}

export const revalidate = 60;
