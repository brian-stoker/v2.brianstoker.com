import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-phuket-retreat.md?muiMarkdown';

describe('TopLayoutBlog component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeInTheDocument();
  });

  it('renders title and content', async () => {
    const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} />);
    expect(getByText(/phuket-retreat/)).toBeInTheDocument();
    expect(getByRole('heading')).toBeInTheDocument();
    expect(getByRole('paragraph')).toBeInTheDocument();
  });

  it('handles empty props', async () => {
    const { container } = render(<TopLayoutBlog />);
    expect(container).not.toHaveClass('empty');
  });

  it('renders empty state when docs prop is not provided', async () => {
    const { getByText, getByRole } = render(<TopLayoutBlog />);
    expect(getByText(/no content/)).toBeInTheDocument();
    expect(getByRole('heading')).toBeInTheDocument();
    expect(getByRole('paragraph')).toBeInTheDocument();
  });

  it('handles invalid props (docs is not an object)', async () => {
    const { container } = render(<TopLayoutBlog docs={null} />);
    expect(container).not.toHaveClass('empty');
  });

  it('renders with valid props', async () => {
    const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} />);
    expect(getByText(/phuket-retreat/)).toBeInTheDocument();
    expect(getByRole('heading')).toBeInTheDocument();
    expect(getByRole('paragraph')).toBeInTheDocument();
  });

  it('does not throw an error when rendering', async () => {
    const mockDocs = { /* some valid docs data */ };
    const component = render(<TopLayoutBlog docs={mockDocs} />);
    expect(component).toBeTruthy();
  });

  it('renders with props', async () => {
    const { getByText, getByRole } = render(
      <TopLayoutBlog docs={docs} title="Phuket Retreat" />
    );
    expect(getByText(/phuket-retreat/)).toBeInTheDocument();
    expect(getByRole('heading')).toHaveTextContent('Phuket Retreat');
  });

  it('renders with props (with link)', async () => {
    const { getByText, getByRole } = render(
      <TopLayoutBlog docs={docs} title="Phuket Retreat" link="https://example.com" />
    );
    expect(getByText(/phuket-retreat/)).toBeInTheDocument();
    expect(getByRole('heading')).toHaveTextContent('Phuket Retreat');
  });

  it('renders without crashing when clicking on the heading', async () => {
    const { getByRole } = render(<TopLayoutBlog docs={docs} />);
    const heading = getByRole('heading');
    fireEvent.click(heading);
    expect(heading).not.toHaveClass('active');
  });

  it('renders with props when changing input value', async () => {
    const { getByTestId, getByText } = render(
      <TopLayoutBlog docs={docs} title="Phuket Retreat" />
    );
    const input = getByTestId('input');
    fireEvent.change(input, { target: { value: 'new-value' } });
    expect(getByText(/phuket-retreat/)).toBeInTheDocument();
  });

  it('submits the form correctly', async () => {
    const { getByRole, getByText } = render(
      <TopLayoutBlog docs={docs} title="Phuket Retreat" />
    );
    const submitButton = getByRole('button');
    fireEvent.click(submitButton);
    expect(getByText('/action-accepted')).toBeInTheDocument();
  });

  it('renders with error message when form is invalid', async () => {
    const { getByText } = render(
      <TopLayoutBlog docs={docs} title="Phuket Retreat" invalid={true} />
    );
    expect(getByText(/error message/)).toBeInTheDocument();
  });
});