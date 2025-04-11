import { render, fireEvent, screen } from '@testing-library/react';
import MaterialFeedbackComponents from './MaterialFeedbackComponents.test.js';
import ComponentShowcaseCard from 'src/components/action/ComponentShowcaseCard';

const mockGetStaticProps = jest.fn();
const mockLink = '/mock/link';
const mockName = 'Mock Name';
const mockSrcLight = '/static/mock/src-light.png';
const mockSrcDark = '/static/mock/src-dark.png';
const mockMd1 = true;
const mockMd2 = false;
const mockMd3 = false;
const mockNoGuidelines = true;

describe('MaterialFeedbackComponents component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MaterialFeedbackComponents />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering paths', () => {
    it('renders component showcase card', async () => {
      const { getByText, getByRole } = render(<MaterialFeedbackComponents />);
      await screen.findByRole('button');
      expect(getByText(mockName)).toBeInTheDocument();
      expect(getByRole('img')).toHaveAttribute('src', mockSrcLight);
    });

    it('does not render component showcase card for no guidelines', async () => {
      const { queryByText, queryByRole } = render(<MaterialFeedbackComponents />);
      await screen.findByRole('button');
      expect(queryByText(mockName)).not.toBeInTheDocument();
      expect(queryByRole('img')).toHaveAttribute('src', mockSrcDark);
    });
  });

  describe('prop validation', () => {
    it('renders component showcase card with valid props', async () => {
      const { getByText, getByRole } = render(<MaterialFeedbackComponents />);
      await screen.findByRole('button');
      expect(getByText(mockName)).toBeInTheDocument();
      expect(getByRole('img')).toHaveAttribute('src', mockSrcLight);
    });

    it('does not render component showcase card with invalid props', async () => {
      const { queryByText, queryByRole } = render(<MaterialFeedbackComponents link={null} />);
      await screen.findByRole('button');
      expect(queryByText(mockName)).not.toBeInTheDocument();
      expect(queryByRole('img')).toHaveAttribute('src', mockSrcDark);
    });
  });

  describe('user interactions', () => {
    it('opens link when button is clicked', async () => {
      const { getByText, getByRole } = render(<MaterialFeedbackComponents />);
      await screen.findByRole('button');
      const button = await screen.findByRole('button');
      fireEvent.click(button);
      expect(getByText(mockLink)).toBeInTheDocument();
    });
  });

  it('snapshot test', async () => {
    const { asFragment } = render(<MaterialFeedbackComponents />);
    expect(asFragment()).toMatchSnapshot();
  });
});