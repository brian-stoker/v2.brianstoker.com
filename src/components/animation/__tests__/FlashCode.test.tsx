import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { createFactory, create } from 'vitest';
import type { ReactComponentHTMLProps } from 'react';
import styled from '@mui/material/styles';
import shouldForwardProp from '@mui/system';
import FlashCode from './FlashCode';

type Props = React.ComponentHTMLProps<typeof FlashCode>;

const createFlashCode = (props: Props) => {
  return <FlashCode {...props} />;
};

const mockThemeVars = { vars: 'mock-vars' };
const theme = {
  typography: {
    caption: {},
    palette: {
      primary: {
        mainChannel: [255, 0, 0],
        dark: [0, 0, 0],
        main: '#333',
      },
      primaryDark: '#666',
    },
  },
};

describe('FlashCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', async () => {
    const props = { endLine: 1, startLine: 2 };
    const result = await createFactory(FlashCode).render(props);
    expect(result.container).toBeTruthy();
  });

  it('renders without crash for default props', async () => {
    const props = {};
    const result = await createFactory(FlashCode).render(props);
    expect(result.container).toBeTruthy();
  });

  it('should render line with correct height', async () => {
    const props = { endLine: 10, startLine: 5 };
    const { getByText } = render(createFlashCode(props));
    const line = getByText(`${props.startLine} - ${props.endLine}`);
    expect(line).toHaveStyle('height', '1.25rem');
  });

  it('should render with correct top position', async () => {
    const props = { endLine: 10, startLine: 5 };
    const { getByText } = render(createFlashCode(props));
    const line = getByText(`${props.startLine} - ${props.endLine}`);
    expect(line).toHaveStyle('top', '7.5rem');
  });

  it('should render with correct background color', async () => {
    const props = {};
    const { getByText } = render(createFlashCode(props));
    const line = getByText('1 - 2');
    expect(line).toHaveStyle('backgroundColor', '#777');
  });

  it('should handle invalid prop', async () => {
    const props = { endLine: 'invalid' };
    expect(() => render(createFlashCode(props))).toThrowError(
      `Invalid prop: invalid`
    );
  });

  it('should forward any other prop', async () => {
    const props = { foo: true };
    const { getByText } = render(createFlashCode(props));
    expect(getByText('foo')).toHaveStyle('color', 'red');
  });

  it('clicking line should not change height', async () => {
    const props = { endLine: 10, startLine: 5 };
    const handleMouseMove = jest.fn();
    const { getByText } = render(
      createFlashCode({
        ...props,
        onLineClick: handleMouseMove,
      })
    );
    const line = getByText(`${props.startLine} - ${props.endLine}`);
    fireEvent.mouseOver(line);
    expect(handleMouseMove).not.toHaveBeenCalled();
  });

  it('should update height when endLine prop changes', async () => {
    const props = { endLine: 10, startLine: 5 };
    const handleMouseMove = jest.fn();
    const { getByText } = render(
      createFlashCode({
        ...props,
        onLineClick: handleMouseMove,
      })
    );
    const line = getByText(`${props.startLine} - ${props.endLine}`);
    expect(line).toHaveStyle('height', '1.25rem');
    props.endLine = 15;
    await waitFor(() => expect(line).toHaveStyle('height', '2.125rem'));
  });

  it('should render with line height prop when valid', async () => {
    const props = { lineHeight: 'custom' };
    const { getByText } = render(createFlashCode(props));
    const line = getByText('1 - 2');
    expect(line).toHaveStyle('height', `calc(${props.lineHeight} * 1.5)`);
  });

  it('should not re-render with invalid line height prop', async () => {
    const props = { lineHeight: 'invalid' };
    const { rerender } = render(createFlashCode(props));
    expect(rerender).not.toHaveBeenCalled();
  });
});