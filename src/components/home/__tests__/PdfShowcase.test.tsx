import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MediaShowcase from './MediaShowcase';
import { PdfDoc } from '../../../pages/resume-new';

jest.mock('pdfjs-dist', () => {
  return {
    // Mocked values for testing purposes
    PdfDoc: () => ({ pdfWidth: 545 }),
  };
});

describe('PdfShowcase component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MediaShowcase />);
    expect(container).toBeInTheDocument();
  });

  describe('with showcase content', () => {
    it('renders the correct number of pages', async () => {
      const { getAllByRole } = render(<MediaShowcase showcaseContent={<PdfDoc pdfWidth={545} />} />);
      const pageElements = await getAllByRole('page');
      expect(pageElements).toHaveLength(2);
    });

    it('renders with correct page margins and border radius', async () => {
      const { getByText, getAllByRole } = render(<MediaShowcase showcaseContent={<PdfDoc pdfWidth={545} />} />);
      const pageElements = await getAllByRole('page');
      expect(pageElements[0].style.borderRadius).toBe('8px');
    });
  });

  describe('with invalid props', () => {
    it('throws an error when showcaseContent is missing', async () => {
      await expect(
        render(<MediaShowcase showcaseContent={undefined} />)
      ).rejects.toThrowError();
    });

    it('throws an error when showcaseContent is not an object', async () => {
      await expect(
        render(<MediaShowcase showcaseContent={null} />)
      ).rejects.toThrowError();
    });
  });

  describe('user interactions', () => {
    it('triggers page navigation on click', async () => {
      const { getByRole } = render(<MediaShowcase showcaseContent={<PdfDoc pdfWidth={545} />} />);
      const pageButton = await getByRole('button');
      fireEvent.click(pageButton);
      expect(getByText('Page 2')).toBeInTheDocument();
    });

    it('triggers previous page navigation on click', async () => {
      const { getByRole } = render(<MediaShowcase showcaseContent={<PdfDoc pdfWidth={545} />} />);
      const prevPageButton = await getByRole('button', { name: 'Previous' });
      fireEvent.click(prevPageButton);
      expect(getByText('Page 1')).toBeInTheDocument();
    });

    it('triggers next page navigation on click', async () => {
      const { getByRole } = render(<MediaShowcase showcaseContent={<PdfDoc pdfWidth={545} />} />);
      const nextPageButton = await getByRole('button', { name: 'Next' });
      fireEvent.click(nextPageButton);
      expect(getByText('Page 3')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('renders the correct content when showcaseContent is not provided', async () => {
      const { container } = render(<MediaShowcase />);
      expect(container).toMatchSnapshot();
    });

    it('renders nothing when showcaseContent is an empty string', async () => {
      const { queryByRole } = render(<MediaShowcase showcaseContent="" />);
      expect(queryByRole('page')).toBeNull();
    });
  });
});