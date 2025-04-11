import { render, fireEvent, waitFor } from '@testing-library/react';
import CodeCopyProvider from './CodeCopy';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

interface CodeCopyProviderProps {
  children: React.ReactNode;
}

describe('CodeCopyProvider component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="MuiCode-root"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<CodeCopyProvider />);
    expect(getByText('CodeCopy')).toBeInTheDocument();
  });

  it('provides correct context value', async () => {
    const { getByText, useContext } = render(
      <CodeCopyProvider>
        <code>Test Code</code>
      </CodeCopyProvider>,
    );
    const rootNodeContextValue = useContext(CodeBlockContext);
    expect(rootNodeContextValue).toBeNull();
  });

  it('adds event listener to document', async () => {
    const { getByText, AllByAttribute } = render(
      <CodeCopyProvider>
        <code>Test Code</code>
      </CodeCopyProvider>,
    );
    await waitFor(() => expect(document.addEventListener).toHaveBeenCalledTimes(1));
  });

  it('skips event if user is highlighting a text', async () => {
    const { getByText, AllByAttribute } = render(
      <CodeCopyProvider>
        <code><input type="text" value="Test Text" /></code>
      </CodeCopyProvider>,
    );
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
    await waitFor(() => expect(document.addEventListener).not.toHaveBeenCalledWith('keydown'));
  });

  it('skips event if it\'s not a copy keyboard event', async () => {
    const { getByText, AllByAttribute } = render(
      <CodeCopyProvider>
        <code><input type="text" value="Test Text" /></code>
      </CodeCopyProvider>,
    );
    fireEvent.keyDown(document, { key: 'x', ctrlKey: true });
    await waitFor(() => expect(document.addEventListener).not.toHaveBeenCalledWith('keydown'));
  });

  it('clicks copy button on keyboard event', async () => {
    const { getByText, AllByAttribute } = render(
      <CodeCopyProvider>
        <code><input type="text" value="Test Text" /></code>
      </CodeCopyProvider>,
    );
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
    await waitFor(() => expect(getByText('Copied')).toBeInTheDocument());
  });

  it('calls copy function on keyboard event', async () => {
    const mockCopy = jest.fn();
    document.body.appendChild({ value: '', nodeName: 'textarea' });
    const { getByText, AllByAttribute } = render(
      <CodeCopyProvider>
        <code><input type="text" value="Test Text" /></code>
      </CodeCopyProvider>,
    );
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
    await waitFor(() => expect(mockCopy).toHaveBeenCalledTimes(1));
  });

  it('resets copy button state after 2 seconds', async () => {
    const mockCopy = jest.fn();
    document.body.appendChild({ value: '', nodeName: 'textarea' });
    const { getByText, AllByAttribute } = render(
      <CodeCopyProvider>
        <code><input type="text" value="Test Text" /></code>
      </CodeCopyProvider>,
    );
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
    await waitFor(() => expect(getByText('Copied')).toBeInTheDocument());
    await waitFor(() => expect(mockCopy).toHaveBeenCalledTimes(1));
    expect(document.querySelector('.MuiCode-copy').dataset.gaEventAction).toBe(
      'copy-keyboard',
    );
  });

  it('restores copy button state after 2 seconds', async () => {
    const mockCopy = jest.fn();
    document.body.appendChild({ value: '', nodeName: 'textarea' });
    const { getByText, AllByAttribute } = render(
      <CodeCopyProvider>
        <code><input type="text" value="Test Text" /></code>
      </CodeCopyProvider>,
    );
    fireEvent.keyDown(document, { key: 'c', ctrlKey: true });
    await waitFor(() => expect(getByText('Copied')).toBeInTheDocument());
    await waitFor(() => expect(mockCopy).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      const copyBtn = document.querySelector('.MuiCode-copy');
      expect(copyBtn.dataset.gaEventAction).toBeUndefined();
    });
  });
});