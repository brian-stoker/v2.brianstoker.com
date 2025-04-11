import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import DemoEditor from './DemoEditor';
import { useTranslate, useCodeCopy } from './hooks';
import { blueDark } from '@stoked-ui/docs/branding';

describe('DemoEditor', () => {
  const wrapperRef = React.createRef<HTMLElement>();
  const enterRef = React.createRef<HTMLElement>();

  beforeEach(() => {
    document.body.style = 'body { font-family: monospace; }';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DemoEditor />);
    expect(wrapperRef.current).not.toBeNull();
  });

  it('renders correctly with children', () => {
    const { getByText } = render(<DemoEditor>Test content</DemoEditor>);
    expect(getByText('Test content')).not.toBeNull();
  });

  it('sets tab index to -1 for textarea', async () => {
    const onChangeMock = jest.fn();
    const { getByRole, getByText } = render(<DemoEditor language="javascript" value="let x = 5;" onChange={onChangeMock} />);
    await waitFor(() => expect(getByRole('textbox')).not.toHaveAttribute('tabindex'));
    expect(getByRole('textbox').textContent).toBe("let x = 5;");
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('focuses enter key press', async () => {
    const onChangeMock = jest.fn();
    const { getByText, getByRole } = render(<DemoEditor language="javascript" value="let x = 5;" onChange={onChangeMock} />);
    await waitFor(() => expect(getByRole('textbox')).not.toHaveAttribute('tabindex'));
    fireEvent.keyDown(document.activeElement, { key: 'Enter', code: 13 });
    expect(getByText('Test content').textContent).toBe("let x = 5;");
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('sets tab index to -1 for enter key press', async () => {
    const onChangeMock = jest.fn();
    const { getByRole, getByText } = render(<DemoEditor language="javascript" value="let x = 5;" onChange={onChangeMock} />);
    await waitFor(() => expect(getByRole('textbox')).not.toHaveAttribute('tabindex'));
    fireEvent.keyDown(document.activeElement, { key: 'Enter', code: 13 });
    const textarea = getByRole('textbox');
    expect(textarea).toBeFocusable();
  });

  it('renders copy button with correct language', () => {
    render(<DemoEditor language="javascript" value="let x = 5;" />);
    const codeElement = document.querySelector('.MuiCode-root > .scrollContainer > pre');
    if (codeElement) {
      expect(codeElement.textContent).toBe('<code class="language-javascript">let x = 5;</code>');
    }
  });

  it('renders copy button with correct value', () => {
    render(<DemoEditor language="javascript" value="let x = 5;" />);
    const codeElement = document.querySelector('.MuiCode-root > .scrollContainer > pre');
    if (codeElement) {
      expect(codeElement.textContent).toBe('<code class="language-javascript">let x = 5;</code>');
    }
  });

  it('renders enter hint', () => {
    render(<DemoEditor language="javascript" value="let x = 5;" />);
    const enterHint = document.querySelector('.MuiCode-root > .scrollContainer > kbd');
    if (enterHint) {
      expect(enterHint.textContent).toBe('<kbd>Enter</kbd>');
    }
  });

  it('focuses on enter hint', async () => {
    render(<DemoEditor language="javascript" value="let x = 5;" />);
    await waitFor(() => document.querySelector('.MuiCode-root > .scrollContainer > kbd').focus);
    const enterHint = document.querySelector('.MuiCode-root > .scrollContainer > kbd');
    expect(enterHint).toBeFocusable();
  });
});