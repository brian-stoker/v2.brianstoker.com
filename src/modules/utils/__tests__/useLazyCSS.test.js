import { render, fireEvent, waitFor } from '@testing-library/react';
import useLazyCSS from './useLazyCSS.test';

jest.mock('fg-loadcss/src/loadCSS', () => ({
  loadCSS: jest.fn((href, element) => {
    return {
      href,
      element,
    };
  }),
}));

describe('useLazyCSS', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const href = 'https://example.com/style.css';
    const before = '.container';

    render(<useLazyCSS href={href} before={before} />);

    expect(document.body).not.toBeNull();
  });

  it('renders CSS styles after load', async () => {
    const href = 'https://example.com/style.css';
    const before = '.container';

    render(<useLazyCSS href={href} before={before} />);
    await waitFor(() => document.querySelector(before));

    expect(document.querySelector(before)).not.toBeNull();
  });

  it('renders before styles after load', async () => {
    const href = 'https://example.com/style.css';
    const before = '.container';

    render(<useLazyCSS href={href} before={before} />);
    await waitFor(() => document.querySelector(before));

    expect(document.querySelector(before)).not.toBeNull();
  });

  it('removes parent element after cleanup', () => {
    const href = 'https://example.com/style.css';
    const before = '.container';

    render(<useLazyCSS href={href} before={before} />);
    const linkElement = document.querySelector(before);

    fireEvent.click(document.querySelector(before));

    expect(linkElement.parentElement).not.toBeNull();

    useLazyCSS.href = '';
    useLazyCSS.before = '';

    expect(linkElement.parentElement).toBeNull();
  });

  it('validates props', () => {
    expect(() => render(<useLazyCSS href='https://example.com/style.css' />)).not.toThrowError();
    expect(() => render(<useLazyCSS before='.container' />)).not.toThrowError();

    expect(() => render(<useLazyCSS href='invalid-url' />)).toThrowError();
    expect(() => render(<useLazyCSS before='invalid-selector' />)).toThrowError();
  });

  it('renders with invalid props', () => {
    const href = 'https://example.com/style.css';
    const before = '.container';

    render(<useLazyCSS href={href} before={before} invalidProp={'test'} />);

    expect(document.body).not.toBeNull();
  });

  it('respects CSS selector order when rendering', async () => {
    const href = 'https://example.com/style.css';
    const before = '.container';
    const after = '.header';

    render(<useLazyCSS href={href} before={before} after={after} />);
    await waitFor(() => document.querySelector(after));
    expect(document.querySelector(before)).not.toBeNull();

    expect(document.querySelector(before).parentElement).toBeNull();
  });

  it('calls cleanup function when component unmounts', async () => {
    const href = 'https://example.com/style.css';
    const before = '.container';

    render(<useLazyCSS href={href} before={before} />);
    const linkElement = document.querySelector(before);

    fireEvent.click(document.querySelector(before));

    expect(linkElement.parentElement).not.toBeNull();

    useLazyCSS.href = '';
    useLazyCSS.before = '';

    await waitFor(() => expect(linkElement.parentElement).toBeNull());
  });
});