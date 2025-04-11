import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { InfoCard } from './InfoCard';
import '@stoked-ui/core/styles.css'; // Import global styles
import '@stoked-ui/docs/InfoCard/index.css'; // Import component-specific styles
import '@stoked-ui/docs/styles/index.css'; // Import theme styles

const mockProps = {
  label: 'Test Label',
  description: 'Test Description',
};

describe('InfoCard', () => {
  beforeEach(() => {
    jest.clearMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<InfoCard {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  it('renders label and description correctly', async () => {
    const { getByText, getByRole } = render(<InfoCard {...mockProps} />);
    expect(getByText(mockProps.label)).toBeInTheDocument();
    expect(getByRole('description')).toBeInTheDocument();
  });

  it('renders error message when invalid props are provided', async () => {
    const invalidProps = mockProps;
    delete invalidProps.label;
    delete invalidProps.description;

    const { getByText } = render(<InfoCard {...invalidProps} />);
    expect(getByText('Error: Invalid prop')).toBeInTheDocument();
  });

  it('handles user interaction (clicking label)', async () => {
    const { getByRole, getByText } = render(<InfoCard {...mockProps} />);
    const labelElement = getByText(mockProps.label);
    fireEvent.click(labelElement);

    expect(getByText('Test Label')).toHaveClass('active');
  });

  it('handles user interaction (changing input value)', async () => {
    const { getByRole, getByText } = render(<InfoCard {...mockProps} />);
    const descriptionInput = getByRole('textbox');

    fireEvent.change(descriptionInput, { target: 'New Description' });

    expect(getByText('New Description')).toBeInTheDocument();
  });

  it('renders conditional content', async () => {
    const conditionalContent = <div>Conditional Content</div>;
    const { container } = render(<InfoCard {...mockProps} conditionalContent={conditionalContent} />);
    expect(container).toContainHTML(conditionalContent);
  });

  it('handles side effect (fetching data)', async () => {
    const mockFetchData = jest.fn();
    const { container, getByRole } = render(<InfoCard {...mockProps} fetchData={mockFetchData} />);
    fireEvent.click(getByRole('button'));

    expect(mockFetchData).toHaveBeenCalledTimes(1);
  });

  it('renders as snapshot', async () => {
    const mockProps = {
      label: 'Test Label',
      description: 'Test Description',
      conditionalContent: <div>Conditional Content</div>,
    };

    const { asFragment } = render(<InfoCard {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});