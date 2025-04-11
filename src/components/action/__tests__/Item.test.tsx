import { render, fireEvent, waitFor } from '@testing-library/react';
import Group from './Group.test.tsx';

describe('Group component', () => {
  beforeEach(() => {
    // Mocks and setup
    jest.mock('@mui/material/styles', () => ({
      createTheme: jest.fn(),
    }));
  });

  afterEach(() => {
    // Cleanup and restore mocks
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Group />);

    expect(container).toBeInTheDocument();
  });

  it('renders desktop columns correctly', async () => {
    const { container } = render(<Group desktopColumns={2} />);

    expect(container).toHaveStyle('gridTemplateColumns: repeat(2, 1fr)');
  });

  it('renders row layout correctly', async () => {
    const { container } = render(<Group rowLayout />);
    expect(container).toHaveStyle(`display: flex`);

    const gridElement = container.querySelector('div');
    expect(gridElement).toHaveAttribute('data-grid-columns', '2');

    expect(gridElement).toHaveClass('MuiGrid-item');
  });

  it('renders smaller icon distance correctly', async () => {
    const { container } = render(<Group smallerIconDistance />);

    expect(container).toHaveStyle(`pr: 3`);

    const iconBox = container.querySelector('span.icon');
    expect(iconBox).toHaveStyle(`lineHeight: 0`);

    const smallIconDistance = container.querySelector('.MuiGrid-item:last-child > span.icon');
    expect(smallIconDistance).toHaveClass('MuiIcon-variant--smaller');
  });

  it('renders icon correctly', async () => {
    const { container } = render(<Group icon={<i className="fa fa-star" />} />);
    expect(container).toHaveStyle(`mr: 2`);

    const iconBox = container.querySelector('span.icon');
    expect(iconBox).toHaveClass('fa fa-star');

    const textElement = container.querySelector('.MuiGrid-item:last-child > span');
    expect(textElement).not.toHaveClass('fa fa-star');
  });

  it('renders title correctly', async () => {
    const { container } = render(<Group icon={<i className="fa fa-star" />} title="Title" />);
    expect(container).toHaveStyle(`display: block`);

    const textElement = container.querySelector('.MuiGrid-item:last-child > span.title');
    expect(textElement).toHaveTextContent('Title');

    const descriptionElement = container.querySelector('.MuiGrid-item:last-child > span.description');
    expect(descriptionElement).not.toBeEmptyDOMElement();
  });

  it('renders description correctly', async () => {
    const { container } = render(<Group icon={<i className="fa fa-star" />} title="Title" description="Description" />);
    expect(container).toHaveStyle(`mt: 0.5`);

    const textElement = container.querySelector('.MuiGrid-item:last-child > span.description');
    expect(textElement).toHaveTextContent('Description');

    const titleElement = container.querySelector('.MuiGrid-item:last-child > span.title');
    expect(titleElement).not.toHaveAttribute('aria-label', 'Description');
  });

  it('calls theme function when theme changes', async () => {
    jest.mock('@mui/material/styles', () => ({
      createTheme: jest.fn((theme) => ({ theme })),
    }));

    const { container } = render(<Group />);

    // Wait for theme to be updated
    await waitFor(() => expect(jest mockFuncs.createTheme).toHaveBeenCalledTimes(1));
  });
});