import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { MUIThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import AboutEnd from './AboutEnd';

describe('About End component', () => {
  const history = createMemoryHistory();
  const browserHistory = createBrowserHistory();

  beforeEach(() => {
    // Mock prop types for AboutEnd
    jest.mock('../components/typography/GradientText');
    jest.mock('../components/typography/SectionHeadline');
    jest.mock('../layouts/Section');
    jest.mock('../route');
    jest.mock('@stoked-ui/docs/Link');

    // Render component in test suite
  });

  afterEach(() => {
    // Clean up mocked props and components after each test
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <MUIThemeProvider theme={theme}>
        <AboutEnd />
      </MUIThemeProvider>
    );

    expect(container).toBeTruthy();
  });

  it('renders SectionHeadline with correct props', async () => {
    const { getByText, getByRole } = render(
      <MUIThemeProvider theme={theme}>
        <AboutEnd />
      </MUIThemeProvider>
    );

    expect(getByText('Join us')).toBeInTheDocument();
    expect(getByRole('heading', { level: 2 })).toHaveAttribute('role', 'heading');
  });

  it('renders Button with correct props and clicks it', async () => {
    const history = createMemoryHistory();
    const { getByText, getByRole } = render(
      <MUIThemeProvider theme={theme}>
        <AboutEnd history={history} />
      </MUIThemeProvider>
    );

    expect(getByText('View careers')).toBeInTheDocument();
    fireEvent.click(getByText('View careers'));
    expect(history.push).toHaveBeenCalledWith(ROUTES.careers);
  });

  it('renders GradientText with correct props', async () => {
    const { getByRole } = render(
      <MUIThemeProvider theme={theme}>
        <AboutEnd />
      </MUIThemeProvider>
    );

    expect(getByRole('text', { name: 'Build the next generation' })).toBeInTheDocument();
  });

  it('renders Button with correct sx and width', async () => {
    const { getByText, getByRole } = render(
      <MUIThemeProvider theme={theme}>
        <AboutEnd />
      </MUIThemeProvider>
    );

    expect(getByText('View careers')).toBeInTheDocument();
    expect(getByRole('button', { name: 'View careers' })).toHaveStyle({
      width: { xs: '100%', sm: 'fit-content' },
    });
  });

  it('renders img with correct sx and display', async () => {
    const { getByAltText } = render(
      <MUIThemeProvider theme={theme}>
        <AboutEnd />
      </MUIThemeProvider>
    );

    expect(getByAltText('A map illustration')).toBeInTheDocument();
    expect(getByAltText('A map illustration')).toHaveStyle({
      display: { xs: 'none', sm: 'block' },
    });
  });

  it('renders img with correct alt and src', async () => {
    const { getByAltText } = render(
      <MUIThemeProvider theme={theme}>
        <AboutEnd />
      </MUIThemeProvider>
    );

    expect(getByAltText('A map illustration')).toBeInTheDocument();
    expect(getByAltText('A map illustration')).toHaveAttribute('src', '/static/branding/about/illustrations/team-globe-distribution-light.png');
  });
});