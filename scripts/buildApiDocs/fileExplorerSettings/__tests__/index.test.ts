import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import '@stoked-ui/internal-api-docs-builder/ApiBuilders/ComponentApiBuilder';
import '@stoked-ui/internal-api-docs-builder/ApiBuilders/HookApiBuilder';
import findApiPages from '@stoked-ui/internal-api-docs-builder/utils/findApiPages';
import generateUtilityClass, { isGlobalState } from '@mui/utils/generateUtilityClass';

describe('FileExplorerSettings', () => {
  const fileExplorerSettings = require('./getComponentInfo').fileExplorerSettings;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(fileExplorerSettings);
    expect(container).not.toBeNull();
  });

  it('renders all pages correctly', async () => {
    fileExplorerSettings.getApiPages = jest.fn(() => [
      { pathname: 'api-page-1', title: 'Page 1' },
      { pathname: 'api-page-2', title: 'Page 2' },
    ]);

    const { container } = render(fileExplorerSettings);
    expect(container).not.toBeNull();
    expect(
      Array.from(container.querySelectorAll('MuiPage')).map((page) => page.props.pathname),
    ).toEqual(['api-page-1', 'api-page-2']);
  });

  it('renders pages with plan correctly', async () => {
    fileExplorerSettings.getApiPages = jest.fn(() => [
      { pathname: 'api-page-1', title: 'Page 1' },
      { pathname: 'api-page-2', title: 'Page 2', plan: 'pro' },
    ]);

    const { container } = render(fileExplorerSettings);
    expect(container).not.toBeNull();
    expect(
      Array.from(container.querySelectorAll('MuiPage')).map((page) => page.props.plan),
    ).toEqual(['pro', 'premium']);
  });

  it('skips component when skipComponent returns true', async () => {
    fileExplorerSettings.skipComponent = jest.fn(() => true);

    const { container } = render(fileExplorerSettings);
    expect(container).toBeNull();
  });

  it('validates props with default verification enabled', async () => {
    const invalidProp = { invalid: 'prop' };

    await expect(fileExplorerSettings.propsSettings).rejects.toThrowError(
      expect.stringContaining(invalidProp.toString()),
    );

    const validProp = { valid: 'prop' };
    await expect(fileExplorerSettings.propsSettings).resolveToPromise(
      expect.objectContaining(validProp),
    );
  });

  it('generates class name with generateUtilityClass', async () => {
    const utilityClass = fileExplorerSettings.generateClassName;
    expect(utilityClass()).not.toBeUndefined();
  });

  it('uses isGlobalState to check if class name is global', async () => {
    const isGlobalStateMock = jest.fn(() => true);

    fileExplorerSettings.isGlobalState = isGlobalStateMock;

    expect(fileExplorerSettings.isGlobalClassName).toBe(isGlobalStateMock);
  });

  it('generates component imports with getComponentImports', async () => {
    const componentImports = fileExplorerSettings.getComponentImports;
    expect(componentImports).not.toBeUndefined();
  });
});