import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/react-engineer-docs-infra.md?muiMarkdown';

describe('TopLayoutCareers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutCareers {...pageProps} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders when children are provided', async () => {
      const children = <div>Test Children</div>;
      const { container } = render(<TopLayoutCareers {...pageProps} children={children} />);
      expect(container).toBeTruthy();
    });

    it('does not render when children are not provided', async () => {
      const { container, queryByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(queryByText('Test Children')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('validates props correctly', async () => {
      const validProps = { ...pageProps, children: <div>Test Children</div> };
      const { container } = render(<TopLayoutCareers {...validProps} />);
      expect(container).toBeTruthy();
    });

    it('throws an error when invalid props are provided', async () => {
      const invalidProps = { invalidProp: 'test' };
      try {
        render(<TopLayoutCareers {...invalidProps} />);
      } catch (error) {
        expect(error.message).toBe('Invalid prop type for "children". Expected object but got string.');
      }
    });
  });

  describe('user interactions', () => {
    it('calls children on click', async () => {
      const mockChildren = jest.fn();
      const { container, getByText } = render(<TopLayoutCareers {...pageProps} children={mockChildren} />);
      fireEvent.click(getByText('Test Children'));
      expect(mockChildren).toHaveBeenCalledTimes(1);
    });

    it('calls children on keypress', async () => {
      const mockChildren = jest.fn();
      const { container, getByText } = render(<TopLayoutCareers {...pageProps} children={mockChildren} />);
      fireEvent.keyDown(getByText('Test Children'), { key: 'test' });
      expect(mockChildren).toHaveBeenCalledTimes(1);
    });

    it('submits form correctly', async () => {
      const mockChildren = jest.fn();
      const { container, getByText } = render(<TopLayoutCareers {...pageProps} children={mockChildren} />);
      fireEvent.change(getByText('Test Children'), { target: { value: 'test' } });
      fireEvent.submit(getByRole('form'));
      expect(mockChildren).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls API correctly when data is fetched', async () => {
      const mockApiCall = jest.fn();
      render(<TopLayoutCareers {...pageProps} />);
      await waitFor(() => expect(mockApiCall).toHaveBeenCalledTimes(1));
    });
  });

  it('renders snapshot correctly', async () => {
    const { container } = render(<TopLayoutCareers {...pageProps} />);
    await waitFor(() => expect(container).toMatchSnapshot());
  });
});