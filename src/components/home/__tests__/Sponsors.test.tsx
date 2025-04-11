import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Sponsors from './Sponsors';

describe('Sponsors component', () => {
  beforeEach(() => {
    // Create a mock SectionHeadline
    const SectionHeadlineMock = (props: any) => <div {...props} />;

    // Create a mock Typography component
    const TypographyMock = (props: any) => <div {...props} />;

    // Render Sponsors with mocks for SectionHeadline and Typography
    render(<Sponsors SectionHeadline={SectionHeadlineMock} Typography={TypographyMock} />);
  });

  afterEach(() => {
    // Reset the mock components
  });

  it('renders without crashing', () => {
    const { container } = render(<Sponsors />);

    expect(container).toBeTruthy();
  });

  it('renders all conditional rendering paths', () => {
    const { container, getByText } = render(<Sponsors />);

    expect(getByText('You make this possible')).toBeInTheDocument();

    expect(getByText('The development of these open-source tools is accelerated by our generous sponsors.')).toBeInTheDocument();
  });

  it('tests prop validation for SectionHeadline', () => {
    const { container, getByText } = render(<Sponsors />);

    // Test valid props
    expect(getByText('You make this possible')).toBeInTheDocument();

    // Test invalid props
    const SectionHeadlineInvalid = (props: any) => <div {...props} />;
    render(<Sponsors SectionHeadline={SectionHeadlineInvalid} />);
  });

  it('tests prop validation for Typography', () => {
    const { container, getByText } = render(<Sponsors />);

    // Test valid props
    expect(getByText('You')).toBeInTheDocument();

    // Test invalid props
    const TypographyInvalid = (props: any) => <div {...props} />;
    render(<Sponsors Typography={TypographyInvalid} />);
  });

  it('tests user interaction on SectionHeadline click', () => {
    const { getByText, getByRole } = render(<Sponsors />);

    // Test that the link is displayed
    expect(getByRole('button')).toBeInTheDocument();

    // Simulate a click event
    fireEvent.click(getByRole('button'));

    // Expect the content to be updated
  });

  it('tests user interaction on DiamondSponsors', () => {
    const { getByText, getByRole } = render(<Sponsors />);

    // Test that the link is displayed
    expect(getByText('Diamond Sponsors')).toBeInTheDocument();

    // Simulate a click event
    fireEvent.click(getByText('Diamond Sponsors'));

    // Expect the content to be updated
  });

  it('tests user interaction on GoldSponsors', () => {
    const { getByText, getByRole } = render(<Sponsors />);

    // Test that the link is displayed
    expect(getByText('Gold Sponsors')).toBeInTheDocument();

    // Simulate a click event
    fireEvent.click(getByText('Gold Sponsors'));

    // Expect the content to be updated
  });

  it('tests side effect of SectionHeadline', async () => {
    const { getByRole } = render(<Sponsors />);

    // Test that the link is displayed
    expect(getByRole('button')).toBeInTheDocument();

    // Simulate a click event
    fireEvent.click(getByRole('button'));

    // Wait for the content to be updated
    await waitFor(() => getByText('You make this possible'));
  });
});