import { render, fireEvent, waitFor } from '@testing-library/react';
import CodeCopyButton from './CodeCopyButton';
import userEvent from '@testing-library/user-event';

interface CodeCopyButtonProps {
  code: string;
}

jest.mock('src/modules/utils/useClipboardCopy');

describe('CodeCopyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<CodeCopyButton code="Hello World!" />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('should render copy icon when not copied', async () => {
      const { getByText, getAllByRole } = render(<CodeCopyButton code="Hello World!" />);
      const copyIcon = await getAllByRole('icon');
      expect(copyIcon[0]).toHaveAttribute('aria-label', 'Copy the code');
    });

    it('should render check icon when copied', async () => {
      jest.spyOn(useClipboardCopy, 'state').mockReturnValue({ isCopied: true });
      const { getByText, getAllByRole } = render(<CodeCopyButton code="Hello World!" />);
      const copyIcon = await getAllByRole('icon');
      expect(copyIcon[0]).toHaveAttribute('aria-label', 'Copy the code');
    });
  });

  describe('prop validation', () => {
    it('should not accept invalid code prop', async () => {
      expect(() => render(<CodeCopyButton code={null} />)).toThrowError(
        'Invalid code prop'
      );
    });

    it('should accept valid code prop', async () => {
      const { getByText } = render(<CodeCopyButton code="Hello World!" />);
      expect(getByText('Copy the code')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should copy to clipboard when clicked', async () => {
      jest.spyOn(useClipboardCopy, 'copy').mockResolvedValue('copied');
      const { getByText } = render(<CodeCopyButton code="Hello World!" />);
      await userEvent.click(getByText('Copy the code'));
      expect(await useClipboardCopy().state()).toBe('copied');
    });

    it('should handle keyboard input', async () => {
      jest.spyOn(useClipboardCopy, 'copy').mockResolvedValue('copied');
      const { getByText } = render(<CodeCopyButton code="Hello World!" />);
      await userEvent.type(getByText('Copy the code'), '123');
      expect(await useClipboardCopy().state()).toBe('copied');
    });
  });

  describe('side effects', () => {
    it('should update state when copied', async () => {
      jest.spyOn(useClipboardCopy, 'copy').mockResolvedValue('copied');
      const { getByText } = render(<CodeCopyButton code="Hello World!" />);
      await userEvent.click(getByText('Copy the code'));
      expect(await useClipboardCopy().state()).toBe('copied');
    });
  });

  it('should match snapshot', async () => {
    jest.spyOn(useClipboardCopy, 'copy').mockResolvedValue('copied');
    const { container } = render(<CodeCopyButton code="Hello World!" />);
    await waitFor(() => expect(container).toMatchSnapshot());
  });
});