import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AppTheme from './AppTheme.test.js';
import Head from 'src/modules/components/Head';

jest.mock('src/modules/components/Head');

describe('AppTheme component', () => {
  const mockHead = jest.fn();

  beforeEach(() => {
    global.fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AppTheme />);
    expect(container).toBeTruthy();
  });

  it('renders children', () => {
    const children = <div>Hello World!</div>;
    const { container } = render(<AppTheme children={children} />);
    expect(container).toContain(children);
  });

  it('renders Head with meta tag', () => {
    const { container, getByText } = render(<AppTheme />);
    const headElement = getByText('robots');
    expect(headElement).toHaveAttribute('name', 'robots');
    expect(headElement).toHaveAttribute('content', 'noindex,nofollow');
  });

  it('renders Head with valid props', () => {
    const mockHeadProps = { meta: [{ name: 'description', content: 'Meta description' }] };
    jest.mocked(Head.prototype, 'render').mockImplementation(() => <></>);
    const { container } = render(<AppTheme Head={mockHead} {...mockHeadProps} />);
    expect(jest.mocked(Head.prototype, 'render')).toHaveBeenCalledTimes(1);
  });

  it('renders Head with invalid props', () => {
    const mockHeadProps = { meta: [{ name: 'robots', content: 'invalid' }] };
    jest.mocked(Head.prototype, 'render').mockImplementation(() => <></>);
    expect(() => render(<AppTheme Head={mockHead} {...mockHeadProps} />)).toThrow();
  });

  it('handles user interaction - click', () => {
    const mockClick = jest.fn();
    const { getByText } = render(<AppTheme />);
    const buttonElement = getByText('Click me!');
    fireEvent.click(buttonElement);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('handles user interaction - input change', () => {
    const { getByPlaceholderText, getByText } = render(<AppTheme />);
    const inputField = getByPlaceholderText('Enter your name');
    const buttonElement = getByText('Submit');
    fireEvent.change(inputField, { target: { value: 'John Doe' } });
    fireEvent.click(buttonElement);
    expect(getByText('Hello John Doe!')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const { getByPlaceholderText, getByText } = render(<AppTheme />);
    const inputField = getByPlaceholderText('Enter your name');
    const buttonElement = getByText('Submit');
    fireEvent.change(inputField, { target: { value: 'John Doe' } });
    await waitFor(() => expect(buttonElement).toBeDisabled());
  });

  it('renders snapshot correctly', () => {
    const { container } = render(<AppTheme />);
    expect(container).toMatchSnapshot();
  });
});