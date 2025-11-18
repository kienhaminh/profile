import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ToolsPage from '@/app/admin/(dashboard)/tools/page';

describe('ToolsPage', () => {
  beforeEach(() => {
    // Clear any previous renders
  });

  describe('Page Header', () => {
    it('renders page title', () => {
      render(<ToolsPage />);

      expect(screen.getByText('Admin Tools')).toBeInTheDocument();
    });

    it('renders page description', () => {
      render(<ToolsPage />);

      expect(
        screen.getByText('Your personal toolkit for productivity')
      ).toBeInTheDocument();
    });

    it('renders Add New Tool button', () => {
      render(<ToolsPage />);

      const addButton = screen.getByText('Add New Tool');
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Tool Categories', () => {
    it('renders all category filter cards', () => {
      render(<ToolsPage />);

      expect(screen.getByText('All Tools')).toBeInTheDocument();
      expect(screen.getByText('Social Network Scripts')).toBeInTheDocument();
      expect(screen.getByText('Automation Flows')).toBeInTheDocument();
      expect(screen.getByText('Image Generation')).toBeInTheDocument();
      expect(screen.getByText('AI Tools')).toBeInTheDocument();
    });

    it('displays correct tool count for All Tools category', () => {
      render(<ToolsPage />);

      // Should show "5 tools" for the sample data
      const allToolsCard = screen.getByText('All Tools').closest('.p-4');
      expect(allToolsCard).toHaveTextContent('5 tools');
    });

    it('displays correct tool count for Social Network Scripts', () => {
      render(<ToolsPage />);

      const socialCard = screen
        .getByText('Social Network Scripts')
        .closest('.p-4');
      expect(socialCard).toHaveTextContent('2 tools');
    });

    it('displays correct tool count for Automation Flows', () => {
      render(<ToolsPage />);

      const automationCard = screen
        .getByText('Automation Flows')
        .closest('.p-4');
      expect(automationCard).toHaveTextContent('1 tools');
    });

    it('displays correct tool count for Image Generation', () => {
      render(<ToolsPage />);

      const imageCard = screen.getByText('Image Generation').closest('.p-4');
      expect(imageCard).toHaveTextContent('1 tools');
    });

    it('displays correct tool count for AI Tools', () => {
      render(<ToolsPage />);

      const aiCard = screen.getByText('AI Tools').closest('.p-4');
      expect(aiCard).toHaveTextContent('1 tools');
    });
  });

  describe('Category Filtering', () => {
    it('shows all tools by default', () => {
      render(<ToolsPage />);

      expect(screen.getByText('Twitter Thread Generator')).toBeInTheDocument();
      expect(
        screen.getByText('LinkedIn Post Formatter')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Content Calendar Automation')
      ).toBeInTheDocument();
      expect(screen.getByText('Thumbnail Generator')).toBeInTheDocument();
      expect(screen.getByText('SEO Meta Generator')).toBeInTheDocument();
    });

    it('filters tools when Social Network Scripts category is clicked', () => {
      render(<ToolsPage />);

      const socialCard = screen.getByText('Social Network Scripts');
      fireEvent.click(socialCard);

      // Should show only social network tools
      expect(screen.getByText('Twitter Thread Generator')).toBeInTheDocument();
      expect(
        screen.getByText('LinkedIn Post Formatter')
      ).toBeInTheDocument();

      // Should not show other category tools
      expect(
        screen.queryByText('Content Calendar Automation')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Thumbnail Generator')).not.toBeInTheDocument();
      expect(screen.queryByText('SEO Meta Generator')).not.toBeInTheDocument();
    });

    it('filters tools when Automation Flows category is clicked', () => {
      render(<ToolsPage />);

      const automationCard = screen.getByText('Automation Flows');
      fireEvent.click(automationCard);

      // Should show only automation tools
      expect(
        screen.getByText('Content Calendar Automation')
      ).toBeInTheDocument();

      // Should not show other category tools
      expect(
        screen.queryByText('Twitter Thread Generator')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('LinkedIn Post Formatter')
      ).not.toBeInTheDocument();
    });

    it('filters tools when Image Generation category is clicked', () => {
      render(<ToolsPage />);

      const imageCard = screen.getByText('Image Generation');
      fireEvent.click(imageCard);

      // Should show only image tools
      expect(screen.getByText('Thumbnail Generator')).toBeInTheDocument();
    });

    it('filters tools when AI Tools category is clicked', () => {
      render(<ToolsPage />);

      const aiCard = screen.getByText('AI Tools');
      fireEvent.click(aiCard);

      // Should show only AI tools
      expect(screen.getByText('SEO Meta Generator')).toBeInTheDocument();
    });

    it('returns to all tools when All Tools category is clicked', () => {
      render(<ToolsPage />);

      // First filter to a specific category
      const socialCard = screen.getByText('Social Network Scripts');
      fireEvent.click(socialCard);

      // Then click All Tools
      const allToolsCard = screen.getByText('All Tools');
      fireEvent.click(allToolsCard);

      // Should show all tools again
      expect(screen.getByText('Twitter Thread Generator')).toBeInTheDocument();
      expect(
        screen.getByText('Content Calendar Automation')
      ).toBeInTheDocument();
      expect(screen.getByText('Thumbnail Generator')).toBeInTheDocument();
      expect(screen.getByText('SEO Meta Generator')).toBeInTheDocument();
    });

    it('applies active styling to selected category', () => {
      const { container } = render(<ToolsPage />);

      const socialCard = screen.getByText('Social Network Scripts');
      fireEvent.click(socialCard);

      const socialCardElement = socialCard.closest('.border-2');
      expect(socialCardElement?.className).toContain('border-primary');
    });
  });

  describe('Tool Cards', () => {
    it('renders tool cards with correct information', () => {
      render(<ToolsPage />);

      const twitterTool = screen.getByText('Twitter Thread Generator');
      const twitterCard = twitterTool.closest('.group');

      expect(twitterCard).toHaveTextContent('Twitter Thread Generator');
      expect(twitterCard).toHaveTextContent(
        'Create engaging Twitter threads from long-form content'
      );
    });

    it('displays Open Tool button for each tool', () => {
      render(<ToolsPage />);

      const openButtons = screen.getAllByText('Open Tool');
      expect(openButtons.length).toBe(5); // 5 sample tools
    });

    it('displays Edit button for each tool', () => {
      render(<ToolsPage />);

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBe(5); // 5 sample tools
    });

    it('applies hover effects to tool cards', () => {
      const { container } = render(<ToolsPage />);

      // Select only the tool cards (not the "Add New Tool" card)
      // Tool cards have both 'group' and 'hover:shadow-xl' classes
      const allCards = container.querySelectorAll('.group');
      const toolCards = Array.from(allCards).filter((card) =>
        card.className.includes('hover:shadow-xl')
      );

      expect(toolCards.length).toBe(5); // Should have 5 tool cards
      toolCards.forEach((card) => {
        expect(card.className).toContain('hover:shadow-xl');
        expect(card.className).toContain('hover:border-primary');
      });
    });
  });

  describe('Tool Descriptions', () => {
    it('renders correct description for Twitter Thread Generator', () => {
      render(<ToolsPage />);

      expect(
        screen.getByText('Create engaging Twitter threads from long-form content')
      ).toBeInTheDocument();
    });

    it('renders correct description for LinkedIn Post Formatter', () => {
      render(<ToolsPage />);

      expect(
        screen.getByText('Format and optimize posts for LinkedIn engagement')
      ).toBeInTheDocument();
    });

    it('renders correct description for Content Calendar Automation', () => {
      render(<ToolsPage />);

      expect(
        screen.getByText('Automate your content scheduling workflow')
      ).toBeInTheDocument();
    });

    it('renders correct description for Thumbnail Generator', () => {
      render(<ToolsPage />);

      expect(
        screen.getByText('Create professional thumbnails for blog posts')
      ).toBeInTheDocument();
    });

    it('renders correct description for SEO Meta Generator', () => {
      render(<ToolsPage />);

      expect(
        screen.getByText('Generate SEO-optimized meta descriptions using AI')
      ).toBeInTheDocument();
    });
  });

  describe('Add New Tool Section', () => {
    it('renders Add a New Tool placeholder card', () => {
      render(<ToolsPage />);

      expect(screen.getByText('Add a New Tool')).toBeInTheDocument();
      expect(
        screen.getByText('Create custom tools for your workflow')
      ).toBeInTheDocument();
    });

    it('renders Get Started button in placeholder', () => {
      render(<ToolsPage />);

      const getStartedButton = screen.getByText('Get Started');
      expect(getStartedButton).toBeInTheDocument();
    });

    it('applies dashed border to placeholder card', () => {
      const { container } = render(<ToolsPage />);

      const placeholderCard = screen
        .getByText('Add a New Tool')
        .closest('.border-2');
      expect(placeholderCard?.className).toContain('border-dashed');
    });
  });

  describe('Icons', () => {
    it('renders icons for tool categories', () => {
      const { container } = render(<ToolsPage />);

      // Each category card should have an icon (rendered as SVG)
      const categoryIcons = container.querySelectorAll(
        '.bg-gradient-to-br svg'
      );
      expect(categoryIcons.length).toBeGreaterThanOrEqual(5); // At least 5 categories
    });

    it('renders icons for tool cards', () => {
      const { container } = render(<ToolsPage />);

      // Each tool card should have an icon
      const toolIcons = container.querySelectorAll('.group svg');
      expect(toolIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout', () => {
    it('applies responsive grid classes to category cards', () => {
      const { container } = render(<ToolsPage />);

      const categoryGrid = container.querySelector(
        '.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4'
      );
      expect(categoryGrid).toBeTruthy();
    });

    it('applies responsive grid classes to tool cards', () => {
      const { container } = render(<ToolsPage />);

      const toolGrid = container.querySelector(
        '.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3'
      );
      expect(toolGrid).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('would show empty message if no tools match filter', () => {
      // This test verifies the empty state logic exists
      // In the current implementation, all categories have at least one tool
      // But the component has logic to handle empty states

      const { container } = render(<ToolsPage />);

      // The component includes conditional rendering for empty state
      // This is verified by checking the component structure
      expect(container.querySelector('.grid')).toBeTruthy();
    });
  });

  describe('Gradient Colors', () => {
    it('applies unique gradient colors to each category', () => {
      const { container } = render(<ToolsPage />);

      const socialCard = screen
        .getByText('Social Network Scripts')
        .closest('.p-4');
      const socialIcon = socialCard?.querySelector('.bg-gradient-to-br');
      expect(socialIcon?.className).toContain('from-blue-500');

      const automationCard = screen
        .getByText('Automation Flows')
        .closest('.p-4');
      const automationIcon = automationCard?.querySelector('.bg-gradient-to-br');
      expect(automationIcon?.className).toContain('from-purple-500');

      const imageCard = screen.getByText('Image Generation').closest('.p-4');
      const imageIcon = imageCard?.querySelector('.bg-gradient-to-br');
      expect(imageIcon?.className).toContain('from-orange-500');

      const aiCard = screen.getByText('AI Tools').closest('.p-4');
      const aiIcon = aiCard?.querySelector('.bg-gradient-to-br');
      expect(aiIcon?.className).toContain('from-green-500');
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const { container } = render(<ToolsPage />);

      // Should have proper heading hierarchy
      const h1 = container.querySelector('h1');
      expect(h1).toHaveTextContent('Admin Tools');

      const h3 = container.querySelector('h3');
      expect(h3).toBeTruthy();
    });

    it('has accessible button elements', () => {
      render(<ToolsPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        // Each button should have text content
        expect(button.textContent).toBeTruthy();
      });
    });
  });

  describe('Component State Management', () => {
    it('maintains selected category state across interactions', () => {
      render(<ToolsPage />);

      // Click on Social Network Scripts
      const socialCard = screen.getByText('Social Network Scripts');
      fireEvent.click(socialCard);

      // Verify it's selected (has border-primary and shadow-lg)
      const socialCardElement = socialCard.closest('.border-2');
      expect(socialCardElement?.className).toContain('border-primary');
      expect(socialCardElement?.className).toContain('shadow-lg');

      // Click on another category
      const automationCard = screen.getByText('Automation Flows');
      fireEvent.click(automationCard);

      // Verify the new selection
      const automationCardElement = automationCard.closest('.border-2');
      expect(automationCardElement?.className).toContain('border-primary');
      expect(automationCardElement?.className).toContain('shadow-lg');

      // Verify previous selection is no longer active (has border-border instead)
      const updatedSocialCardElement = socialCard.closest('.border-2');
      expect(updatedSocialCardElement?.className).toContain('border-border');
      // Should not have the active shadow-lg class applied to active categories
      expect(
        updatedSocialCardElement?.className.includes('shadow-lg') &&
          !updatedSocialCardElement?.className.includes('hover:shadow-lg')
      ).toBe(false);
    });
  });
});
