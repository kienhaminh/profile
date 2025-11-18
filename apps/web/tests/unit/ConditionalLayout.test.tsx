import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { usePathname } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock Navbar component
vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock Footer component
vi.mock('@/components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('ConditionalLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Public Routes', () => {
    it('renders Navbar and Footer for home page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');

      render(
        <ConditionalLayout>
          <div data-testid="content">Home Content</div>
        </ConditionalLayout>
      );

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders Navbar and Footer for blog page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/blog');

      render(
        <ConditionalLayout>
          <div data-testid="content">Blog Content</div>
        </ConditionalLayout>
      );

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders Navbar and Footer for projects page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/projects');

      render(
        <ConditionalLayout>
          <div data-testid="content">Projects Content</div>
        </ConditionalLayout>
      );

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders Navbar and Footer for about page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/about');

      render(
        <ConditionalLayout>
          <div data-testid="content">About Content</div>
        </ConditionalLayout>
      );

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Admin Routes', () => {
    it('does NOT render Navbar and Footer for admin dashboard', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin');

      render(
        <ConditionalLayout>
          <div data-testid="content">Admin Dashboard</div>
        </ConditionalLayout>
      );

      expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('does NOT render Navbar and Footer for admin login', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        '/admin/login'
      );

      render(
        <ConditionalLayout>
          <div data-testid="content">Admin Login</div>
        </ConditionalLayout>
      );

      expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('does NOT render Navbar and Footer for admin blogs page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        '/admin/blogs'
      );

      render(
        <ConditionalLayout>
          <div data-testid="content">Admin Blogs</div>
        </ConditionalLayout>
      );

      expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('does NOT render Navbar and Footer for admin tools page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        '/admin/tools'
      );

      render(
        <ConditionalLayout>
          <div data-testid="content">Admin Tools</div>
        </ConditionalLayout>
      );

      expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('does NOT render Navbar and Footer for admin projects page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        '/admin/projects'
      );

      render(
        <ConditionalLayout>
          <div data-testid="content">Admin Projects</div>
        </ConditionalLayout>
      );

      expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('does NOT render Navbar and Footer for admin hashtags page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        '/admin/hashtags'
      );

      render(
        <ConditionalLayout>
          <div data-testid="content">Admin Hashtags</div>
        </ConditionalLayout>
      );

      expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('does NOT render Navbar and Footer for admin topics page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        '/admin/topics'
      );

      render(
        <ConditionalLayout>
          <div data-testid="content">Admin Topics</div>
        </ConditionalLayout>
      );

      expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null pathname gracefully', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(null);

      render(
        <ConditionalLayout>
          <div data-testid="content">Content</div>
        </ConditionalLayout>
      );

      // Should default to showing navbar/footer when pathname is null
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('handles undefined pathname gracefully', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

      render(
        <ConditionalLayout>
          <div data-testid="content">Content</div>
        </ConditionalLayout>
      );

      // Should default to showing navbar/footer when pathname is undefined
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('always renders children content for public routes', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');

      render(
        <ConditionalLayout>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ConditionalLayout>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });

    it('always renders children content for admin routes', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin');

      render(
        <ConditionalLayout>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ConditionalLayout>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });
});
