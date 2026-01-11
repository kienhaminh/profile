'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  createVisitorSession,
  getActiveSession,
  recordPageEntry,
  recordPageExit,
} from '@/actions/visitor-analytics';

// Constants
const VISITOR_ID_KEY = 'visitor_id';
const SESSION_ID_KEY = 'visitor_session_id';
const PAGE_VISIT_ID_KEY = 'current_page_visit_id';
const LAST_ACTIVITY_KEY = 'visitor_last_activity';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Detect device type from user agent
 */
function detectDevice(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Get or create visitor ID
 */
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

/**
 * Check if session has timed out
 */
function isSessionTimedOut(): boolean {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return true;

  const elapsed = Date.now() - parseInt(lastActivity, 10);
  return elapsed > SESSION_TIMEOUT_MS;
}

/**
 * Update last activity timestamp
 */
function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Get current scroll depth as percentage
 */
function getScrollDepth(): number {
  if (typeof window === 'undefined') return 0;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (docHeight <= 0) return 100;

  return Math.min(100, Math.round((scrollTop / docHeight) * 100));
}

export function VisitorTracker(): null {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const pageVisitIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const maxScrollDepthRef = useRef(0);
  const previousPathnameRef = useRef<string | null>(null);

  // Track maximum scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const currentDepth = getScrollDepth();
      if (currentDepth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = currentDepth;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // End current page visit
  const endCurrentPageVisit = useCallback(async () => {
    const pageVisitId =
      pageVisitIdRef.current || localStorage.getItem(PAGE_VISIT_ID_KEY);
    if (pageVisitId) {
      try {
        await recordPageExit(pageVisitId, maxScrollDepthRef.current);
      } catch {
        // Silent fail - don't block navigation
      }
      pageVisitIdRef.current = null;
      localStorage.removeItem(PAGE_VISIT_ID_KEY);
      maxScrollDepthRef.current = 0;
    }
  }, []);

  // Start a new page visit
  const startNewPageVisit = useCallback(
    async (sessionId: string, path: string) => {
      try {
        // Get page title after a short delay to ensure it's set
        await new Promise((resolve) => setTimeout(resolve, 100));
        const pageTitle =
          typeof document !== 'undefined' ? document.title : undefined;
        const visit = await recordPageEntry(sessionId, path, pageTitle);
        pageVisitIdRef.current = visit.id;
        localStorage.setItem(PAGE_VISIT_ID_KEY, visit.id);
        maxScrollDepthRef.current = 0;
      } catch {
        // Silent fail
      }
    },
    []
  );

  // Initialize or resume session
  const initSession = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const visitorId = getOrCreateVisitorId();

    // Check for existing session
    const storedSessionId = localStorage.getItem(SESSION_ID_KEY);

    if (storedSessionId && !isSessionTimedOut()) {
      // Resume existing session
      sessionIdRef.current = storedSessionId;
      updateLastActivity();
      return storedSessionId;
    }

    try {
      // Check server for active session
      const activeSession = await getActiveSession(visitorId);

      if (activeSession) {
        sessionIdRef.current = activeSession.id;
        localStorage.setItem(SESSION_ID_KEY, activeSession.id);
        updateLastActivity();
        return activeSession.id;
      }

      // Create new session
      const session = await createVisitorSession(visitorId, {
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
        device: detectDevice(),
      });
      sessionIdRef.current = session.id;
      localStorage.setItem(SESSION_ID_KEY, session.id);
      updateLastActivity();
      return session.id;
    } catch {
      // Silent fail
      return null;
    }
  }, []);

  // Main effect - handles both initialization and route changes
  useEffect(() => {
    // Skip tracking for admin pages
    if (pathname.startsWith('/admin')) {
      return;
    }

    // Skip if pathname hasn't changed (except for initial load)
    if (previousPathnameRef.current === pathname && isInitializedRef.current) {
      return;
    }

    const handlePageChange = async () => {
      // End previous page visit if this is a route change (not initial load)
      if (isInitializedRef.current && previousPathnameRef.current !== null) {
        await endCurrentPageVisit();
      }

      // Update previous pathname
      previousPathnameRef.current = pathname;

      // Initialize session if needed
      let sessionId = sessionIdRef.current;
      if (!sessionId || isSessionTimedOut()) {
        sessionId = await initSession();
      }

      // Mark as initialized after first run
      isInitializedRef.current = true;

      // Start new page visit
      if (sessionId) {
        await startNewPageVisit(sessionId, pathname);
        updateLastActivity();
      }
    };

    handlePageChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle page unload and visibility
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable exit tracking
      const pageVisitId =
        pageVisitIdRef.current || localStorage.getItem(PAGE_VISIT_ID_KEY);
      const sessionId =
        sessionIdRef.current || localStorage.getItem(SESSION_ID_KEY);

      if (pageVisitId) {
        navigator.sendBeacon(
          '/api/analytics/exit',
          JSON.stringify({
            pageVisitId,
            sessionId,
            scrollDepth: maxScrollDepthRef.current,
          })
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateLastActivity();
      } else if (document.visibilityState === 'visible') {
        if (isSessionTimedOut()) {
          localStorage.removeItem(SESSION_ID_KEY);
          sessionIdRef.current = null;
        }
        updateLastActivity();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
