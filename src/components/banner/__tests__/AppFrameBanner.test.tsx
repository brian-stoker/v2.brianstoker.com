import React from 'react';
import { render } from '@testing-library/react';
import AppFrameBanner from './AppFrameBanner.test.tsx';
import FEATURE_TOGGLE from 'src/featureToggle';
import PageContext from 'src/modules/components/PageContext';
import convertProductIdToName from 'src/modules/components/AppSearch';

describe('AppFrameBanner component', () => {
  const pageContext = { id: 123 };
  const productName = 'SUI';

  beforeEach(() => {
    jest.spyOn(FEATURE_TOGGLE, 'enable_docsnav_banner').mockReturnValue(true);
    jest.spyOn(PageContext, 'useContext').mockReturnValue(pageContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AppFrameBanner />);
    expect(container).toBeTruthy();
  });

  it('renders banner when FEATURE_TOGGLE.enable_docsnav_banner is true', () => {
    const { getByText } = render(<AppFrameBanner />);
    expect(getByText(/Influence/)).toBeInTheDocument();
  });

  it('does not render banner when FEATURE_TOGGLE.enable_docsnav_banner is false', () => {
    jest.spyOn(FEATURE_TOGGLE, 'enable_docsnav_banner').mockReturnValue(false);
    const { queryByText } = render(<AppFrameBanner />);
    expect(queryByText(/Influence/)).not.toBeInTheDocument();
  });

  it('renders with valid props', () => {
    const { getByText } = render(
      <AppFrameBanner href="https://tally.so/r/3Ex4PN?source=docs-banner" />,
    );
    expect(getByText(/Influence/)).toBeInTheDocument();
  });

  it('throws error when message is too long in non-production environment', () => {
    jest.spyOn(PageContext, 'useContext').mockReturnValue({ id: 123 });
    jest.spyOn(process.env, 'NODE_ENV').mockValue('development');
    expect(() => render(<AppFrameBanner />)).toThrowError(
      'Docs-infra: AppFrameBanner message is too long. It will overflow on smaller screens.',
    );
  });

  it('renders with link variant prop', () => {
    const { getByText } = render(<AppFrameBanner href="https://tally.so/r/3Ex4PN?source=docs-banner" variant="link" />);
    expect(getByText(/Influence/)).toBeInTheDocument();
  });

  it('renders with caption variant prop', () => {
    const { getByText } = render(
      <AppFrameBanner
        href="https://tally.so/r/3Ex4PN?source=docs-banner"
        variant="caption"
        sx={{ padding: '10px' }}
      />,
    );
    expect(getByText(/Influence/)).toBeInTheDocument();
  });

  it('renders with custom styles', () => {
    const { getByText } = render(
      <AppFrameBanner
        href="https://tally.so/r/3Ex4PN?source=docs-banner"
        sx={{
          padding: '10px',
          display: 'none',
        }}
      />,
    );
    expect(getByText(/Influence/)).toBeInTheDocument();
  });

  it('calls Link component correctly', () => {
    const { getByText } = render(<AppFrameBanner href="https://tally.so/r/3Ex4PN?source=docs-banner" />);
    expect(getByText(/Influence/)).toHaveAttribute('href', 'https://tally.so/r/3Ex4PN?source=docs-banner');
  });

  it('calls Link component with target prop correctly', () => {
    const { getByText } = render(<AppFrameBanner href="https://tally.so/r/3Ex4PN?source=docs-banner" target="_blank" />);
    expect(getByText(/Influence/)).toHaveAttribute('target', '_blank');
  });

  it('calls Link component with variant prop correctly', () => {
    const { getByText } = render(
      <AppFrameBanner
        href="https://tally.so/r/3Ex4PN?source=docs-banner"
        variant="caption"
      />,
    );
    expect(getByText(/Influence/)).toHaveAttribute('variant', 'caption');
  });

  it('calls Link component with sx prop correctly', () => {
    const { getByText } = render(
      <AppFrameBanner
        href="https://tally.so/r/3Ex4PN?source=docs-banner"
        sx={{ padding: '10px' }}
      />,
    );
    expect(getByText(/Influence/)).toHaveAttribute('sx', { padding: '10px' });
  });

  it('calls convertProductIdToName function correctly', () => {
    const result = convertProductIdToName(pageContext);
    expect(result).toBe(productName);
  });

  it('calls PageContext.useContext function correctly', () => {
    jest.spyOn(PageContext, 'useContext').mockReturnValue(pageContext);
    const { getByText } = render(<AppFrameBanner />);
    expect(getByText(/Influence/)).toBeInTheDocument();
  });
});