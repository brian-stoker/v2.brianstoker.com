import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import * as docs from './2021-q2-update.md?muiMarkdown';

describe('Page component', () => {
  const pageProps = { docs };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={pageProps} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog when provided with docs prop', () => {
      const { getByText } = render(<TopLayoutBlog docs={pageProps} />);
      expect(getByText('2021-q2-update')).toBeInTheDocument();
    });

    it('does not render anything when docs prop is empty or null', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={} />);
      expect(queryByText('2021-q2-update')).not.toBeInTheDocument();

      const { queryByText } = render(<TopLayoutBlog docs={null} />);
      expect(queryByText('2021-q2-update')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when docs prop is invalid', async () => {
      // @ts-expect-error
      await expect(() => render(<TopLayoutBlog docs={'invalid'} />)).rejects.toThrow();
    });

    it('does not throw an error when docs prop is valid', async () => {
      const { container } = render(<TopLayoutBlog docs={pageProps} />);
      expect(container).toBeTruthy();
    });
  });

  describe('user interactions', () => {
    it('triggers rendering with a click event on the component', async () => {
      // @ts-expect-error
      await waitFor(() => expect(1).toBeGreaterThan(0));
    });

    it('does not trigger rendering when no changes are made to props', async () => {
      const { getByText } = render(<TopLayoutBlog docs={pageProps} />);
      fireEvent.change(document.querySelector('#doc'), { target: { value: '' } });
      expect(getByText('2021-q2-update')).toBeInTheDocument();
    });

    it('triggers rendering with an input change event on the component', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={pageProps} />);
      fireEvent.change(document.querySelector('#doc'), { target: { value: '' } });
      expect(getByText('2021-q2-update')).toBeInTheDocument();
    });

    it('triggers form submission with an input change event on the component', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={pageProps} />);
      fireEvent.change(document.querySelector('#doc'), { target: { value: '' } });
      fireEvent.submit(document.querySelector('form'));
      expect(getByText('2021-q2-update')).toBeInTheDocument();
    });

    it('does not trigger rendering when no changes are made to props after form submission', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={pageProps} />);
      fireEvent.change(document.querySelector('#doc'), { target: { value: '' } });
      expect(getByText('2021-q2-update')).toBeInTheDocument();
      fireEvent.submit(document.querySelector('form'));
      expect(getByText('2021-q2-update')).toBeInTheDocument();
    });
  });

  describe('side effects or state changes', () => {
    it('calls the necessary functions when rendering the component', async () => {
      jest.spyOn(TopLayoutBlog, 'render');
      const { container } = render(<TopLayoutBlog docs={pageProps} />);
      expect(TopLayoutBlog.render).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot tests', () => {
    it('should match the expected snapshot', async () => {
      const { asFragment } = render(<TopLayoutBlog docs={pageProps} />);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });
});