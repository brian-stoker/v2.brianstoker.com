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
  it('renders without crashing', () => {
    const { container } = render(<ValueProposition />);
    expect(container).toBeTruthy();
  });

  describe('SectionHeadline prop', () => {
    it('renders with overline and title', () => {
      const { getByText, getByRole } = render(
        <ValueProposition SectionHeadline={{ overline: 'overline text', title: 'title' }} />
      );
      expect(getByText('overline text')).toBeInTheDocument();
      expect(getByRole('heading', { name: 'title' })).toBeInTheDocument();
    });

    it('renders with GradientText prop', () => {
      const { getByText } = render(
        <ValueProposition SectionHeadline={{ overline: 'overline text', title: <Typography variant="h2" sx={{ mt: 1, mb: { xs: 2, sm: 4 } }}>delightful experience</Typography> }} />
      );
      expect(getByText('delightful experience')).toBeInTheDocument();
    });

    it('throws an error with invalid overline prop', () => {
      const { stderr } = render(
        <ValueProposition SectionHeadline={{ overline: null, title: 'title' }} />,
        {
          wrapper: ({ children }) => (
            <div className="error-container">{children}</div>
          ),
        }
      );
      expect(stderr).toContain('overline is required');
    });

    it('throws an error with invalid title prop', () => {
      const { stderr } = render(
        <ValueProposition SectionHeadline={{ overline: 'overline text', title: null }} />,
        {
          wrapper: ({ children }) => (
            <div className="error-container">{children}</div>
          ),
        }
      );
      expect(stderr).toContain('title is required');
    });
  });

  describe('content prop', () => {
    it('renders content with InfoCard components', () => {
      const { getAllByRole } = render(<ValueProposition content={content} />);
      expect(getAllByRole('region')).toHaveLength(content.length);
    });

    it('throws an error with invalid content prop', () => {
      const { stderr } = render(
        <ValueProposition content={{}} />,
        {
          wrapper: ({ children }) => (
            <div className="error-container">{children}</div>
          ),
        }
      );
      expect(stderr).toContain('content is required');
    });
  });

  describe('user interactions', () => {
    it('calls onSectionHeadlineChange prop when overline changes', async () => {
      const onChangeMock = jest.fn();
      render(<ValueProposition SectionHeadline={{ overline: 'overline text', title: 'title' }} onSectionHeadlineChange={onChangeMock} />);
      fireEvent.change(document.querySelector('#overline'), { target: { value: 'new overline text' } });
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onContentChange prop when content changes', async () => {
      const onChangeMock = jest.fn();
      render(<ValueProposition content={content} onContentChange={onChangeMock} />);
      fireEvent.change(document.querySelector('#content'), { target: { value: 'new content' } });
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onSectionHeadlineClick prop when overline is clicked', async () => {
      const onClickMock = jest.fn();
      render(<ValueProposition SectionHeadline={{ overline: 'overline text', title: 'title' }} onSectionHeadlineClick={onClickMock} />);
      fireEvent.click(document.querySelector('#overline'));
      await waitFor(() => expect(onClickMock).toHaveBeenCalledTimes(1));
    });

    it('calls onContentClick prop when content is clicked', async () => {
      const onClickMock = jest.fn();
      render(<ValueProposition content={content} onContentClick={onClickMock} />);
      fireEvent.click(document.querySelector('#content'));
      await waitFor(() => expect(onClickMock).toHaveBeenCalledTimes(1));
    });
  });
});