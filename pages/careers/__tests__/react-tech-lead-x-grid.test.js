import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/react-tech-lead-x-grid.md?muiMarkdown';

describe('Page Component', () => {
  let { getByText } = render(<Page />);
  let mockData = [];

  beforeEach(() => {
    mockData = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Render and Props Validation', () => {
    it('should render without crashing', () => {
      expect(getByText('Top Layout Careers')).toBeInTheDocument();
    });

    describe('Props Validation', () => {
      it('should validate page props', () => {
        const validPageProps = { data: mockData };
        render(<Page {...validPageProps} />);
        expect(getByText(mockData)).toBeInTheDocument();
      });

      it('should not validate invalid page props', () => {
        const invalidPageProps = { data: null };
        render(<Page {...invalidPageProps} />);
        expect(() => getByText(null)).toBeInstanceOf(Error);
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should render top layout careers component when data is available', () => {
      const validPageProps = { data: mockData };
      render(<Page {...validPageProps} />);
      expect(getByText(mockData)).toBeInTheDocument();
    });

    it('should not render top layout careers component when data is empty', () => {
      const invalidPageProps = { data: [] };
      render(<Page {...invalidPageProps} />);
      expect(getByText([])).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should click on a career item and call the callback function', () => {
      const validPageProps = { data: mockData, onClick: jest.fn() };
      render(<Page {...validPageProps} />);
      const careerItem = getByText(mockData[0]);
      fireEvent.click(careerItem);
      expect(validPageProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('should input a search query and call the search function', () => {
      const validPageProps = { data: mockData, search: jest.fn() };
      render(<Page {...validPageProps} />);
      const searchInput = getByPlaceholderText('');
      fireEvent.change(searchInput, { target: { value: 'search' } });
      expect(validPageProps.search).toHaveBeenCalledTimes(1);
    });

    it('should submit the form and call the submit function', () => {
      const validPageProps = { data: mockData, onSubmit: jest.fn() };
      render(<Page {...validPageProps} />);
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(validPageProps.onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side Effects and State Changes', () => {
    it('should update the data array when a new item is added', async () => {
      const validPageProps = { data: mockData, addNewItem: jest.fn() };
      render(<Page {...validPageProps} />);
      await waitFor(() => expect(validPageProps.addNewItem).toHaveBeenCalledTimes(1));
    });

    it('should update the data array when an item is removed', async () => {
      const validPageProps = { data: mockData, removeItem: jest.fn() };
      render(<Page {...validPageProps} />);
      await waitFor(() => expect(validPageProps.removeItem).toHaveBeenCalledTimes(1));
    });
  });

  describe('Snapshot Tests', () => {
    it('should match the expected snapshot for valid page props', () => {
      const validPageProps = { data: mockData };
      render(<Page {...validPageProps} />);
      expect(getByText(mockData)).toMatchSnapshot();
    });
  });
});