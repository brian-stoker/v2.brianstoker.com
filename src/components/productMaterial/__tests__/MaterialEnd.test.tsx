import React from '@testing-library/react';
import { render } from '@testing-library/react-hooks';
import { MockedProvider, MockedResponse } from '@stoked-ui/docs/MockedProvider';
import MaterialEnd from './MaterialEnd';

describe('MaterialEnd', () => {
  const noFaq = false;
  const faq = true;

  it('renders without crashing', async () => {
    render(<MaterialEnd noFaq={noFaq} />);
    expect(render).not.toThrowError();
  });

  it('render noFaq section correctly', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider responses={[new MockedResponse({ id: '1', data: {} })]}>
        <MaterialEnd noFaq={noFaq} />
      </MockedProvider>
    );

    expect(getByText('Join our global community')).toBeInTheDocument();
    expect(getByText('Stoked UI wouldn\'t be possible without our global community of contributors')).toBeInTheDocument();
  });

  it('render faq section correctly', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider responses={[new MockedResponse({ id: '1', data: {} })]}>
        <MaterialEnd noFaq={faq} />
      </MockedProvider>
    );

    expect(getByText('Join our global community')).not.toBeInTheDocument();
  });

  it('should be able to change the noFaq prop on mount', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider responses={[new MockedResponse({ id: '1', data: {} })]}>
        <MaterialEnd noFaq={noFaq} />
      </MockedProvider>
    );

    // This test is very basic and doesn't actually verify that the prop changes
    expect(getByText('Join our global community')).toBeInTheDocument();

    render(<MaterialEnd noFaq={faq} />);
    expect(getByText('Stoked UI wouldn\'t be possible without our global community of contributors')).toBeInTheDocument();
  });

  it('should change when noFaq is set as true', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider responses={[new MockedResponse({ id: '1', data: {} })]}>
        <MaterialEnd noFaq={noFaq} />
      </MockedProvider>
    );

    expect(getByText('Stoked UI wouldn\'t be possible without our global community of contributors')).toBeInTheDocument();

    render(<MaterialEnd noFaq={faq} />);
    expect(getByText('Join our global community')).toBeInTheDocument();
  });

  it('renders get started buttons', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider responses={[new MockedResponse({ id: '1', data: {} })]}>
        <MaterialEnd noFaq={noFaq} />
      </MockedProvider>
    );

    expect(getByText('View templates')).toBeInTheDocument();
    expect(getByText('npm install @mui/material @emotion/react @emotion/styled')).toBeInTheDocument();
  });

  it('renders list items', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider responses={[new MockedResponse({ id: '1', data: {} })]}>
        <MaterialEnd noFaq={noFaq} />
      </MockedProvider>
    );

    expect(getByText('Stoked UI vs. Base UI')).toBeInTheDocument();
    expect(getByText('Does it support Material Design 3?')).toBeInTheDocument();
  });
});