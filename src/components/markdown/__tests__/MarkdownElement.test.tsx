import React from 'react';
import clsx from 'clsx';
import { styled, ThemeProvider } from '@mui/material/styles';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'jest-extended';
import { describe, expect, test, vi } from 'vitest';
import MarkdownElement from './MarkdownElement';

const mockedTheme = {
  palette: {
    text: {
      primary: '#333',
    },
  },
} as const;

const renderComponent = (props) => render(
  <ThemeProvider theme={mockedTheme}>
    <MarkdownElement {...props} />
  </ThemeProvider>
);

describe('MarkdownElement component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  test('renders without crashing', async () => {
    await create.renderComponent(renderComponent, {});
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    test('renders code blocks with correct styles', async () => {
      const { getByText } = renderComponent({ renderedMarkdown: '<code>test</code>' });
      const preElement = getByText('pre');
      expect(preElement).toHaveStyleRule('background-color', 'hsl(210, 35%, 9%)');
    });

    test('does not render code blocks when not present in markdown', async () => {
      const { queryByText } = renderComponent({ renderedMarkdown: '<p>test</p>' });
      expect(queryByText('code')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    const validProps = { renderedMarkdown: 'test' };
    const invalidPropValues = [{ renderedMarkdown: undefined }, { renderedMarkdown: null }];

    test('allows valid props to render the component', async () => {
      await create.renderComponent(renderComponent, validProps);
      expect(container).toBeInTheDocument();
    });

    test('throws an error when receiving invalid prop values', async () => {
      await expect(
        create.renderComponent(renderComponent, { renderedMarkdown: invalidPropValues[0] })
      ).rejects.toThrowError();
      await expect(
        create.renderComponent(renderComponent, { renderedMarkdown: invalidPropValues[1] })
      ).rejects.toThrowError();
    });
  });

  describe('user interactions', () => {
    test('handles clicks on the component', async () => {
      const { getByText } = renderComponent({ renderedMarkdown: '<p>test</p>' });
      const element = await getElementByRole(container, 'button');
      expect(element).toBeNull();

      await userEvent.click(getByText('test'));

      expect(element).not.toBeNull();
    });

    test('handles input changes', async () => {
      const { getByText } = renderComponent({ renderedMarkdown: '<p>test</p>' });
      const inputElement = await getInputElement(container, 'text');
      expect(inputElement).toBeNull();

      await userEvent.type(getByText('test'), 'updated');

      expect(inputElement).not.toBeNull();
    });

    test('submits forms', async () => {
      const { getByText } = renderComponent({ renderedMarkdown: '<p>test</p>' });
      const formElement = await getFormElement(container);
      expect(formElement).toBeNull();

      await userEvent.click(getByText('test'));

      expect(formElement).not.toBeNull();
    });
  });

  describe('side effects or state changes', () => {
    test('does not trigger side effects when rendering the component', async () => {
      const mockedEffect = vi.fn();
      renderComponent({ renderedMarkdown: '<p>test</p>' }, { useEffect: [mockedEffect] });
      expect(mockedEffect).not.toHaveBeenCalled();
    });

    test('triggers side effects when using React hooks inside the component', async () => {
      const mockedEffect = vi.fn();
      const HookComponent = (props) => {
        useEffect(() => {
          mockedEffect();
        }, []);
        return <div>Hello World!</div>;
      };
      renderComponent({ renderedMarkdown: '<p>test</p>' }, { children: <HookComponent /> });
      expect(mockedEffect).toHaveBeenCalledTimes(1);
    });
  });

  test('matches snapshot', async () => {
    const props = { renderedMarkdown: 'test' };
    await create.renderComponent(renderComponent, props);
    expect(container).toMatchSnapshot();
  });
});

function getInputElement(element: HTMLDivElement, type: string): HTMLElement | null {
  return element.querySelector(`input[type="${type}"]`) || null;
}

function getFormElement(element: HTMLDivElement): HTMLFormElement | null {
  return element.querySelector('form') || null;
}

function getRole(element: HTMLDivElement, role: string): HTMLElement | null {
  return element.querySelector(`[${role}]`) || null;
}

function getElementType(element: HTMLDivElement): string {
  return element.tagName.toLowerCase();
}