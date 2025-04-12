import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory, createBrowserInstance, BrowserAdapter, createGlobalHistory } from '@react-spring/core';
import { configure as configureReactSpringCore } from '@react-spring/core';
import React from 'react';
import MaterialTheming from './MaterialTheming';

configureReactSpringCore();

const browser = createBrowserInstance();
const history = createMemoryHistory();

beforeEach(() => {
  global.history = history;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('MaterialTheming component', () => {
  const props = {
    customized: true,
  };

  it('renders without crashing', () => {
    render(<MaterialTheming {...props} />);
    expect(screen).toBeTruthy();
  });

  it('renders the correct SectionHeadline', async () => {
    const { getByText } = render(<MaterialTheming {...props} />);
    const headline = await waitFor(() => getByText(/Theming/));
    expect(headline).toHaveClass('section__headline');
  });

  it('renders the correct section', async () => {
    const { getByRole } = render(<MaterialTheming {...props} />);
    const section = await waitFor(() => getByRole('region'));
    expect(section).toHaveClass('section');
  });

  it('renders the correct Grid container', async () => {
    const { getByRole } = render(<MaterialTheming {...props} />);
    const gridContainer = await waitFor(() => getByRole('grid'));
    expect(gridContainer).toHaveClass('MuiGrid');
  });

  it('renders the correct Item component', async () => {
    const { getByText } = render(<MaterialTheming {...props} />);
    const item1 = await waitFor(() => getByText(/Custom Theme/));
    expect(item1).toHaveClass('Item');
  });

  it('renders the correct PlayerCard component', async () => {
    const { getByRole } = render(<MaterialTheming {...props} />);
    const playerCard = await waitFor(() => getByRole('region'));
    expect(playerCard).toHaveClass('PlayerCard');
  });

  it('renders the correct Frame component', async () => {
    const { getByRole } = render(<MaterialTheming {...props} />);
    const frameDemo = await waitFor(() => getByRole('region'));
    expect(frameDemo).toHaveClass('FrameDemo');
  });

  it('renders the correct Highlighter component', async () => {
    const { getByText } = render(<MaterialTheming {...props} />);
    const highlighter1 = await waitFor(() => getByText(/Custom Theme/));
    const highlighter2 = await waitFor(() => getByText(/Material Design/));
    expect(highlighter1).toHaveClass('Highlighter');
  });

  it('calls setCustomized when highlighted', async () => {
    const { getByText } = render(<MaterialTheming {...props} />);
    const highlighter1 = await waitFor(() => getByText(/Custom Theme/));
    fireEvent.click(highlighter1);
    expect(props.customized).toBe(true);
  });

  it('calls setCustomized when unhighlighted', async () => {
    const { getByText } = render(<MaterialTheming {...props} />);
    const highlighter2 = await waitFor(() => getByText(/Material Design/));
    fireEvent.click(highlighter2);
    expect(props.customized).toBe(false);
  });
});