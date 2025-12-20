import { NextRequest, NextResponse } from 'next/server';
import { recordPageExit, endVisitorSession } from '@/actions/visitor-analytics';

/**
 * Beacon API endpoint for tracking page exits
 * Uses POST because sendBeacon only supports POST
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageVisitId, sessionId, scrollDepth } = body;

    // Record page exit if we have a page visit ID
    if (pageVisitId) {
      await recordPageExit(pageVisitId, scrollDepth);
    }

    // Optionally end session on full page close
    // Note: We don't always end session here as user might return
    if (sessionId && body.endSession) {
      await endVisitorSession(sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in analytics exit endpoint:', error);
    // Return success anyway to not block anything
    return NextResponse.json({ success: true });
  }
}
