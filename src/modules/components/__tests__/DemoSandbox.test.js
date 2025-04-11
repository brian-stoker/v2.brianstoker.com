import { render, fireEvent, waitFor } from '@testing-library/react';
import { create } from 'jss';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import { StyleSheetManager } from 'styled-components';
import { jssPreset, StylesProvider } from '@mui/styles';
import { useTheme, styled, createTheme, ThemeProvider } from '@mui/material/styles';
import rtl from 'jss-rtl';
import DemoErrorBoundary from 'src/modules/components/DemoErrorBoundary';
import { useTranslate } from '@stoked-ui/docs/i18n';
import { getDesignTokens } from '@stoked-ui/docs/branding';
import { ReactNode } from 'react';

describe('DemoSandbox', () => {
  it('renders DemoIframe when iframe is true', () => {
    const onResetDemoClick = jest.fn();
    const t = useTranslate();
    const children = <div>Hello World!</div>;
    const sandboxProps = { name: 'test-name', productId: 'test-id' };

    const renderSandbox = (props) => {
      return (
        <DemoErrorBoundary name="test-name" onResetDemoClick={onResetDemoClick} t={t}>
          {(props) => props.children}
        </DemoErrorBoundary>
      );
    };

    const renderedComponent = render(renderSandbox({ iframe: true, children, ...sandboxProps }));

    expect(renderedComponent.container).toBeInTheDocument();
  });

  it('renders StylesProvider when iframe is false', () => {
    const onResetDemoClick = jest.fn();
    const t = useTranslate();
    const children = <div>Hello World!</div>;
    const sandboxProps = { name: 'test-name', productId: 'test-id' };

    const renderSandbox = (props) => {
      return (
        <DemoErrorBoundary name="test-name" onResetDemoClick={onResetDemoClick} t={t}>
          {(props) => props.children}
        </DemoErrorBoundary>
      );
    };

    const renderedComponent = render(renderSandbox({ iframe: false, children, ...sandboxProps }));

    expect(renderedComponent.container).toBeInTheDocument();
  });

  it('renders DemoIframe when children are a ReactNode', () => {
    const onResetDemoClick = jest.fn();
    const t = useTranslate();
    const children = <div>Hello World!</div>;
    const sandboxProps = { name: 'test-name', productId: 'test-id' };

    const renderSandbox = (props) => {
      return (
        <DemoErrorBoundary name="test-name" onResetDemoClick={onResetDemoClick} t={t}>
          {(props) => props.children}
        </DemoErrorBoundary>
      );
    };

    const renderedComponent = render(renderSandbox({ iframe: true, children, ...sandboxProps }));

    expect(renderedComponent.container).toBeInTheDocument();
  });

  it('renders DemoErrorBoundary', () => {
    const onResetDemoClick = jest.fn();
    const t = useTranslate();

    const renderSandbox = (props) => {
      return (
        <DemoErrorBoundary name="test-name" onResetDemoClick={onResetDemoClick} t={t}>
          {(props) => props.children}
        </DemoErrorBoundary>
      );
    };

    const renderedComponent = render(renderSandbox({ children: 'Hello World!' }));

    expect(renderedComponent.container).toBeInTheDocument();
  });

  it('calls onResetDemoClick', () => {
    const onResetDemoClick = jest.fn();

    const t = useTranslate();

    const renderSandbox = (props) => {
      return (
        <DemoErrorBoundary name="test-name" onResetDemoClick={onResetDemoClick} t={t}>
          {(props) => props.children}
        </DemoErrorBoundary>
      );
    };

    const renderedComponent = render(renderSandbox({ children: 'Hello World!' }));

    fireEvent.click(renderedComponent.getByText('Hello World!'));

    expect(onResetDemoClick).toHaveBeenCalledTimes(1);
  });

  it('renders with correct theme', () => {
    const onResetDemoClick = jest.fn();
    const t = useTranslate();

    const renderSandbox = (props) => {
      return (
        <DemoErrorBoundary name="test-name" onResetDemoClick={onResetDemoClick} t={t}>
          {(props) => props.children}
        </DemoErrorBoundary>
      );
    };

    const renderedComponent = render(renderSandbox({ children: 'Hello World!' }));

    expect(renderedComponent.container).toHaveStyleRule('primary-color', 'blue');
  });
});