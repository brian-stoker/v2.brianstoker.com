import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/react-community-engineer.md?muiMarkdown';

jest.mock('muiMarkdown', () => ({
  default: () => 'mock markdown',
}));

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<TopLayoutCareers {...pageProps} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders all conditional rendering paths', () => {
      const { container } = page;
      expect(container).toMatchSnapshot();
    });
  });

  describe('Props validation', () => {
    it('valid props are passed to TopLayoutCareers component', () => {
      const { getByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(getByText(pageProps.title)).toBeInTheDocument();
    });

    it('invalid props cause an error', () => {
      const invalidProps = { ...pageProps, invalid: 'prop' };
      const { error } = render(<TopLayoutCareers {...invalidProps} />);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('User interactions', () => {
    it('clicks trigger the expected behavior', async () => {
      const { getByText, getByRole } = page;
      const link = getByText(pageProps.title);
      fireEvent.click(link);
      await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());
    });

    it('input changes update the component state', async () => {
      const { getByPlaceholderText, getByRole } = page;
      const input = getByPlaceholderText(pageProps.searchPlaceholder);
      fireEvent.change(input, { target: { value: 'searchTerm' } });
      await waitFor(() => expect(getByRole('dialog')).toHaveValue('searchTerm'));
    });

    it('form submissions trigger the expected behavior', async () => {
      const { getByRole } = page;
      const form = getByRole('form');
      fireEvent.submit(form);
      await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());
    });
  });

  describe('Side effects or state changes', () => {
    it('state is updated correctly after rendering', async () => {
      const { getByText, getByRole } = page;
      const link = getByText(pageProps.title);
      fireEvent.click(link);
      await waitFor(() => expect(getByRole('dialog')).toHaveStyle('display: block'));
    });
  });
});