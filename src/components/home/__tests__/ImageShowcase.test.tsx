import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MediaShowcase from './MediaShowcase';

describe('ImageShowcase', () => {
  let imageShowcase;

  beforeEach(() => {
    imageShowcase = render(<ImageShowcase showcaseContent={<img src={'test-image.jpg'} alt='' width={545} style={{borderRadius: '12px'}} />} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      expect(imageShowcase).toBeTruthy();
    });

    it('should render img with correct alt and width attributes', () => {
      const imgElement = imageShowcase.getByRole('img');
      expect(imgElement).toHaveAttribute('alt', '');
      expect(imgElement).toHaveAttribute('width', '545');
    });

    describe('conditional rendering paths', () => {
      it('should render MediaShowcase correctly', () => {
        expect(imageShowcase).toContainHTML('<MediaShowcase />');
      });
    });
  });

  describe('Prop validation', () => {
    it('should validate showcaseContent prop to be an object with img element', () => {
      const imageShowcase = render(<ImageShowcase showcaseContent={{}} />);
      expect(imageShowcase).not.toContainHTML('<img src="test-image.jpg" alt="" width="545" style="border-radius: 12px"/>');
    });

    it('should validate showcaseContent prop to be an object with img element', () => {
      const imageShowcase = render(<ImageShowcase showcaseContent={null} />);
      expect(imageShowcase).not.toContainHTML('<img src="test-image.jpg" alt="" width="545" style="border-radius: 12px"/>');
    });
  });

  describe('User interactions', () => {
    it('should handle img click', async () => {
      const imgElement = imageShowcase.getByRole('img');
      fireEvent.click(imgElement);
      expect(imageShowcase).toContainHTML('<img src="test-image.jpg" alt="" width="545" style="border-radius: 12px"/>');
    });

    it('should handle input change', async () => {
      const imgElement = imageShowcase.getByRole('img');
      fireEvent.change(imgElement, { target: { value: 'new-value' } });
      expect(imageShowcase).toContainHTML('<img src="test-image.jpg" alt="" width="545" style="border-radius: 12px"/>');
    });

    it('should handle form submission', async () => {
      const imgElement = imageShowcase.getByRole('img');
      fireEvent.change(imgElement, { target: { value: 'new-value' } });
      await waitFor(() => fireEvent.submit(imageShowcase.getByRole('form')));
      expect(imageShowcase).toContainHTML('<img src="test-image.jpg" alt="" width="545" style="border-radius: 12px"/>');
    });
  });

  describe('Snapshot test', () => {
    it('should render correctly', () => {
      const imageShowcase = render(<ImageShowcase showcaseContent={<img src={'test-image.jpg'} alt='' width={545} style={{borderRadius: '12px'}} />} />);
      expect(imageShowcase).toMatchSnapshot();
    });
  });
});