import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card Component', () => {
  describe('Card', () => {
    it('should render with default classes', () => {
      const { container } = render(<Card data-testid="card">Content</Card>);
      const card = container.querySelector('[data-testid="card"]');

      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
      expect(card).toHaveClass('shadow');
    });

    it('should render children correctly', () => {
      render(<Card>Test Content</Card>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      );
      const card = container.querySelector('[data-testid="card"]');

      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('rounded-xl'); // Should still have default classes
    });

    it('should forward ref correctly', () => {
      const ref = { current: null };
      render(
        <Card ref={ref as React.RefObject<HTMLDivElement>}>Content</Card>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      const { container } = render(
        <Card data-testid="card" aria-label="Card label">
          Content
        </Card>
      );
      const card = container.querySelector('[data-testid="card"]');

      expect(card).toHaveAttribute('aria-label', 'Card label');
    });
  });

  describe('CardHeader', () => {
    it('should render with default classes', () => {
      const { container } = render(
        <CardHeader data-testid="header">Header</CardHeader>
      );
      const header = container.querySelector('[data-testid="header"]');

      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('space-y-1.5');
      expect(header).toHaveClass('p-6');
    });

    it('should render children correctly', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <CardHeader className="custom-header" data-testid="header">
          Header
        </CardHeader>
      );
      const header = container.querySelector('[data-testid="header"]');

      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('flex');
    });
  });

  describe('CardTitle', () => {
    it('should render with default classes', () => {
      const { container } = render(
        <CardTitle data-testid="title">Title</CardTitle>
      );
      const title = container.querySelector('[data-testid="title"]');

      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveClass('tracking-tight');
    });

    it('should render children correctly', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <CardTitle className="text-2xl" data-testid="title">
          Title
        </CardTitle>
      );
      const title = container.querySelector('[data-testid="title"]');

      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('should render with default classes', () => {
      const { container } = render(
        <CardDescription data-testid="description">
          Description
        </CardDescription>
      );
      const description = container.querySelector('[data-testid="description"]');

      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('should render children correctly', () => {
      render(<CardDescription>Card Description</CardDescription>);
      expect(screen.getByText('Card Description')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <CardDescription className="text-gray-600" data-testid="description">
          Description
        </CardDescription>
      );
      const description = container.querySelector('[data-testid="description"]');

      expect(description).toHaveClass('text-gray-600');
      expect(description).toHaveClass('text-sm');
    });
  });

  describe('CardContent', () => {
    it('should render with default classes', () => {
      const { container } = render(
        <CardContent data-testid="content">Content</CardContent>
      );
      const content = container.querySelector('[data-testid="content"]');

      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
    });

    it('should render children correctly', () => {
      render(<CardContent>Card Content</CardContent>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <CardContent className="custom-content" data-testid="content">
          Content
        </CardContent>
      );
      const content = container.querySelector('[data-testid="content"]');

      expect(content).toHaveClass('custom-content');
      expect(content).toHaveClass('p-6');
    });
  });

  describe('CardFooter', () => {
    it('should render with default classes', () => {
      const { container } = render(
        <CardFooter data-testid="footer">Footer</CardFooter>
      );
      const footer = container.querySelector('[data-testid="footer"]');

      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0');
    });

    it('should render children correctly', () => {
      render(<CardFooter>Card Footer</CardFooter>);
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <CardFooter className="justify-end" data-testid="footer">
          Footer
        </CardFooter>
      );
      const footer = container.querySelector('[data-testid="footer"]');

      expect(footer).toHaveClass('justify-end');
      expect(footer).toHaveClass('flex');
    });
  });

  describe('Composition', () => {
    it('should render complete card with all components', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test Footer')).toBeInTheDocument();
    });

    it('should maintain proper structure when nested', () => {
      const { container } = render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const card = container.querySelector('[data-testid="card"]');
      const header = container.querySelector('[data-testid="header"]');
      const title = container.querySelector('[data-testid="title"]');

      expect(card).toContainElement(header);
      expect(header).toContainElement(title);
    });
  });

  describe('Related Posts Use Case', () => {
    it('should render related post card as used in blog page', () => {
      const relatedPost = {
        id: '1',
        slug: 'test-post',
        title: 'Related Test Post',
        score: 8,
      };

      render(
        <Card data-testid="related-card">
          <CardHeader>
            <CardTitle className="text-lg line-clamp-2">
              {relatedPost.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Relevance score: {relatedPost.score}
            </CardDescription>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Related Test Post')).toBeInTheDocument();
      expect(screen.getByText('Relevance score: 8')).toBeInTheDocument();

      const card = screen.getByTestId('related-card');
      expect(card).toHaveClass('rounded-xl', 'border', 'shadow');
    });
  });
});
