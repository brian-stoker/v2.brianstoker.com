import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Grid, IconImage } from '@mui/material';
import CompaniesGrid from './CompaniesGrid';

describe('CompaniesGrid', () => {
  const coreCustomers = [
    { alt: 'Spotify logo', name: 'companies/spotify', width: 100, height: 52 },
    { alt: 'Amazon logo', name: 'companies/amazon', width: 80, height: 52 },
    // Add more test data here
  ];

  const advancedCustomers = [
    {
      alt: 'Southwest logo',
      name: 'companies/southwest',
      width: 130,
      height: 54,
      style: { marginTop: -10 },
    },
    // Add more test data here
  ];

  const designKitsCustomers = [
    { alt: 'Spotify logo', name: 'companies/spotify', width: 100, height: 52 },
    // Add more test data here
  ];

  const templatesCustomers = [
    {
      alt: 'Ebay logo',
      name: 'companies/ebay',
      width: 73,
      height: 52,
    },
    // Add more test data here
  ];

  it('renders without crashing', () => {
    render(<CompaniesGrid data={coreCustomers} />);
    expect(screen).toMatchSnapshot();
  });

  it('renders all customers with different widths and heights', () => {
    const { getAllByRole } = render(
      <CompaniesGrid data={advancedCustomers} />,
    );
    const images = getAllByRole('img');
    expect(images.length).toBe(2);
    expect(images[0].style.width).toBe('6ch');
    expect(images[0].style.height).toBe('4ch');
    expect(images[1].style.width).toBe('4ch');
    expect(images[1].style.height).toBe('6ch');
  });

  it('renders design kits customers with correct style', () => {
    const { getAllByRole } = render(
      <CompaniesGrid data={designKitsCustomers} />,
    );
    const images = getAllByRole('img');
    expect(images.length).toBe(2);
    expect(images[0].style.width).toBe('6ch');
    expect(images[0].style.height).toBe('4ch');
    expect(images[1].style.width).toBe('3ch');
    expect(images[1].style.height).toBe('3ch');
  });

  it('renders templates customers with correct style', () => {
    const { getAllByRole } = render(
      <CompaniesGrid data={templatesCustomers} />,
    );
    const images = getAllByRole('img');
    expect(images.length).toBe(2);
    expect(images[0].style.width).toBe('4ch');
    expect(images[0].style.height).toBe('5ch');
    expect(images[1].style.width).toBe('3ch');
    expect(images[1].style.height).toBe('4ch');
  });

  it('calls correct callback with props', async () => {
    const onImageLoaded = jest.fn();
    render(
      <CompaniesGrid data={coreCustomers} onImageLoaded={onImageLoaded} />,
    );
    fireEvent.click(screen.getByRole('img'));
    await waitFor(() => expect(onImageLoaded).toHaveBeenCalledTimes(1));
  });
});