import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import CoreProducts from './CoreProducts';

describe('CoreProducts', () => {
  let wrapper: any;

  beforeEach(() => {
    jest.resetAllMocks();
    wrapper = render(<CoreProducts />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders Section component when provided', () => {
      const sectionComponent = 'mock-section-component';
      render(<CoreProducts sectionComponent={sectionComponent} />);
      expect(screen.getByRole('region')).toHaveClass('cozy');
    });
    it('does not render Section component when not provided', () => {
      const props = {};
      render(<CoreProducts {...props} />);
      expect(screen.queryByRole('region')).toBeNull();
    });

    it('renders InfoCard components for each item in content array', () => {
      const sectionComponent = 'mock-section-component';
      render(<CoreProducts sectionComponent={sectionComponent} />);
      content.forEach((item) => {
        expect(screen.getByText(item.title)).toHaveAttribute('title', item.title);
        expect(screen.getByText(item.description)).toHaveAttribute('data-desc', item.description);
        expect(screen.getByRole('link')).toHaveAttribute('href', item.link);
      });
    });

  });

  describe('props validation', () => {
    it('throws an error when content prop is null or undefined', () => {
      const props = { sectionComponent: 'mock-section-component' };
      expect(() => render(<CoreProducts {...props} content={null} />)).toThrow();
      expect(() => render(<CoreProducts {...props} content={undefined} />)).toThrow();
    });
    it('does not throw an error when content prop is provided', () => {
      const props = { sectionComponent: 'mock-section-component' };
      render(<CoreProducts {...props} content={content} />);
      expect(() => render(<CoreProducts {...props} />)).not.toThrow();
    });

  });

  describe('user interactions', () => {
    it('renders link when clicked', async () => {
      const props = { sectionComponent: 'mock-section-component' };
      render(<CoreProducts {...props} />);
      const links = screen.getAllByRole('link');
      fireEvent.click(links[0]);
      expect(screen.getByText(content[0].title)).toHaveAttribute('aria-hidden', 'true');
    });
    it('renders description when clicked', async () => {
      const props = { sectionComponent: 'mock-section-component' };
      render(<CoreProducts {...props} />);
      const links = screen.getAllByRole('link');
      fireEvent.click(links[0]);
      expect(screen.getByText(content[0].description)).toHaveAttribute('aria-hidden', 'false');
    });
  });

});