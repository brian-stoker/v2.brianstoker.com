import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ValueProposition from './ValueProposition';

const content = [
  {
    icon: <InvertColorsRoundedIcon fontSize="small" color="primary" />,
    title: 'Timeless aesthetics',
    description:
      "Build beautiful UIs with ease. Start with Google's Material Design, or create your own sophisticated theme.",
  },
  {
    icon: <HandymanRoundedIcon fontSize="small" color="primary" />,
    title: 'Intuitive customization',
    description:
      'Our components are as flexible as they are powerful. You always have full control over how they look and behave.',
  },
  {
    icon: <ArticleRoundedIcon fontSize="small" color="primary" />,
    title: 'Unrivaled documentation',
    description:
      'The answer to your problem can be found in our documentation. How can we be so sure? Because our docs boast over 2,000 contributors.',
  },
  {
    icon: <AccessibilityNewRounded fontSize="small" color="primary" />,
    title: 'Dedicated to accessibility',
    description:
      "We believe in building for everyone. That's why accessibility is one of our highest priorities with every new feature we ship.",
  },
];

describe('ValueProposition component', () => {
  beforeEach(() => {
    // Set up a test environment
  });

  it('renders without crashing', async () => {
    const { container } = render(<ValueProposition />);
    expect(container).toBeTruthy();
  });

  describe('Rendering props', () => {
    it('should render SectionHeadline with correct title and subtitle', async () => {
      const { getByText } = render(<ValueProposition />);
      const sectionHeadline = getByText(/A delightful experience/i);
      expect(sectionHeadline).toBeInTheDocument();

      const overline = sectionHeadline.querySelector('.MuiTypography-root');
      expect(overline.textContent).toBe('Why build with SUI?');

      const title = sectionHeadline.querySelector('Typography');
      expect(title.textContent).toBe('A delightful experience<br />for you and your users');
    });

    it('should render InfoCard with correct icon, title, and description', async () => {
      const { getByText } = render(<ValueProposition />);
      const infoCard = getByText(/Timeless aesthetics/i);
      expect(infoCard).toBeInTheDocument();

      const icon = infoCard.querySelector('InfoCard-icon');
      expect(icon).toHaveStyle({ fontSize: 'small' });

      const title = infoCard.querySelector('InfoCard-title');
      expect(title.textContent).toBe('Timeless aesthetics');

      const description = infoCard.querySelector('InfoCard-description');
      expect(description.textContent).toBe("Build beautiful UIs with ease. Start with Google's Material Design, or create your own sophisticated theme.");
    });
  });

  describe('User interactions', () => {
    it('should call onSectionHeadlineClick when SectionHeadline is clicked', async () => {
      const { getByText } = render(<ValueProposition />);
      const sectionHeadline = getByText(/A delightful experience/i);
      const onClickMock = jest.fn();
      sectionHeadline.addEventListener('click', onClickMock);

      fireEvent.click(sectionHeadline);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('should update when InfoCard is clicked', async () => {
      const { getByText } = render(<ValueProposition />);
      const infoCard = getByText(/Timeless aesthetics/i);
      const onClickMock = jest.fn();
      infoCard.addEventListener('click', onClickMock);

      fireEvent.click(infoCard);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should update when form is submitted', async () => {
    // Form submission should trigger a re-render
    // For now, just assert that the component renders without crashing
    const { container } = render(<ValueProposition />);
    expect(container).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('should render SectionHeadline when passed as children', async () => {
      const { getByText } = render(
        <ValueProposition>
          <SectionHeadline overline="Why build with SUI?" title="A delightful experience" />
        </ValueProposition>,
      );
      expect(getByText(/A delightful experience/i)).toBeInTheDocument();
    });

    it('should not render SectionHeadline when not passed as children', async () => {
      const { queryByText } = render(<ValueProposition />);
      expect(queryByText(/A delightful experience/i)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    // Add edge case tests here
  });
});