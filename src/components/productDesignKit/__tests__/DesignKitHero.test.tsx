import React from '@testing-library/react';
import { render, fireEvent, waitFor } from '@testing-library/react-hooks';
import TemplateHero from './DesignKitHero.test.tsx';

describe('Template Hero', () => {
  const linearGradient = true;
  const leftContent = 'Left content';
  const rightContent = 'Right content';
  const primaryLabel = 'Buy now';
  const primaryUrl = 'https://stoked-ui.github.io/store/?utm_source=marketing&utm_medium=referral&utm_campaign=design-cta#design';
  const secondaryLabel = 'Figma Preview';
  const secondaryUrl = 'https://www.figma.com/community/file/912837788133317724/material-ui-for-figma-and-mui-x';

  beforeEach(() => {
    render(<TemplateHero linearGradient={linearGradient} leftContent={leftContent} rightContent={rightContent} />);
  });

  it('renders without crashing', () => {
    expect(render(<TemplateHero />)).not.toThrow();
  });

  describe('Conditional rendering', () => {
    it('renders left content when linearGradient is true', () => {
      const { getByText } = render(<TemplateHero linearGradient={true} leftContent="Left content" rightContent="Right content" />);
      expect(getByText(leftContent)).toBeInTheDocument();
    });

    it('renders right content when linearGradient is false', () => {
      const { getByText } = render(<TemplateHero linearGradient={false} leftContent="Left content" rightContent="Right content" />);
      expect(getByText(rightContent)).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('throws error when left or right content is empty string', () => {
      expect(() => render(<TemplateHero linearGradient={true} leftContent="" rightContent="Right content" />)).toThrowError(
        'leftContent is required'
      );
    });
  });

  describe('User interactions', () => {
    it('calls primaryUrl when click on primary label', async () => {
      const { getByText, getByRole } = render(<TemplateHero linearGradient={true} leftContent="Left content" rightContent="Right content" />);
      const primaryLabelElement = getByRole('button');
      fireEvent.click(primaryLabelElement);
      expect(window.open).toHaveBeenCalledWith(primaryUrl);
    });

    it('calls secondaryUrl when click on secondary label', async () => {
      const { getByText, getByRole } = render(<TemplateHero linearGradient={true} leftContent="Left content" rightContent="Right content" />);
      const secondaryLabelElement = getByRole('button');
      fireEvent.click(secondaryLabelElement);
      expect(window.open).toHaveBeenCalledWith(secondaryUrl);
    });
  });

  describe('Get Started Buttons', () => {
    it('renders buttons with correct labels and urls', async () => {
      const { getByText } = render(<TemplateHero linearGradient={true} leftContent="Left content" rightContent="Right content" />);
      expect(getByText(primaryLabel)).toBeInTheDocument();
      expect(getByText(secondaryLabel)).toBeInTheDocument();
      expect(window.open).toHaveBeenCalledWith(primaryUrl);
      expect(window.open).toHaveBeenCalledWith(secondaryUrl);
    });
  });

  it('renders Design Kit images with correct rotation and position', async () => {
    const { getByRole } = render(<TemplateHero linearGradient={true} leftContent="Left content" rightContent="Right content" />);
    await waitFor(() => expect(getByRole('img')).toHaveStyle('transform: rotateZ(30deg)'));
  });
});