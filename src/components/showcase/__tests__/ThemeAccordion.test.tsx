import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeAccordion } from './ThemeAccordion';

describe('ThemeAccordion', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<ThemeAccordion />);
    expect(container).toBeInTheDocument();
  });

  it('renders all accordion summaries correctly', async () => {
    const { getByText, getAllByRole } = render(<ThemeAccordion />);
    const summary1 = getByText('Typography');
    const summary2 = getByText('Hacks');

    expect(summary1).not.toBe(null);
    expect(summary2).not.toBe(null);

    const expandIcon = summary1.querySelector('.MuiAccordionSummary-expandIconWrapper') as HTMLSpanElement;
    expect(expandIcon).toHaveClass('primary.400');

    expect(getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders accordion details correctly', async () => {
    const { getByText } = render(<ThemeAccordion />);
    const details = getByText('Tag line headings (h1, h2) use General Sans, whereas the rest of the website use IBM Plex Sans.');

    expect(details).not.toBe(null);

    const expandIcon = details.querySelector('.MuiAccordionDetails-expandIconWrapper') as HTMLSpanElement;
    expect(expandIcon).toHaveClass('primary.400');
  });

  it('renders accordion panels correctly', async () => {
    const { getAllByRole } = render(<ThemeAccordion />);
    const panel1 = getAllByRole('listitem').find((item) => item.textContent === 'Typography');
    const panel2 = getAllByRole('listitem').find((item) => item.textContent === 'Hacks');

    expect(panel1).not.toBe(null);
    expect(panel2).not.toBe(null);

    expect(panel1).toHaveClass('outlined');
    expect(panel2).toHaveClass('outlined');
  });

  it('calls handleChange when clicking on an accordion summary', async () => {
    const handleChangeMock = jest.fn();
    const { getByText } = render(<ThemeAccordion handleChange={handleChangeMock} />);
    const summary1 = getByText('Typography');

    fireEvent.click(summary1);

    expect(handleChangeMock).toHaveBeenCalledTimes(1);
  });

  it('calls handleChange when clicking on an accordion panel', async () => {
    const handleChangeMock = jest.fn();
    const { getAllByRole } = render(<ThemeAccordion handleChange={handleChangeMock} />);
    const panel1 = getAllByRole('listitem').find((item) => item.textContent === 'Typography');

    fireEvent.click(panel1);

    expect(handleChangeMock).toHaveBeenCalledTimes(1);
  });

  it('calls handleChange when clicking on an accordion summary that is disabled', async () => {
    const handleChangeMock = jest.fn();
    const { getByText } = render(<ThemeAccordion handleChange={handleChangeMock} />);
    const summary2 = getByText('Hacks');

    fireEvent.click(summary2);

    expect(handleChangeMock).toHaveBeenCalledTimes(1);
  });

  it('calls handleChange when clicking on an accordion panel that is disabled', async () => {
    const handleChangeMock = jest.fn();
    const { getAllByRole } = render(<ThemeAccordion handleChange={handleChangeMock} />);
    const panel2 = getAllByRole('listitem').find((item) => item.textContent === 'Hacks');

    fireEvent.click(panel2);

    expect(handleChangeMock).toHaveBeenCalledTimes(1);
  });

  it('has the correct classes on the accordion panels', async () => {
    const { getByText } = render(<ThemeAccordion />);
    const panel1 = getByText('Typography');
    const panel2 = getByText('Hacks');

    expect(panel1).toHaveClass('outlined');
    expect(panel2).toHaveClass('outlined disabled');

    const expandIcon = panel1.querySelector('.MuiAccordionSummary-expandIconWrapper') as HTMLSpanElement;
    expect(expandIcon).toHaveClass('primary.400');

    expect(panel2.querySelector('.MuiAccordionSummary-expandIconWrapper')).toBeNull();
  });
});