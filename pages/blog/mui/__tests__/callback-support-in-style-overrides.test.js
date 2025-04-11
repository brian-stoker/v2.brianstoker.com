import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './callback-support-in-style-overrides.md?muiMarkdown';

describe('TopLayoutBlog component', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<div></div>';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  describe('props', () => {
    it('accepts docs prop', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(/callback support/)).toBeInTheDocument();
    });

    it('does not accept invalid docs prop (string)', () => {
      expect(() => render(<TopLayoutBlog docs="invalid" />)).toThrowError();
    });

    it('does not accept invalid docs prop (object without docs property)', () => {
      const invalidDocs = { foo: 'bar' };
      expect(() => render(<TopLayoutBlog docs={invalidDocs} />)).toThrowError();
    });
  });

  describe('conditional rendering', () => {
    it('renders correctly when docs is provided', async () => {
      document.body.innerHTML = '<div></div>';
      const { getByText } = render(<Page />);
      expect(getByText(/callback support/)).toBeInTheDocument();
    });

    it('does not render when docs is not provided', async () => {
      const { queryByText } = render(<Page />);
      expect(queryByText(/callback support/)).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('triggers doc link click on page load', async () => {
      const { getByText, getByRole } = render(<Page />);
      await waitFor(() => expect(getByText(/callback support/)).toBeInTheDocument());
      const link = getByRole('link');
      expect(link).toHaveAttribute('href');
      fireEvent.click(link);
    });

    it('triggers doc link click on button click', async () => {
      const { getByText, getByRole } = render(<Page />);
      await waitFor(() => expect(getByText(/callback support/)).toBeInTheDocument());
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByRole('link')).toHaveAttribute('href');
    });
  });

  describe('side effects', () => {
    it('triggers page update on doc link click', async () => {
      document.body.innerHTML = '<div></div>';
      const { getByText, getByRole } = render(<Page />);
      await waitFor(() => expect(getByText(/callback support/)).toBeInTheDocument());
      const link = getByRole('link');
      fireEvent.click(link);
      expect(document.querySelector('body')).not.toHaveClass('updated');
    });

    it('triggers page update on button click', async () => {
      document.body.innerHTML = '<div></div>';
      const { getByText, getByRole } = render(<Page />);
      await waitFor(() => expect(getByText(/callback support/)).toBeInTheDocument());
      const button = getByRole('button');
      fireEvent.click(button);
      expect(document.querySelector('body')).not.toHaveClass('updated');
    });
  });

  describe('snapshots', () => {
    it('renders correctly and has the expected props', async () => {
      document.body.innerHTML = '<div></div>';
      const { asFragment } = render(<Page />);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });
});