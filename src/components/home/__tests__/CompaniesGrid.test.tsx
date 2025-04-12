import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import CompaniesGrid from './CompaniesGrid';

describe('CompaniesGrid', () => {
  const initialData = [
    {
      alt: 'Spotify logo',
      name: 'companies/spotify',
      width: 100,
      height: 52,
    },
    {
      alt: 'Amazon logo',
      name: 'companies/amazon',
      width: 80,
      height: 52,
    },
  ];

  it('renders without crashing', () => {
    const { container } = render(<CompaniesGrid data={initialData} />);
    expect(container).toBeTruthy();
  });

  it('renders all companies when data is valid', async () => {
    const { getAllByRole } = render(<CompaniesGrid data={initialData} />);
    await waitFor(() => expect(getAllByRole('img')).toHaveLength(2));
  });

  it('renders no companies when data is invalid', async () => {
    const { getAllByRole } = render(<CompaniesGrid data=[] />);
    await waitFor(() => expect(getAllByRole('img')).toHaveLength(0));
  });

  describe('props validation', () => {
    it('throws an error when data is not provided', () => {
      expect(() => render(<CompaniesGrid />)).toThrowError();
    });
  });

  it('renders with style prop', async () => {
    const { getByText } = render(<CompaniesGrid data={initialData} />);
    const gridItem = await waitFor(() => getByText('Spotify logo'));
    expect(gridItem).toHaveStyle({ 'margin-top': '-10px' });
  });

  describe('user interactions', () => {
    it('clicks on company image', async () => {
      const { getByRole } = render(<CompaniesGrid data={initialData} />);
      const img = await waitFor(() => getByRole('img'));
      fireEvent.click(img);
      expect(img).toHaveAttribute('src', 'image-url');
    });

    it('changes input value', async () => {
      const { getByText, byValue } = render(<CompaniesGrid data={initialData} />);
      const inputField = await waitFor(() => getByText('Image URL'));
      fireEvent.change(inputField, { target: { value: 'new-image-url' } });
      expect(inputField).toHaveValue('new-image-url');
    });

    it('submits form', async () => {
      const { getByRole } = render(<CompaniesGrid data={initialData} />);
      const button = await waitFor(() => getByRole('button'));
      fireEvent.click(button);
      expect(button).toHaveAttribute('type', 'submit');
    });
  });
});