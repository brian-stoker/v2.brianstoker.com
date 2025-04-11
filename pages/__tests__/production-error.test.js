import { render, fireEvent, screen } from '@testing-library/react';
import MarkdownDocs from '../components/MarkdownDocs';
import pageProps from '../pages/production-error/index.md?muiMarkdown';
import { act } from 'react-dom/test-utils';

describe('Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<MarkdownDocs {...pageProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders Markdown content correctly', async () => {
      const markdownContent = 'This is a test markdown content';
      const { getByText } = render(<MarkdownDocs {...pageProps} />);
      expect(getByText(markdownContent)).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('validate page props are passed correctly', async () => {
      expect(pageProps).toHaveProperty('title', 'Production Error');
      expect(pageProps).toHaveProperty('disableAd', true);
    });

    it('throws an error when invalid prop is provided', async () => {
      const invalidProp = { invalid: 'test' };
      await act(() => {
        render(<MarkdownDocs {...pageProps, ...invalidProp} />);
      });
      expect.assertions(1);
      expect(() => render(<MarkdownDocs {...pageProps, ...invalidProp} />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('clicks on a button triggers a click event', async () => {
      const { getByText } = render(<MarkdownDocs {...pageProps} />);
      const buttonText = 'Click me';
      const button = getByText(buttonText);
      fireEvent.click(button);
      expect(screen.getByRole('button')).toHaveBeenClicked();
    });

    it('inputs changes are handled correctly', async () => {
      const { getByPlaceholderText } = render(<MarkdownDocs {...pageProps} />);
      const inputField = getByPlaceholderText('Enter something');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(inputField).toHaveValue('test');
    });

    it('form is submitted correctly', async () => {
      const { getByText } = render(<MarkdownDocs {...pageProps} />);
      const submitButton = getByText('Submit form');
      fireEvent.click(submitButton);
      await act(async () => {
        expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument();
      });
    });
  });

  describe('Side Effects', () => {
    it('renders loading state when data is being fetched', async () => {
      const { getByText } = render(<MarkdownDocs {...pageProps} />);
      await act(async () => {
        expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument();
      });
    });
  });

  describe('Snapshot Test', () => {
    it('renders correctly', async () => {
      const { container } = render(<MarkdownDocs {...pageProps} />);
      await act(async () => {
        expect(container).toMatchSnapshot();
      });
    });
  });
});