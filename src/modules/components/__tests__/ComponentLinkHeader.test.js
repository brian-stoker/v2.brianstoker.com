import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ComponentLinkHeader from './ComponentLinkHeader.test.js';
import useTranslate from '@stoked-ui/docs/i18n';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  MuiChip: () => ({}) as any,
}));

describe('ComponentLinkHeader', () => {
  const markdown = {
    headers: {
      packageName: 'material-ui',
      githubLabel: 'test-label',
      materialDesign: 'https://example.com/design',
    },
  };

  const design = true;
  const t = useTranslate();

  beforeEach(() => {
    global.console = { log: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ComponentLinkHeader markdown={markdown} design={design} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders Chip for GitHub Label', () => {
    const { getByText } = render(
      <ComponentLinkHeader markdown={markdown} design={design} />,
    );
    expect(getByText(t('githubLabel'))).toBeInTheDocument();
  });

  it('does not render Chip for GitHub Label when undefined', () => {
    const newMarkdown = { ...markdown, githubLabel: undefined };
    const { queryByText } = render(
      <ComponentLinkHeader markdown={newMarkdown} design={design} />,
    );
    expect(queryByText(t('githubLabel'))).toBeNull();
  });

  it('renders Chip for Bundle Size', () => {
    const { getByText } = render(
      <ComponentLinkHeader markdown={markdown} design={design} />,
    );
    expect(getByText(t('bundleSize'))).toBeInTheDocument();
  });

  it('does not render Chip for Bundle Size when undefined', () => {
    const newMarkdown = { ...markdown, bundleSize: undefined };
    const { queryByText } = render(
      <ComponentLinkHeader markdown={newMarkdown} design={design} />,
    );
    expect(queryByText(t('bundleSize'))).toBeNull();
  });

  it('renders Chip for Material Design', () => {
    const { getByText } = render(
      <ComponentLinkHeader markdown={markdown} design={true} />,
    );
    expect(getByText('Material Design')).toBeInTheDocument();
  });

  it('does not render Chip for Material Design when undefined', () => {
    const newMarkdown = { ...markdown, materialDesign: undefined };
    const { queryByText } = render(
      <ComponentLinkHeader markdown={newMarkdown} design={design} />,
    );
    expect(queryByText('Material Design')).toBeNull();
  });

  it('clicks on Chip for GitHub Label', () => {
    const newMarkdown = { ...markdown, githubLabel: 'test-label' };
    const { getByText } = render(
      <ComponentLinkHeader markdown={newMarkdown} design={design} />,
    );
    expect(getByText(t('githubLabel'))).toBeInTheDocument();
    fireEvent.click(getByText(t('githubLabel')));
    expect(global.console.log).toHaveBeenCalledTimes(1);
  });

  it('does not click on Chip for GitHub Label when undefined', () => {
    const newMarkdown = { ...markdown, githubLabel: undefined };
    const { getByText } = render(
      <ComponentLinkHeader markdown={newMarkdown} design={design} />,
    );
    expect(getByText(t('githubLabel'))).toBeInTheDocument();
    fireEvent.click(getByText(t('githubLabel')));
    expect(global.console.log).not.toHaveBeenCalled();
  });

  it('clicks on Chip for Bundle Size', () => {
    const { getByText } = render(
      <ComponentLinkHeader markdown={markdown} design={design} />,
    );
    expect(getByText(t('bundleSize'))).toBeInTheDocument();
    fireEvent.click(getByText(t('bundleSize')));
    expect(global.console.log).toHaveBeenCalledTimes(1);
  });

  it('does not click on Chip for Bundle Size when undefined', () => {
    const newMarkdown = { ...markdown, bundleSize: undefined };
    const { getByText } = render(
      <ComponentLinkHeader markdown={newMarkdown} design={design} />,
    );
    expect(getByText(t('bundleSize'))).toBeInTheDocument();
    fireEvent.click(getByText(t('bundleSize')));
    expect(global.console.log).not.toHaveBeenCalled();
  });

  it('clicks on Chip for Material Design', () => {
    const { getByText } = render(
      <ComponentLinkHeader markdown={markdown} design={true} />,
    );
    expect(getByText('Material Design')).toBeInTheDocument();
    fireEvent.click(getByText('Material Design'));
    expect(global.console.log).toHaveBeenCalledTimes(1);
  });

  it('does not click on Chip for Material Design when undefined', () => {
    const newMarkdown = { ...markdown, materialDesign: undefined };
    const { getByText } = render(
      <ComponentLinkHeader markdown={newMarkdown} design={design} />,
    );
    expect(getByText('Material Design')).toBeInTheDocument();
    fireEvent.click(getByText('Material Design'));
    expect(global.console.log).not.toHaveBeenCalled();
  });
});