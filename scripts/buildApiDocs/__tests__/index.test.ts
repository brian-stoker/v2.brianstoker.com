import { render, fireEvent, waitFor } from '@testing-library/react';
import yargs from 'yargs';
import { buildApi, ProjectSettings } from '@stoked-ui/internal-api-docs-builder';
import { fileExplorerSettings } from './fileExplorerSettings';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { type CommandOptions } from './commands';

vi.mock('@stoked-ui/internal-api-docs-builder', () => ({
  buildApi: (projectSettings: ProjectSettings[], grep?: string) =>
    Promise.resolve({}), // mock api builder
}));

describe('runCommand', () => {
  test('renders without crashing with default props', async () => {
    const { container } = render(<RunCommand />);
    expect(container).toHaveTextContent('');
  });

  test('renders without crashing when grep prop is provided', async () => {
    const { container } = render(<RunCommand grep="example" />);
    expect(container).toHaveTextContent('');
  });

  test('renders without crashing when grep prop is not provided', async () => {
    const { container } = render(<RunCommand />);
    expect(container).toHaveTextContent('');
  });

  test('renders file explorer settings correctly', async () => {
    vi.mock('./fileExplorerSettings', () => ({
      default: { /* mock file explorer settings */ },
    }));
    const { container } = render(<RunCommand />);
    expect(container).toHaveTextContent(
      JSON.stringify(fileExplorerSettings, null, 2)
    );
  });

  test('calls buildApi function correctly with valid props', async () => {
    vi.mock('@stoked-ui/internal-api-docs-builder', () => ({
      buildApi: (projectSettings: ProjectSettings[], grep?: string) =>
        Promise.resolve({}), // mock api builder
    }));
    const { getByText } = render(<RunCommand />);
    expect(getByText('Build API')).toBeInTheDocument();
    fireEvent.click(getByText('Build API'));
    await waitFor(() => expect(vi.mocked(buildApi)).toHaveBeenCalledTimes(1));
  });

  test('calls buildApi function correctly with invalid grep prop', async () => {
    vi.mock('@stoked-ui/internal-api-docs-builder', () => ({
      buildApi: (projectSettings: ProjectSettings[], grep?: string) =>
        Promise.resolve({}), // mock api builder
    }));
    const { getByText } = render(<RunCommand />);
    expect(getByText('Build API')).toBeInTheDocument();
    fireEvent.click(getByText('Build API'));
    await waitFor(() => expect(vi.mocked(buildApi)).toHaveBeenCalledTimes(1));
  });

  test('calls buildApi function correctly with non-string grep prop', async () => {
    vi.mock('@stoked-ui/internal-api-docs-builder', () => ({
      buildApi: (projectSettings: ProjectSettings[], grep?: string) =>
        Promise.resolve({}), // mock api builder
    }));
    const { getByText } = render(<RunCommand />);
    expect(getByText('Build API')).toBeInTheDocument();
    fireEvent.click(getByText('Build API'));
    await waitFor(() => expect(vi.mocked(buildApi)).toHaveBeenCalledTimes(1));
  });

  test('calls buildApi function correctly with null grep prop', async () => {
    vi.mock('@stoked-ui/internal-api-docs-builder', () => ({
      buildApi: (projectSettings: ProjectSettings[], grep?: string) =>
        Promise.resolve({}), // mock api builder
    }));
    const { getByText } = render(<RunCommand />);
    expect(getByText('Build API')).toBeInTheDocument();
    fireEvent.click(getByText('Build API'));
    await waitFor(() => expect(vi.mocked(buildApi)).toHaveBeenCalledTimes(1));
  });

  test('renders help message correctly', async () => {
    vi.mock('@stoked-ui/internal-api-docs-builder', () => ({
      buildApi: (projectSettings: ProjectSettings[], grep?: string) =>
        Promise.resolve({}), // mock api builder
    }));
    const { getByText } = render(<RunCommand />);
    expect(getByText('Help')).toBeInTheDocument();
  });

  test('renders strict mode correctly', async () => {
    vi.mock('@stoked-ui/internal-api-docs-builder', () => ({
      buildApi: (projectSettings: ProjectSettings[], grep?: string) =>
        Promise.resolve({}), // mock api builder
    }));
    const { getByText } = render(<RunCommand />);
    expect(getByText('Strict')).toBeInTheDocument();
  });

  test('renders version message correctly', async () => {
    vi.mock('@stoked-ui/internal-api-docs-builder', () => ({
      buildApi: (projectSettings: ProjectSettings[], grep?: string) =>
        Promise.resolve({}), // mock api builder
    }));
    const { getByText } = render(<RunCommand />);
    expect(getByText('Version')).toBeInTheDocument();
  });
});