import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import myDestRewriter from 'scripts/material-design-icons';
import synonyms from '../node_modules/@mui/icons-material/esm';

describe('updateIconSynonyms component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<myDestRewriter />);
    expect(container).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('valid props', async () => {
      await expect(
        myDestRewriter({ data: {} })
      ).resolves.not.toThrow();
    });

    it('invalid prop - missing data', async () => {
      await expect(
        myDestRewriter({})
      ).rejects.toThrowError();
    });
  });

  describe('conditional rendering', () => {
    it('renders material design icons', async () => {
      const { getByText } = render(<myDestRewriter />);
      await waitFor(() => getByText('Material Design'));
      expect(getByText('Material Design')).toBeInTheDocument();
    });

    it('renders npm package icons', async () => {
      const { getByText } = render(<myDestRewriter />);
      await waitFor(() => getByText('npm package icon'));
      expect(getByText('npm package icon')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('clicks on an icon triggers the rewriter', async () => {
      const { getByRole } = render(<myDestRewriter />);
      await waitFor(() => getByRole('button'));
      const button = getByRole('button');
      fireEvent.click(button);
      expect(myDestRewriter).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('writes to file on update', async () => {
      const { getByText } = render(<myDestRewriter />);
      await waitFor(() => getByText('Write File'));
      const button = getByText('Write File');
      fireEvent.click(button);
      await waitFor(() => expect(fse.writeFile).toHaveBeenCalledTimes(1));
    });
  });

  describe('mock external dependencies', () => {
    it('fetches data from Google Fonts', async () => {
      const fetchMock = jest.spyOn(fetch, 'default');
      await expect(myDestRewriter()).resolves.not.toThrow();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith('https://fonts.google.com/metadata/icons');
    });
  });

  describe('snapshot test', () => {
    it('renders with correct data', async () => {
      const { asFragment } = render(<myDestRewriter />);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });
});