import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from './TopLayoutCareers';
import * as pageProps from 'pages/careers/react-tech-lead-core.md?muiMarkdown';

jest.mock('src/modules/components/TopLayoutCareers', () => ({
  TopLayoutCareers: jest.fn(),
}));

describe('Page Component', () => {
  const mockProps = { ...pageProps };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    render(<TopLayoutCareers {...mockProps} />);
    expect(TopLayoutCareers).-not.toThrowError();
  });

  describe('conditional rendering', () => {
    it('renders correctly with valid props', async () => {
      const { getByText } = render(<TopLayoutCareers {...mockProps} />);
      await waitFor(() => expect(getByText('careers')).toBeInTheDocument());
    });

    it('does not render with invalid prop (e.g., missing prop)', async () => {
      mockProps.missingProp = undefined;
      render(<TopLayoutCareers {...mockProps} />);
      expect(TopLayoutCareers).toThrowError();
    });
  });

  describe('prop validation', () => {
    it('validates props correctly', async () => {
      mockProps.validProp = true;
      const { getByText } = render(<TopLayoutCareers {...mockProps} />);
      await waitFor(() => expect(getByText('valid')).toBeInTheDocument());
    });

    it('throws error with invalid prop (e.g., non-boolean value)', async () => {
      mockProps.invalidProp = 'not boolean';
      render(<TopLayoutCareers {...mockProps} />);
      expect(TopLayoutCareers).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('responds to clicks correctly', async () => {
      const { getByText } = render(<TopLayoutCareers {...mockProps} />);
      await waitFor(() => expect(getByText('click')).toBeInTheDocument());
      fireEvent.click(getByText('click'));
      expect(getByText('clicked')).toBeInTheDocument();
    });

    it('responds to input changes correctly', async () => {
      const { getByText, getByLabelText } = render(<TopLayoutCareers {...mockProps} />);
      await waitFor(() => expect(getByText('input')).toBeInTheDocument());
      fireEvent.change(getByLabelText('input'), { target: { value: 'new value' } });
      expect(getByText('updated')).toBeInTheDocument();
    });

    it('responds to form submissions correctly', async () => {
      const { getByText, getByLabelText } = render(<TopLayoutCareers {...mockProps} />);
      await waitFor(() => expect(getByText('form')).toBeInTheDocument());
      fireEvent.change(getByLabelText('input'), { target: { value: 'new value' } });
      fireEvent.submit(getByRole('form'));
      expect(getByText('submitted')).toBeInTheDocument();
    });
  });

  describe('side effects or state changes', () => {
    it('triggers side effect correctly', async () => {
      const mockSideEffect = jest.fn();
      TopLayoutCareers.useEffect = mockSideEffect;
      render(<TopLayoutCareers {...mockProps} />);
      expect(mockSideEffect).toHaveBeenCalledTimes(1);
    });

    it('updates state correctly', async () => {
      const { getByText } = render(<TopLayoutCareers {...mockProps} />);
      await waitFor(() => expect(getByText('state')).toBeInTheDocument());
      mockProps.stateChange();
      expect(getByText('updated')).toBeInTheDocument();
    });
  });

  describe('snapshot test', () => {
    it('matches the snapshot', async () => {
      const { asFragment } = render(<TopLayoutCareers {...mockProps} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});