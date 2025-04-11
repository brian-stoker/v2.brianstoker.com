import { render, fireEvent, waitFor } from '@testing-library/react';
import StartToday from './StartToday';

describe('StartToday component', () => {
  let container: any;

  beforeEach(() => {
    jest.resetAllMocks();
    container = render(<StartToday />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(container).toBeTruthy();
  });

  describe('SectionHeadline component tests', () => {
    it('renders alwaysCenter prop correctly', async () => {
      const { getByText } = container;
      await waitFor(() => getByText('Ship your next project faster'));
      expect(getByText('Ship your next project <GradientText>faster')).toBeInTheDocument();
    });

    it('renders overline prop correctly', async () => {
      const { getByText } = container;
      await waitFor(() => getByText('Start now'));
      expect(getByText('Start now')).toBeInTheDocument();
    });

    it('renders title prop correctly', async () => {
      const { getByRole } = container;
      await waitFor(() => getByRole('heading', { name: 'Ship your next project' }));
      expect(getByRole('heading', { name: 'Ship your next project' })).toHaveClass(
        'MuiTypography-headline-1'
      );
    });

    it('renders description prop correctly', async () => {
      const { getByText } = container;
      await waitFor(() => getByText('Find out why SUI\'s tools are trusted'));
      expect(getByText('Find out why SUI's tools are trusted')).toBeInTheDocument();
    });
  });

  describe('GetStartedButtons component tests', () => {
    it('renders with primaryLabel prop correctly', async () => {
      const { getByText } = container;
      await waitFor(() => getByText('Discover the Core libraries'));
      expect(getByText('Discover the Core libraries')).toHaveClass('MuiButton-root');
    });

    it('renders with primaryUrl prop correctly', async () => {
      const { getByRole } = container;
      await waitFor(() => getByRole('button', { name: 'Discover the Core libraries' }));
      expect(getByRole('button', { name: 'Discover the Core libraries' })).toHaveAttribute(
        'href',
        '/core/'
      );
    });
  });

  it('calls GetStartedButtons\'s onClick callback when clicked', async () => {
    const { getByRole } = container;
    const button = await waitFor(() => getByRole('button', { name: 'Discover the Core libraries' }));
    fireEvent.click(button);
    expect(StartToday.buttonsClick).toHaveBeenCalledTimes(1);
  });

  it('calls GetStartedButtons\'s onClick callback with correct URL when clicked', async () => {
    const { getByRole } = container;
    const button = await waitFor(() => getByRole('button', { name: 'Discover the Core libraries' }));
    fireEvent.click(button);
    expect(StartToday.buttonsClick).toHaveBeenCalledWith('/core/');
  });

  it('renders correctly with invalid props', async () => {
    const { getByText } = render(<StartToday alwaysCenter={0} overline="Invalid" />);
    await waitFor(() => getByText('Ship your next project <GradientText>faster'));
    expect(getByText('Ship your next project <GradientText>faster')).toBeInTheDocument();
  });
});