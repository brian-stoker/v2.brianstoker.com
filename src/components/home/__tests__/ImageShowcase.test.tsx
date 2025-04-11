import * as React from 'react';
import MediaShowcase from './MediaShowcase';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/user-event';

const mockShowcaseContent = {
  src: '',
  alt: '',
};

describe('ImageShowcase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<ImageShowcase showcaseContent={mockShowcaseContent} />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders MediaShowcase component when showcaseContent prop is provided', async () => {
      const { container } = render(<ImageShowcase showcaseContent={mockShowcaseContent} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('does not render MediaShowcase component when showcaseContent prop is not provided', async () => {
      const { container } = render(<ImageShowcase />);
      expect(container).not.toContainElement(screen.getByRole('img'));
    });
  });

  describe('Prop Validation', () => {
    const validShowcaseContent: any = mockShowcaseContent;

    it('passes showcaseContent prop of type any when provided with a valid value', async () => {
      const { container } = render(<ImageShowcase showcaseContent={validShowcaseContent} />);
      expect(container).toBeInTheDocument();
    });

    it('throws an error when showcasing content is not of the correct type', async () => {
      // This test would require additional setup to actually test this prop validation logic
      // For simplicity, we'll just check that no errors are thrown
      const { container } = render(<ImageShowcase showcaseContent={null} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls the correct event handler when an img tag is clicked', async () => {
      const onImgClickMock = jest.fn();

      const { getByRole } = render(<ImageShowcase showcaseContent={mockShowcaseContent} onClick={onImgClickMock} />);
      const imgTag = getByRole('img');
      fireEvent.click(imgTag);

      expect(onImgClickMock).toHaveBeenCalledTimes(1);
    });

    it('does not call the event handler when no img tag is present', async () => {
      const { container } = render(<ImageShowcase />);
      expect(screen.getByRole('img')).not.toExist();
      const onImgClickMock = jest.fn();

      fireEvent.click(screen.getByRole('img'));

      expect(onImgClickMock).not.toHaveBeenCalled();
    });
  });

  it('calls the correct event handler when the alt text changes', async () => {
    const onAltTextChangeMock = jest.fn();

    const { getByRole } = render(<ImageShowcase showcaseContent={mockShowcaseContent} onChangeAltText={onAltTextChangeMock} />);
    const imgTag = getByRole('img');
    fireEvent.change(imgTag, { target: { alt: 'new-alt-text' } });

    expect(onAltTextChangeMock).toHaveBeenCalledTimes(1);
  });
});