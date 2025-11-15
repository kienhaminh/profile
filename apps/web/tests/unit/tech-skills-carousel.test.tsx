import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TechSkillsCarousel } from '@/components/TechSkillsCarousel';

describe('TechSkillsCarousel', () => {
  const mockSkills = ['JavaScript', 'Python', 'ReactJS'];

  it('renders tech logos for provided skills', () => {
    const { container } = render(<TechSkillsCarousel skills={mockSkills} />);

    // Should render logos using react-slick
    const logos = container.querySelectorAll('img');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders slick slider component', () => {
    const { container } = render(<TechSkillsCarousel skills={mockSkills} />);

    // Check that slick slider is rendered
    const slickSlider = container.querySelector('.slick-slider');
    expect(slickSlider).toBeTruthy();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <TechSkillsCarousel skills={mockSkills} className="custom-class" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('applies tech-skills-slider class', () => {
    const { container } = render(<TechSkillsCarousel skills={mockSkills} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('tech-skills-slider');
  });

  it('renders gradient overlays for fade effect', () => {
    const { container } = render(<TechSkillsCarousel skills={mockSkills} />);

    const gradients = container.querySelectorAll(
      '.bg-gradient-to-r, .bg-gradient-to-l'
    );
    expect(gradients.length).toBe(2); // Left and right gradients
  });

  it('handles empty skills array', () => {
    const { container } = render(<TechSkillsCarousel skills={[]} />);

    expect(container.firstChild).toBeTruthy();
    const slickSlider = container.querySelector('.slick-slider');
    expect(slickSlider).toBeTruthy();
  });

  it('shows skill name on hover (tooltip)', () => {
    const { container } = render(<TechSkillsCarousel skills={mockSkills} />);

    // Check for tooltip elements
    const tooltips = container.querySelectorAll('[class*="top-full"]');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('renders all skills passed as props', () => {
    render(<TechSkillsCarousel skills={mockSkills} />);

    // Check that all skill names appear in the document
    mockSkills.forEach((skill) => {
      const skillElements = screen.getAllByText(skill);
      expect(skillElements.length).toBeGreaterThan(0);
    });
  });
});
