import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './material-ui-v1-is-out.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<TopLayoutBlog docs={docs} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    expect(page.container).not.toBeNull();
  });

  it('renders TopLayoutBlog with docs prop', async () => {
    const { getByText } = page;
    await waitFor(() => expect(getByText('Material-UI v1 is out')).toBeInTheDocument());
    expect(getByText('Material-UI v1 is out')).toHaveClass('docs');
  });

  describe('props validation', () => {
    it('requires docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog />);
      await waitFor(() => expect(getByText('Material-UI v1 is out')).toBeInTheDocument());
      expect(page).toHaveErrorMatching(/docs\s*:\s*[^\w\s]+/);
    });

    it('displays error message when docs prop is invalid', async () => {
      const { getByText } = render(<TopLayoutBlog docs="invalid" />);
      await waitFor(() => expect(getByText('Material-UI v1 is out')).toBeInTheDocument());
      expect(page).toHaveErrorMatching(/docs\s*:\s*[^\w\s]+/);
    });

    it('renders with valid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(getByText('Material-UI v1 is out')).toBeInTheDocument());
      expect(page).not.toHaveErrorMatching(/docs\s*:\s*[^\w\s]+/);
    });
  });

  describe('user interactions', () => {
    it('renders correctly when clicked', async () => {
      const { getByText } = page;
      await waitFor(() => expect(getByText('Material-UI v1 is out')).toBeInTheDocument());
      fireEvent.click(page.getByRole('button'));
      await waitFor(() => expect(getByText('Updated')).toBeInTheDocument());
    });

    it('renders correctly when input changes', async () => {
      const { getByText } = page;
      const inputField = page.getByPlaceholderText('Search...');
      fireEvent.change(inputField, { target: { value: 'new search query' } });
      await waitFor(() => expect(getByText('Updated')).toBeInTheDocument());
    });

    it('submits form correctly', async () => {
      const { getByRole, getByPlaceholderText } = page;
      const submitButton = page.getByRole('button', { name: /submit/i });
      fireEvent.change(getByPlaceholderText('Search...'), { target: { value: 'search query' } });
      fireEvent.click(submitButton);
      await waitFor(() => expect(getByText('Updated')).toBeInTheDocument());
    });
  });

  describe('side effects or state changes', () => {
    it('updates docs when clicked', async () => {
      const { getByText } = page;
      await waitFor(() => expect(getByText('Material-UI v1 is out')).toBeInTheDocument());
      fireEvent.click(page.getByRole('button'));
      await waitFor(() => expect(getByText('Updated')).toBeInTheDocument());
      expect(page).toHaveStateMatching(/docs\s*:\s*[^\w\s]+/);
    });
  });

  it('renders correctly with props', () => {
    const { getByText } = render(<TopLayoutBlog docs={docs} />);
    await waitFor(() => expect(getByText('Material-UI v1 is out')).toBeInTheDocument());
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<TopLayoutBlog docs={docs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});