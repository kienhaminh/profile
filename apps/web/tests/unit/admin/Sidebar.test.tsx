import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from '@/components/admin/Sidebar';
import { usePathname, useRouter } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

// Mock auth module
vi.mock('@/lib/auth', () => ({
  authPost: vi.fn(),
}));

describe('Sidebar', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();
  const mockRouter = {
    push: mockPush,
    refresh: mockRefresh,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin');
  });

  describe('Menu Items Rendering', () => {
    it('renders all menu items including Tools', () => {
      render(<Sidebar />);

      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Post').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Finance').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tools').length).toBeGreaterThan(0);
    });

    it('renders Admin Panel header', () => {
      render(<Sidebar />);

      expect(screen.getAllByText('Admin Panel').length).toBeGreaterThan(0);
    });

    it('renders Sign Out button', () => {
      render(<Sidebar />);

      expect(screen.getAllByText('Sign Out').length).toBeGreaterThan(0);
    });
  });

  describe('Active Menu Item', () => {
    it('highlights Dashboard when pathname is /admin', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin');
      const { container } = render(<Sidebar />);

      const dashboardLinks = container.querySelectorAll('a[href="/admin"]');
      const hasActiveClass = Array.from(dashboardLinks).some((link) =>
        link.className.includes('bg-accent')
      );
      expect(hasActiveClass).toBe(true);
    });

    it('highlights Tools when pathname is /admin/tools', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin/tools');
      const { container } = render(<Sidebar />);

      const toolsLinks = container.querySelectorAll('a[href="/admin/tools"]');
      const hasActiveClass = Array.from(toolsLinks).some((link) =>
        link.className.includes('bg-accent')
      );
      expect(hasActiveClass).toBe(true);
    });

    it('highlights Post when pathname is /admin/blogs', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin/blogs');
      const { container } = render(<Sidebar />);

      const postLinks = container.querySelectorAll('a[href="/admin/blogs"]');
      const hasActiveClass = Array.from(postLinks).some((link) =>
        link.className.includes('bg-accent')
      );
      expect(hasActiveClass).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('has correct href for Tools menu item', () => {
      render(<Sidebar />);

      const toolsLinks = screen.getAllByText('Tools');
      const toolsLink = toolsLinks[0].closest('a');
      expect(toolsLink?.getAttribute('href')).toBe('/admin/tools');
    });

    it('has correct href for Dashboard menu item', () => {
      render(<Sidebar />);

      const dashboardLinks = screen.getAllByText('Dashboard');
      const dashboardLink = dashboardLinks[0].closest('a');
      expect(dashboardLink?.getAttribute('href')).toBe('/admin');
    });

    it('has correct href for Post menu item', () => {
      render(<Sidebar />);

      const postLinks = screen.getAllByText('Post');
      const postLink = postLinks[0].closest('a');
      expect(postLink?.getAttribute('href')).toBe('/admin/blogs');
    });

    it('has correct href for Analytics menu item', () => {
      render(<Sidebar />);

      const analyticsLinks = screen.getAllByText('Analytics');
      const analyticsLink = analyticsLinks[0].closest('a');
      expect(analyticsLink?.getAttribute('href')).toBe('/admin/analytics');
    });

    it('has correct href for Finance menu item', () => {
      render(<Sidebar />);

      const financeLinks = screen.getAllByText('Finance');
      const financeLink = financeLinks[0].closest('a');
      expect(financeLink?.getAttribute('href')).toBe('/admin/finance');
    });
  });

  describe('Sign Out Functionality', () => {
    it('calls logout API when Sign Out button is clicked', async () => {
      const { authPost } = await import('@/lib/auth');
      const mockAuthPost = authPost as ReturnType<typeof vi.fn>;
      mockAuthPost.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      render(<Sidebar />);

      const signOutButtons = screen.getAllByText('Sign Out');
      fireEvent.click(signOutButtons[0]);

      await waitFor(() => {
        expect(mockAuthPost).toHaveBeenCalledWith('/api/admin/logout', {});
      });
    });

    it('redirects to login page after successful logout', async () => {
      const { authPost } = await import('@/lib/auth');
      const mockAuthPost = authPost as ReturnType<typeof vi.fn>;
      mockAuthPost.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      render(<Sidebar />);

      const signOutButtons = screen.getAllByText('Sign Out');
      fireEvent.click(signOutButtons[0]);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/login');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('displays error message when logout fails', async () => {
      const { authPost } = await import('@/lib/auth');
      const mockAuthPost = authPost as ReturnType<typeof vi.fn>;
      mockAuthPost.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Logout failed' }),
      });

      render(<Sidebar />);

      const signOutButtons = screen.getAllByText('Sign Out');
      fireEvent.click(signOutButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByText('Logout failed').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Mobile Menu', () => {
    it('renders mobile menu trigger button', () => {
      const { container } = render(<Sidebar />);

      // Mobile menu button should be present
      const mobileButton = container.querySelector('button[class*="fixed"]');
      expect(mobileButton).toBeTruthy();
    });

    it('opens mobile menu when trigger is clicked', async () => {
      const { container } = render(<Sidebar />);

      const mobileButton = container.querySelector(
        'button[class*="fixed"]'
      ) as HTMLButtonElement;
      expect(mobileButton).toBeTruthy();

      fireEvent.click(mobileButton);

      // Sheet should open - check for scroll-locked body which indicates the sheet is open
      await waitFor(() => {
        const body = document.body;
        expect(body.getAttribute('data-scroll-locked')).toBe('1');
      });
    });
  });

  describe('Accessibility', () => {
    it('has visually hidden sheet title for screen readers', () => {
      const { container } = render(<Sidebar />);

      // Open mobile menu
      const mobileButton = container.querySelector(
        'button[class*="fixed"]'
      ) as HTMLButtonElement;
      fireEvent.click(mobileButton);

      // Check for visually hidden title
      const sheetTitles = screen.getAllByText('Navigation Menu');
      expect(sheetTitles.length).toBeGreaterThan(0);
    });

    it('has visually hidden sheet description for screen readers', () => {
      const { container } = render(<Sidebar />);

      // Open mobile menu
      const mobileButton = container.querySelector(
        'button[class*="fixed"]'
      ) as HTMLButtonElement;
      fireEvent.click(mobileButton);

      // Check for visually hidden description
      const sheetDescriptions = screen.getAllByText(
        'Main navigation menu for the admin dashboard'
      );
      expect(sheetDescriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Visual Indicators', () => {
    it('displays icon for each menu item', () => {
      const { container } = render(<Sidebar />);

      // Check for SVG icons (lucide-react icons render as SVG)
      const icons = container.querySelectorAll('svg');
      // Should have icons for: Dashboard, Post, Hashtag, Topic, Tools, LogOut, and Menu (doubled for mobile/desktop)
      expect(icons.length).toBeGreaterThanOrEqual(7);
    });

    it('applies correct styling to active menu item', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin/tools');
      const { container } = render(<Sidebar />);

      const toolsLinks = container.querySelectorAll('a[href="/admin/tools"]');
      const hasActiveClass = Array.from(toolsLinks).some((link) =>
        link.className.includes('bg-accent')
      );
      expect(hasActiveClass).toBe(true);
    });

    it('applies hover styling to inactive menu items', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin');
      const { container } = render(<Sidebar />);

      const toolsLinks = container.querySelectorAll('a[href="/admin/tools"]');
      const hasHoverClass = Array.from(toolsLinks).some((link) =>
        link.className.includes('hover:bg-accent/50')
      );
      expect(hasHoverClass).toBe(true);
    });
  });
});
