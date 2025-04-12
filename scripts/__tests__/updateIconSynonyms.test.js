import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { create } from 'vue-class-component';
import IconSynonyms from './IconSynonyms'; // Import the component being tested
import { fetch } from 'cross-fetch';
import fse from 'fs-extra';
import * as mui from '@mui/icons-material';

describe('Icon Synonyms', () => {
  let iconSynonyms;

  beforeEach(async () => {
    await create(iconSynonyms);
  });

  it('renders without crashing', async () => {
    const { container } = render(<IconSynonyms />);
    expect(container).toBeTruthy();
  });

  it('renders synonyms icons list', async () => {
    const { getByText } = render(<IconSynonyms />);
    expect(getByText('Material Design Icons')).toBeInTheDocument();
    expect(getByText('npm Package Icons')).toBeInTheDocument();
  });

  describe('prop validation', () => {
    it('should reject invalid props', async () => {
      iconSynonyms.props = 'invalid prop';
      await waitFor(() => expect(iconSynonyms).toMatchSnapshot());
    });

    it('should validate valid props', async () => {
      const props = { foo: 'bar' };
      iconSynonyms.props = props;
      await waitFor(() => expect(iconSynonyms).toMatchSnapshot());
    });
  });

  describe('user interactions', () => {
    let mockFetch;

    beforeEach(() => {
      mockFetch = jest.fn();
    });

    it('should update synonyms icons list when fetch data changes', async () => {
      iconSynonyms.props = { fetchData: 'new data' };
      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
      expect(iconSynonyms.synonymsList).toMatchSnapshot();
    });

    it('should not update synonyms icons list when props do not change', async () => {
      iconSynonyms.props = { foo: 'bar' };
      await waitFor(() => expect(mockFetch).not.toHaveBeenCalled());
      expect(iconSynonyms.synonymsList).toMatchSnapshot();
    });
  });

  describe('side effects and state changes', () => {
    it('should write synonyms icons to file when run function is called', async () => {
      const mockWriteFile = jest.fn();
      fse.writeFile = mockWriteFile;
      await waitFor(() => expect(mockWriteFile).toHaveBeenCalledTimes(1));
      expect(iconSynonyms.fileWritten).toBe(true);
    });
  });

  it('should create snapshot of component', async () => {
    const { asFragment } = render(<IconSynonyms />);
    expect(asFragment()).toMatchSnapshot();
  });
});