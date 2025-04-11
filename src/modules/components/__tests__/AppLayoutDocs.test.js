import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { create } from 'react-test-renderer';
import AppLayoutDocs from './AppLayoutDocs';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    asPath: '/edge-functions/og-image',
  })),
}));

jest.mock('@mui/material/styles', () => ({
  styled: (component) => component,
  create: (styles) => styles,
}));

jest.mock('@mui/material/GlobalStyles');

const AdManagerMock = {
  renderAd: jest.fn(),
};

const BackToTopMock = {
  render: jest.fn(),
};

describe('AppLayoutDocs', () => {
  beforeEach(() => {
    global.document = { body: {} };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AppLayoutDocs />);
    expect(container).not.toBeNull();
  });

  it('renders with correct layout props when disableLayout is true', () => {
    const { getByText } = render(<AppLayoutDocs disableLayout />);
    expect(getByText('AppFrame')).toBeInTheDocument();
  });

  it('renders AppFrame with correct banner component prop when disableLayout is false', () => {
    const { getByText } = render(<AppLayoutDocs BannerComponent={BackToTop} disableLayout />);
    expect(getByText('Banner')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    const children = React.createElement('div', null, 'Children');
    const { getByText } = render(<AppLayoutDocs children={children} />);
    expect(getByText('Children')).toBeInTheDocument();
  });

  it('renders footer with correct table of contents prop when toc is provided', () => {
    const toc = ['toc1', 'toc2'];
    const { getByText } = render(<AppLayoutDocs toc={toc} />);
    expect(getByText('Table of Contents')).toBeInTheDocument();
  });

  it('renders TOC when disableToc is false', () => {
    const { getByText } = render(<AppLayoutDocs disableToc={false} />);
    expect(getByText('Table of Contents')).toBeInTheDocument();
  });

  it('throws error if description is missing', () => {
    expect(() => <AppLayoutDocs description="" />).toThrowError(
      'Missing description in the page'
    );
  });

  it('renders correct product name when canonicalAs matches certain paths', async () => {
    const { getByText } = render(<AppLayoutDocs />);
    await waitFor(() => expect(getByText('SUI System')).toBeInTheDocument());
  });
});