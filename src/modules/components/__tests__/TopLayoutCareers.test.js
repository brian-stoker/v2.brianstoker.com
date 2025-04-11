import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutCareers from './TopLayoutCareers.test.js';

describe('Top Layout Careers', () => {
  const mockDocs = {
    en: {
      description: '',
      rendered: [],
    },
  };

  it('renders without crashing', async () => {
    render(<TopLayoutCareers docs={mockDocs} />);
    expect(screen).not.toThrowError();
  });

  describe('Conditional Rendering', () => {
    it('renders title and description', () => {
      render(<TopLayoutCareers docs={mockDocs} />);
      expect(screen.getByTitle('SUI')).toBeInTheDocument();
      expect(screen.getByRole('description')).toBeInTheDocument();
    });

    it('does not render noindex meta tag when disabled', () => {
      const mockDocs = { ...mockDocs, en: { description: '', rendered: [] } };
      mockDocs.en.description = 'Description with noindex meta tag';
      mockDocs.en.rendered = [{ noindexMetaTag: true }];
      render(<TopLayoutCareers docs={mockDocs} />);
      expect(screen.queryByRole('description')).not.toBeInTheDocument();
    });

    it('renders markdown elements', () => {
      const mockDocs = { ...mockDocs, en: { description: '', rendered: ['chunk1', 'chunk2'] } };
      render(<TopLayoutCareers docs={mockDocs} />);
      expect(screen.queryAllByRole('markdown')).toHaveLength(2);
    });
  });

  describe('Props Validation', () => {
    it('throws error when docs prop is not an object', () => {
      const mockDocs = 'not an object';
      expect(() => render(<TopLayoutCareers docs={mockDocs} />)).toThrowError();
    });

    it('throws error when docs prop does not have en property', () => {
      const mockDocs = { foo: 'bar' };
      expect(() => render(<TopLayoutCareers docs={mockDocs} />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('calls onBackToOpenRoles when clicked', async () => {
      const mockDocs = { ...mockDocs, en: { description: '', rendered: [] } };
      render(<TopLayoutCareers docs={mockDocs} />);
      const link = screen.getByRole('link');
      fireEvent.click(link);
      expect(mockDocs.en.rendered).not.toHaveBeenCalled();
    });

    it('calls onRendered when markdown elements are clicked', async () => {
      const mockDocs = { ...mockDocs, en: { description: '', rendered: ['chunk1', 'chunk2'] } };
      render(<TopLayoutCareers docs={mockDocs} />);
      const link = screen.getByRole('link');
      fireEvent.click(link);
      expect(mockDocs.en.rendered[0].onClick).toHaveBeenCalledTimes(1);
    });
  });

  it('renders AppFooter after divider', async () => {
    render(<TopLayoutCareers docs={mockDocs} />);
    const footer = screen.getByText('AppFooter');
    expect(footer).toBeInTheDocument();
  });
});

const mockHead = jest.fn();

describe('Mock Head', () => {
  beforeAll(() => {
    global.head = mockHead;
  });

  afterAll(() => {
    delete global.head;
  });
});