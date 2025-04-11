import { render, fireEvent, waitFor } from '@testing-library/react';
import AdDisplay from './AdDisplay.test.js';

describe('AdDisplay Component', () => {
  beforeEach(() => {
    global.gtag = jest.fn();
  });

  afterEach(() => {
    global.gtag.mockClear();
  });

  describe('Rendering Props', () => {
    it('renders with default shape and className', () => {
      const { container } = render(<AdDisplay ad={{ label: 'test' }} className='test-class' />);
      expect(container).toMatchSnapshot();
    });

    it('renders with inline shape and className', () => {
      const { container } = render(<AdDisplay ad={{ label: 'test', shape: 'inline' }} className='test-class' />);
      expect(container).toMatchSnapshot();
    });

    it('renders with auto shape and className', () => {
      const { container } = render(<AdDisplay ad={{ label: 'test', shape: 'auto' }} className='test-class' />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Prop Validation', () => {
    it('throws error for invalid ad object', () => {
      expect(() => <AdDisplay ad={null} />).toThrowError(PropTypes.isRequired);
    });

    it('renders with valid ad object and className', () => {
      const { container } = render(<AdDisplay ad={{ label: 'test' }} className='test-class' />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('User Interactions', () => {
    it('clicks on link', async () => {
      global.gtag.mockImplementation(() => jest.fn());
      const { getByText } = render(<AdDisplay ad={{ label: 'test', link: 'https://example.com' }} />);
      const linkElement = getByText('test');
      fireEvent.click(linkElement);
      await waitFor(() => expect(global.gtag).toHaveBeenCalledTimes(1));
    });

    it('input changes with description', async () => {
      global.gtag.mockImplementation(() => jest.fn());
      const { getByPlaceholderText } = render(<AdDisplay ad={{ label: 'test', description: 'test' }} />);
      const inputElement = getByPlaceholderText('');
      fireEvent.change(inputElement, { target: { value: 'new-test' } });
      await waitFor(() => expect(global.gtag).toHaveBeenCalledTimes(1));
    });

    it('form submission with link and description', async () => {
      global.gtag.mockImplementation(() => jest.fn());
      const { getByPlaceholderText } = render(<AdDisplay ad={{ label: 'test', link: 'https://example.com', description: 'test' }} />);
      const inputElement = getByPlaceholderText('');
      fireEvent.change(inputElement, { target: { value: 'new-test' } });
      const formElement = document.querySelector('form');
      fireEvent.submit(formElement);
      await waitFor(() => expect(global.gtag).toHaveBeenCalledTimes(1));
    });
  });

  describe('Side Effects', () => {
    it('calls gtag with event when ad label is present', async () => {
      global.gtag.mockImplementation(() => jest.fn());
      const { getByText } = render(<AdDisplay ad={{ label: 'test' }} />);
      expect(global.gtag).toHaveBeenCalledTimes(1);
      expect(global.gtag).toHaveBeenCalledWith('event', 'ad', { eventAction: 'display', eventLabel: 'test' });
    });

    it('does not call gtag when ad label is absent', async () => {
      global.gtag.mockImplementation(() => jest.fn());
      const { getByText } = render(<AdDisplay ad={{ link: 'https://example.com' }} />);
      expect(global.gtag).toHaveBeenCalledTimes(0);
    });
  });

  describe('Conditional Rendering', () => {
    it('renders a with img and description when shape is inline', () => {
      const { container } = render(<AdDisplay ad={{ label: 'test', shape: 'inline' }} />);
      expect(container.querySelector('.AdDisplay-imageWrapper img')).toBeInTheDocument();
      expect(container.querySelector('.AdDisplay-description')).toBeInTheDocument();
    });

    it('renders a with img and description when shape is auto', () => {
      const { container } = render(<AdDisplay ad={{ label: 'test', shape: 'auto' }} />);
      expect(container.querySelector('.AdDisplay-imageWrapper img')).toBeInTheDocument();
      expect(container.querySelector('.AdDisplay-description')).toBeInTheDocument();
    });

    it('does not render a with description when shape is null', () => {
      const { container } = render(<AdDisplay ad={{ label: 'test', shape: null }} />);
      expect(container.querySelector('.AdDisplay-description')).not.toBeInTheDocument();
    });
  });
});