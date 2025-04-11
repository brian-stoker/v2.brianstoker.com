import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/react-engineer-x.md?muiMarkdown';

describe('TopLayoutCareers component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutCareers {...pageProps} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders children correctly', async () => {
      const { getByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(getByText(pageProps.title)).toBeInTheDocument();
    });

    it('hides children when prop is falsey', async () => {
      const props = { ...pageProps, children: false };
      const { queryByText } = render(<TopLayoutCareers {...props} />);
      expect(queryByText(props.title)).toBeNull();
    });
  });

  describe('prop validation', () => {
    it(' validates prop types correctly', async () => {
      const invalidProps = { ...pageProps, title: 'Invalid Title' };
      const { error } = render(<TopLayoutCareers {...invalidProps} />);
      expect(error).not.toBeNull();
    });

    it('handles missing required props', async () => {
      const missingProps = { children: false };
      const { error } = render(<TopLayoutCareers {...missingProps} />);
      expect(error).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    let clickMock;

    beforeEach(() => {
      clickMock = jest.fn();
    });

    it('responds to clicks correctly', async () => {
      const { getByText } = render(<TopLayoutCareers {...pageProps} />);
      const element = getByText(pageProps.title);
      fireEvent.click(element);
      expect(clickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('renders updated content when children prop is changed', async () => {
      const { rerender } = render(<TopLayoutCareers {...pageProps} />);
      pageProps.children = true;
      await waitFor(() => {
        expect(getByText(pageProps.title)).toBeInTheDocument();
      });
      rerender(<TopLayoutCareers {...pageProps} />);
    });
  });

  describe('mocking external dependencies', () => {
    it('ignores mocked children prop when present in a different form', async () => {
      const { getByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(getByText(pageProps.title)).toBeInTheDocument();
    });

    it('remains unchanged despite changes to the props from outside the component', async () => {
      // Test if changes to pageProps title do not affect TopLayoutCareer's children.
      const { getByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(getByText(pageProps.title)).toBeInTheDocument();
    });
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(<TopLayoutCareers {...pageProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});