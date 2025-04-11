import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Page from './page-element';
import ApiPage from 'src/modules/components/ApiPage';
import mapApiPageTranslations from 'src/modules/utils/mapApiPageTranslations';
import jsonPageContent from './file-element.json';

jest.mock('src/modules/components/ApiPage');

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  describe('props validation', () => {
    it('should pass with valid props', () => {
      const props = {
        descriptions: [],
        pageContent: jsonPageContent,
      };
      const { container } = render(<Page {...props} />);
      expect(ApiPage mocks).toHaveBeenCalledTimes(1);
    });

    it('should not pass with invalid props', () => {
      const invalidProps = {};
      const { container, error } = render(<Page {...invalidProps} />);
      expect(error).not.toBeNull();
    });
  });

  describe('conditional rendering', () => {
    it('renders ApiPage with descriptions', () => {
      const props = {
        descriptions: ['description1'],
        pageContent: jsonPageContent,
      };
      const { container } = render(<Page {...props} />);
      expect(ApiPage mocks).toHaveBeenCalledTimes(1);
    });

    it('renders ApiPage without descriptions', () => {
      const props = {
        pageContent: jsonPageContent,
      };
      const { container } = render(<Page {...props} />);
      expect(ApiPage mocks).toHaveBeenCalledTimes(0);
    });
  });

  describe('user interactions', () => {
    it('should trigger click event on ApiPage', () => {
      const props = {
        descriptions: ['description1'],
        pageContent: jsonPageContent,
      };
      const { getByText, getByRole } = render(<Page {...props} />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(ApiPage mocks).toHaveBeenCalledTimes(1);
    });

    it('should trigger input change event on ApiPage', () => {
      const props = {
        descriptions: ['description1'],
        pageContent: jsonPageContent,
      };
      const { getByText, getByRole } = render(<Page {...props} />);
      const input = getByRole('textbox');
      fireEvent.change(input, { target: 'new value' });
      expect(ApiPage mocks).toHaveBeenCalledTimes(1);
    });

    it('should trigger form submission event on ApiPage', () => {
      const props = {
        descriptions: ['description1'],
        pageContent: jsonPageContent,
      };
      const { getByText, getByRole } = render(<Page {...props} />);
      const form = getByRole('form');
      fireEvent.change(form, { target: 'new value' });
      expect(ApiPage mocks).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('should call mapApiPageTranslations function', () => {
      ApiPage.mockImplementationOnce(() => ({ descriptions: [] }));
      const props = {
        descriptions: ['description1'],
        pageContent: jsonPageContent,
      };
      const { container } = render(<Page {...props} />);
      expect(mapApiPageTranslations).toHaveBeenCalledTimes(1);
    });
  });

  it('should snapshot match', () => {
    const props = {
      descriptions: ['description1'],
      pageContent: jsonPageContent,
    };
    const { asFragment } = render(<Page {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });
});