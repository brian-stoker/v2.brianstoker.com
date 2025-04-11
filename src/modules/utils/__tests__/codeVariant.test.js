import { act, render, fireEvent, waitFor } from '@testing-library/react';
import { CodeVariantProvider } from './CodeVariant.test.js';
import { CODE_VARIANTS } from '../constants/codeVariants';
import { getCookie } from '../utils/helpers';
import { CodeVariantContext } from './CodeVariant.test.js';

describe('CodeVariantProvider', () => {
  const defaultProps = {
    children: <div />,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.cookie = null;
  });

  it('renders without crashing', async () => {
    render(<CodeVariantProvider {...defaultProps} />);
    expect(document.querySelector('.CodeVariantContext')).toBeInTheDocument();
  });

  it('renders all conditional rendering paths', async () => {
    const { container } = render(
      <CodeVariantProvider>
        <div />
        <div codeVariant="TS">TS</div>
        <div codeVariant="JS">JS</div>
      </CodeVariantProvider>,
    );

    expect(container.querySelector('.CodeVariantContext')).toBeInTheDocument();
    expect(container.querySelector('div:has(codeVariant="TS")')).toBeInTheDocument();
    expect(container.querySelector('div:has(codeVariant="JS")')).toBeInTheDocument();
  });

  it('validates props', async () => {
    const { getByText } = render(
      <CodeVariantProvider codeVariant={CODE_VARIANTS.TS}>
        <div />
      </CodeVariantProvider>,
    );

    expect(getByText(CODE_VARIANTS.TS)).toBeInTheDocument();

    render(
      <CodeVariantProvider codeVariant={null}>
        <div />
      </CodeVariantProvider>,
    );

    expect(getByText(null)).not.toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const { getByText } = render(<CodeVariantProvider>{}</CodeVariantProvider>);
    const button = getByText('Click me!');
    fireEvent.click(button);

    await waitFor(() => expect(document.cookie).toContain('codeVariant=TS'));
  });

  it('sets cookie on state change', async () => {
    const { getByText } = render(<CodeVariantProvider>{}</CodeVariantProvider>);
    const codeButton = getByText('Set Code!');
    fireEvent.click(codeButton);

    await waitFor(() => expect(document.cookie).toContain('codeVariant=TS'));
  });

  it('uses memoized values', async () => {
    const { getByText } = render(
      <CodeVariantProvider>
        <div />
        <useNoSsrCodeVariant />
      </CodeVariantProvider>,
    );

    expect(getByText(CODE_VARIANTS.TS)).toBeInTheDocument();
    expect(getByText(CODE_VARIANTS.JS)).not.toBeInTheDocument();

    const { getByText } = render(
      <CodeVariantProvider>
        <div />
        <useNoSsrCodeVariant codeVariant={CODE_VARIANTS.JS} />
      </CodeVariantProvider>,
    );

    expect(getByText(CODE_VARIANTS.TS)).toBeInTheDocument();
    expect(getByText(CODE_VARIANTS.JS)).toBeInTheDocument();
  });

  it('uses effects correctly', async () => {
    const { getByText } = render(<CodeVariantProvider>{}</CodeVariantProvider>);
    const button = getByText('Set Code!');
    fireEvent.click(button);

    await waitFor(() => expect(document.cookie).toContain('codeVariant=TS'));

    act(() => {
      document.cookie = 'codeVariant=JS';
    });

    await waitFor(() => expect(document.cookie).not.toContain('codeVariant=TS'));
  });
});