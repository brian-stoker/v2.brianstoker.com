import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter } from '@testing-library/react-router';
import { describe, expect, test } from 'vitest';
import HighlightedCodeWithTabs from './HighlightedCodeWithTabs';

interface TestProps {
  tabs: Array<TabsConfig>;
  storageKey?: string;
}

describe('HighlightedCodeWithTabs component', () => {
  const defaultTabs = [
    { tab: 'bash' },
    { tab: 'python' },
    { tab: 'javascript' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', async () => {
    const props: TestProps = {
      tabs: defaultTabs,
      storageKey: 'test-key',
    };

    const { getByText, getAllByRole } = render(<HighlightedCodeWithTabs {...props} />);
    expect(getByText(defaultTabs[0].tab)).toBeInTheDocument();
    expect(getAllByRole('button')[1]).toBeInTheDocument();

    // Act on a tab change
    fireEvent.click(getByText(defaultTabs[1].tab));

    await waitFor(() => expect(props.activeTab).toBe(defaultTabs[1].tab));
  });

  test('renders all tabs', async () => {
    const props: TestProps = {
      tabs: defaultTabs,
      storageKey: 'test-key',
    };

    const { getAllByRole } = render(<HighlightedCodeWithTabs {...props} />);
    expect(getAllByRole('button')).toHaveLength(defaultTabs.length);

    // Act on a tab change
    fireEvent.click(getByText(defaultTabs[1].tab));

    await waitFor(() => expect(props.activeTab).toBe(defaultTabs[1].tab));
  });

  test('renders highlighted code', async () => {
    const props: TestProps = {
      tabs: defaultTabs,
      storageKey: 'test-key',
    };

    const { getByText, getAllByRole } = render(<HighlightedCodeWithTabs {...props} />);
    expect(getByText(defaultTabs[1].tab)).toBeInTheDocument();
    expect(getByText('const x = 5;')).toBeInTheDocument();

    // Act on a tab change
    fireEvent.click(getByText(defaultTabs[0].tab));

    await waitFor(() => expect(props.activeTab).toBe(defaultTabs[0].tab));
    expect(getByText('x = 5')).toBeInTheDocument();
  });

  test('prop validation', async () => {
    const props: TestProps = {
      tabs: [],
      storageKey: 'test-key',
    };

    const { getByText } = render(<HighlightedCodeWithTabs {...props} />);
    expect(getByText('No tabs defined')).toBeInTheDocument();

    // Act on a tab change
    fireEvent.click(getByText('No tabs defined'));

    await waitFor(() => expect(props.activeTab).toBe(defaultTabs[0].tab));
  });

  test('changes storage key', async () => {
    const props: TestProps = {
      tabs: defaultTabs,
      storageKey: 'test-key',
    };

    const { getByText, getAllByRole } = render(<HighlightedCodeWithTabs {...props} />);
    expect(getByText(defaultTabs[0].tab)).toBeInTheDocument();

    // Act on a tab change
    fireEvent.click(getByText(defaultTabs[1].tab));

    await waitFor(() => expect(props.activeTab).toBe(defaultTabs[1].tab));
  });

  test('renders with storage key', async () => {
    const props: TestProps = {
      tabs: defaultTabs,
      storageKey: 'test-key',
    };

    const { getByText, getAllByRole } = render(<HighlightedCodeWithTabs {...props} />);
    expect(getByText(defaultTabs[0].tab)).toBeInTheDocument();
    expect(getByText('x = 5')).toBeInTheDocument();

    // Act on a tab change
    fireEvent.click(getByText(defaultTabs[1].tab));

    await waitFor(() => expect(props.activeTab).toBe(defaultTabs[1].tab));
    expect(getByText('x = 5')).toBeInTheDocument();
  });

  test('renders with default storage key', async () => {
    const props: TestProps = {
      tabs: defaultTabs,
    };

    const { getByText, getAllByRole } = render(<HighlightedCodeWithTabs {...props} />);
    expect(getByText(defaultTabs[0].tab)).toBeInTheDocument();
    expect(getByText('x = 5')).toBeInTheDocument();

    // Act on a tab change
    fireEvent.click(getByText(defaultTabs[1].tab));

    await waitFor(() => expect(props.activeTab).toBe(defaultTabs[1].tab));
    expect(getByText('x = 5')).toBeInTheDocument();
  });
});