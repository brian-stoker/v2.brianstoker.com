import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HomeView from './index';
import PdfDoc from './PdfDoc';
import PdfDocView from './PdfDocView';
import useWindowWidth from '../hooks/useWindowSize';

jest.mock('../hooks/useWindowSize');

describe('HomeView', () => {
  const HomeMain = jest.fn();

  beforeEach(() => {
    global.fetch = jest.fn();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<HomeView HomeMain={PdfDocView} />);
    expect(container).toBeTruthy();
  });

  describe('PdfDocView props', () => {
    it('sets pdfMinWidth to default value if not provided', () => {
      const { getByText } = render(<HomeView HomeMain={PdfDocView}/>);
      expect(getByText('900')).toBeInTheDocument();
    });

    it('sets pdfMinWidth to invalid value if not provided', () => {
      const { getByText } = render(<HomeView HomeMain={PdfDocView} pdfMinWidth={-1}/>);
      expect(getByText('-1')).toBeInTheDocument();
    });

    it('sets pdfMinWidth to valid value when provided', () => {
      const { getByText } = render(<HomeView HomeMain={PdfDocView} pdfMinWidth={1500}/>);
      expect(getByText('1500')).toBeInTheDocument();
    });
  });

  describe('PdfDocView state changes', () => {
    it('sets windowWidth and iconWidth to default values when component mounts', async () => {
      const { getByText } = render(<HomeView HomeMain={PdfDocView}/>);
      expect(getByText('900')).toBeInTheDocument();
      expect(useWindowWidth).toHaveBeenCalledTimes(1);
      expect(useWindowWidth).toHaveBeenCalledWith(expect.any(Number));
    });

    it('sets windowWidth and iconWidth to correct values when window size changes', async () => {
      const mockWindowSize = jest.fn((width: number) => width);
      useWindowWidth.mockImplementation(mockWindowSize);

      const { getByText } = render(<HomeView HomeMain={PdfDocView}/>);
      expect(getByText('900')).toBeInTheDocument();
      await waitFor(() => expect(mockWindowSize).toHaveBeenCalledTimes(1));
      expect(mockWindowSize).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('PdfDocView user interactions', () => {
    it('opens download link for pdf document', async () => {
      const { getByText } = render(<HomeView HomeMain={PdfDocView}/>);
      const downloadLink = getByText('download pdf');
      fireEvent.click(downloadLink);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/static/resume/brian-stoker-resume.pdf', {
        method: 'GET',
        headers: { 'Content-Type': 'application/pdf' },
      });
    });

    it('opens download link for word document', async () => {
      const { getByText } = render(<HomeView HomeMain={PdfDocView}/>);
      const downloadLink = getByText('download word doc');
      fireEvent.click(downloadLink);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/static/resume/brian-stoker-resume.docx', {
        method: 'GET',
        headers: { 'Content-Type': 'application/pdf' },
      });
    });

    it('sets page number to 1 when loaded correctly', async () => {
      const { getByText } = render(<HomeView HomeMain={PdfDocView}/>);
      expect(getByText('Page 1')).toBeInTheDocument();
    });

    it('renders correct width for pdf document', async () => {
      const { getByText } = render(<HomeView HomeMain={PdfDocView} />);
      expect(getByText('900')).toBeInTheDocument();
    });
  });

  describe('PdfDoc component', () => {
    it('renders without crashing', async () => {
      const { container } = render(<PdfDoc pdfWidth={1000}/>);
      expect(container).toBeTruthy();
    });

    it('renders correct aspect ratio for pdf document', async () => {
      const { getByText } = render(<PdfDoc pdfWidth={1000} />);
      expect(getByText('aspect ratio')).toBeInTheDocument();
    });
  });
});