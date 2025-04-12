import { render, fireEvent, waitFor } from '@testing-library/react';
import StartToday from './StartToday';

describe('StartToday component', () => {
  const setup = (props) => render(<StartToday {...props} />);
  const { getByText, getByRole } = render(setup({}));

  beforeEach(() => {
    // Clean up the DOM
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore the DOM to its original state
    document.body.innerHTML = '';
  });

  it('renders without crashing', () => {
    expect(getByText(/start now/)).toBeInTheDocument();
  });

  describe('SectionHeadline prop: alwaysCenter', () => {
    const mockAlwaysCenter = jest.fn();

    beforeEach(() => {
      setup({ alwaysCenter: mockAlwaysCenter });
    });

    it('calls the alwaysCenter callback when rendered', () => {
      expect(mockAlwaysCenter).toHaveBeenCalledTimes(1);
    });

    it('renders with default props', () => {
      expect(getByRole('heading')).toHaveTextContent(/ship your next project faster/);
    });
  });

  describe('SectionHeadline prop: overline', () => {
    const mockOverline = jest.fn();

    beforeEach(() => {
      setup({ overline: mockOverline });
    });

    it('calls the overline callback when rendered', () => {
      expect(mockOverline).toHaveBeenCalledTimes(1);
    });

    it('renders with default props', () => {
      expect(getByText('start now')).toBeInTheDocument();
    });
  });

  describe('SectionHeadline prop: title', () => {
    const mockTitle = jest.fn();

    beforeEach(() => {
      setup({ title: { variant: 'h2', children: <Typography>Example</Typography> } });
    });

    it('calls the title callback when rendered', () => {
      expect(mockTitle).toHaveBeenCalledTimes(1);
    });

    it('renders with default props', () => {
      expect(getByRole('heading')).toHaveTextContent(/example/);
    });
  });

  describe('SectionHeadline prop: description', () => {
    const mockDescription = jest.fn();

    beforeEach(() => {
      setup({ description: mockDescription });
    });

    it('calls the description callback when rendered', () => {
      expect(mockDescription).toHaveBeenCalledTimes(1);
    });

    it('renders with default props', () => {
      expect(getByText('find out why suis tools are trusted')).toBeInTheDocument();
    });
  });

  describe('GetStartedButtons prop: primaryLabel', () => {
    const mockPrimaryLabel = jest.fn();

    beforeEach(() => {
      setup({ primaryLabel: mockPrimaryLabel });
    });

    it('calls the primaryLabel callback when rendered', () => {
      expect(mockPrimaryLabel).toHaveBeenCalledTimes(1);
    });

    it('renders with default props', () => {
      expect(getByRole('button')).toHaveTextContent(/discover the core libraries/);
    });
  });

  describe('GetStartedButtons prop: primaryUrl', () => {
    const mockPrimaryUrl = jest.fn();

    beforeEach(() => {
      setup({ primaryUrl: mockPrimaryUrl });
    });

    it('calls the primaryUrl callback when rendered', () => {
      expect(mockPrimaryUrl).toHaveBeenCalledTimes(1);
    });

    it('renders with default props', () => {
      expect(getByRole('button')).toHaveAttribute('href', '/core/');
    });
  });

  it(' renders with no props', () => {
    const { container } = render(setup({}));
    expect(container).toBeInTheDocument();
  });

  // snapshot test
  it('renders correctly', () => {
    const { asFragment } = render(setup());
    expect(asFragment()).toMatchSnapshot();
  });
});