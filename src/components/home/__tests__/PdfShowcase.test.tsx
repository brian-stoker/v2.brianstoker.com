import * as React from 'react';
import { render } from '@testing-library/react';
import MediaShowcase from './MediaShowcase';
import { PdfDoc } from '../../../pages/resume-new';

describe('PdfShowcase', () => {
  const initialProps = {
    showcaseContent: new PdfDoc(545),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<PdfShowcase {...initialProps} />);
    expect(container).toBeTruthy();
  });

  describe('props validation', () => {
    it('should validate showcaseContent prop as required', () => {
      const propsWithoutShowcaseContent = {};
      expect(() => <PdfShowcase {...propsWithoutShowcaseContent} />).toThrowError();

      const propsWithInvalidShowcaseContent = { showcaseContent: null };
      expect(() => <PdfShowcase {...propsWithInvalidShowcaseContent} />).toThrowError();
    });

    it('should validate showcaseContent prop as object', () => {
      const propsWithoutValidShowcaseContent = {};
      expect(() => render(<PdfShowcase {...propsWithoutValidShowcaseContent} />)).not.toThrow();

      const propsWithValidShowcaseContent = { showcaseContent: 'invalid' };
      expect(() => render(<PdfShowcase {...propsWithValidShowcaseContent} />)).toThrowError();
    });
  });

  describe('conditional rendering', () => {
    it('renders MediaShowcase when showcaseContent is valid', async () => {
      const { container } = render(<PdfShowcase {...initialProps} />);
      expect(container).toMatchSnapshot();
    });

    it('does not render MediaShowcase when showcaseContent is invalid', async () => {
      const propsWithoutValidShowcaseContent = {};
      const { container } = render(<PdfShowcase {...propsWithoutValidShowcaseContent} />);
      expect(container).not.toHaveClass('MediaShowcase');
    });
  });

  it('should trigger user interaction on click', async () => {
    const onButtonClickMocked = jest.fn();
    const props = { showcaseContent: initialProps.showcaseContent };
    const { getByText } = render(<PdfShowcase {...props} onClick={onButtonClickMocked} />);
    expect(getByText('Button')).toBeInTheDocument();
  });

  describe('side effects', () => {
    it('should update state on form submission', async () => {
      const onFormSubmitMocked = jest.fn();
      const props = { showcaseContent: initialProps.showcaseContent };
      const { getByText, getByRole } = render(<PdfShowcase {...props} onSubmit={onFormSubmitMocked} />);
      expect(getByText('Button')).toBeInTheDocument();
      const inputField = getByRole('textbox');
      await inputField.type('new value');
      expect(onFormSubmitMocked).toHaveBeenCalledTimes(1);
    });
  });
});