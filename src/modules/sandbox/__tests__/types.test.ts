import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CodeStyling, CodeVariant, DemoData } from './types';
import type { MuiProductId } from 'src/modules/utils/getProductInfoFromUrl';

interface MockProductInfo {
  productId: MuiProductId;
}

const mockProductInfo: MockProductInfo = {
  productId: 'some-id',
};

describe('CodeStyling component', () => {
  const demoData: DemoData = {
    title: 'Test Title',
    language: 'test-language',
    raw: 'Test Raw Code',
    codeVariant: 'TS',
    githubLocation: 'https://github.com/test-repo',
    productId: mockProductInfo.productId,
    codeStyling: 'Tailwind',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<CodeStyling {...demoData} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders title when codeVariant is TS', () => {
      demoData.codeVariant = 'TS';
      const { getByText } = render(<CodeStyling {...demoData} />);
      expect(getByText(demoData.title)).toBeInTheDocument();
    });

    it('renders language when codeVariant is JS', () => {
      demoData.codeVariant = 'JS';
      const { getByText } = render(<CodeStyling {...demoData} />);
      expect(getByText(demoData.language)).toBeInTheDocument();
    });

    it('renders raw when codeVariant is TS and codeStyling is Tailwind', () => {
      demoData.codeVariant = 'TS';
      demoData.codeStyling = 'Tailwind';
      const { getByText } = render(<CodeStyling {...demoData} />);
      expect(getByText(demoData.raw)).toBeInTheDocument();
    });

    it('renders githubLocation when codeVariant is TS and codeStyling is Tailwind', () => {
      demoData.codeVariant = 'TS';
      demoData.codeStyling = 'Tailwind';
      const { getByText } = render(<CodeStyling {...demoData} />);
      expect(getByText(demoData.githubLocation)).toBeInTheDocument();
    });

    it('renders productId when codeVariant is TS and codeStyling is Tailwind', () => {
      demoData.codeVariant = 'TS';
      demoData.codeStyling = 'Tailwind';
      const { getByText } = render(<CodeStyling {...demoData} />);
      expect(getByText(demoData.productId)).toBeInTheDocument();
    });

    it('renders codeStyling when codeVariant is JS and codeStyling is SUI System', () => {
      demoData.codeVariant = 'JS';
      demoData.codeStyling = 'SUI System';
      const { getByText } = render(<CodeStyling {...demoData} />);
      expect(getByText(demoData.codeStyling)).toBeInTheDocument();
    });

    it('does not render invalid codeVariants', () => {
      demoData.codeVariant = 'Invalid';
      const { container } = render(<CodeStyling {...demoData} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('prop validation', () => {
    it('throws an error when productId is null', () => {
      demoData.productId = null;
      expect(() => render(<CodeStyling {...demoData} />)).toThrowError(
        'Invalid productId'
      );
    });

    it('throws an error when codeVariant is not one of TS or JS', () => {
      demoData.codeVariant = 'Invalid';
      expect(() => render(<CodeStyling {...demoData} />)).toThrowError(
        'Invalid codeVariant'
      );
    });

    it('throws an error when codeStyling is not one of Tailwind or SUI System', () => {
      demoData.codeStyling = 'Invalid';
      expect(() => render(<CodeStyling {...demoData} />)).toThrowError(
        'Invalid codeStyling'
      );
    });
  });

  describe('user interactions', () => {
    it('calls onCodeChange when input changes', async () => {
      const mockOnCodeChange = jest.fn();
      demoData.raw = 'Test Raw Code';
      const { getByPlaceholderText } = render(<CodeStyling {...demoData} onCodeChange={mockOnCodeChange} />);
      userEvent.type(getByPlaceholderText('Raw'), demoData.raw);
      expect(mockOnCodeChange).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit when form is submitted', async () => {
      const mockOnSubmit = jest.fn();
      demoData.githubLocation = 'https://github.com/test-repo';
      const { getByText } = render(<CodeStyling {...demoData} onSubmit={mockOnSubmit} />);
      userEvent.click(getByText('Submit'));
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onProductChange when productId changes', async () => {
    const mockOnProductChange = jest.fn();
    demoData.productId = 'new-id';
    const { getByText } = render(<CodeStyling {...demoData} onProductChange={mockOnProductChange} />);
    userEvent.click(getByText('Update Product'));
    expect(mockOnProductChange).toHaveBeenCalledTimes(1);
  });

  describe('side effects', () => {
    it('calls getGitHubLocation when githubLocation prop is updated', async () => {
      const mockGetGitHubLocation = jest.fn();
      demoData.githubLocation = 'https://github.com/test-repo';
      const { getByText } = render(<CodeStyling {...demoData} getGitHubLocation={mockGetGitHubLocation} />);
      userEvent.click(getByText('Update GitHub Location'));
      expect(mockGetGitHubLocation).toHaveBeenCalledTimes(1);
    });

    it('calls getRaw when raw prop is updated', async () => {
      const mockGetRaw = jest.fn();
      demoData.raw = 'Test Raw Code';
      const { getByText } = render(<CodeStyling {...demoData} getRaw={mockGetRaw} />);
      userEvent.type(getByPlaceholderText('Raw'), demoData.raw);
      expect(mockGetRaw).toHaveBeenCalledTimes(1);
    });

    it('calls codeVariant when codeVariant prop is updated', async () => {
      const mockSetCodeVariant = jest.fn();
      demoData.codeVariant = 'TS';
      const { getByText } = render(<CodeStyling {...demoData} setCodeVariant={mockSetCodeVariant} />);
      userEvent.click(getByText('Update Code Variant'));
      expect(mockSetCodeVariant).toHaveBeenCalledTimes(1);
    });

    it('calls codeStyling when codeStyling prop is updated', async () => {
      const mockSetCodeStyling = jest.fn();
      demoData.codeStyling = 'Tailwind';
      const { getByText } = render(<CodeStyling {...demoData} setCodeStyling={mockSetCodeStyling} />);
      userEvent.click(getByText('Update Code Styling'));
      expect(mockSetCodeStyling).toHaveBeenCalledTimes(1);
    });
  });

  it('renders correctly', () => {
    const { asFragment } = render(<CodeStyling {...demoData} />);
    expect(asFragment()).toMatchSnapshot();
  });
});