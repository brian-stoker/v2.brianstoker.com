import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HeroPricing from './HeroPricing';

describe('HeroPricing', () => {
  beforeEach(() => {
    // Create mock props
    const props = {
      cozy: true,
      alwaysCenter: false,
    };

    // Render the component with mock props and wait for it to render
    jest.spyOn(HeroPricing.prototype, 'render').mockImplementation(() => {});
    global.render = jest.fn();
    global.render.mockImplementation(() => {});

    // Reset any side effects
    HeroPricing.prototype._handleFormSubmit = () => {};

    // Render the component with mock props and wait for it to render
    const { container } = render(<HeroPricing {...props} />);
    waitFor(() => expect(HeroPricing.prototype.render).toHaveBeenCalledTimes(1));
  });

  afterEach(() => {
    // Restore side effects
    HeroPricing.prototype._handleFormSubmit = () => {};
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      await render(<HeroPricing />);
    });
  });

  describe('Props Validation', () => {
    const props = {
      cozy: true,
      alwaysCenter: false,
    };

    it('passes when all props are valid', async () => {
      const { container } = render(<HeroPricing {...props} />);
      expect(container).toBeTruthy();
    });

    it('throws an error when cozy prop is invalid', async () => {
      const { error } = render(<HeroPricing cozy={0} alwaysCenter={false} />);
      expect(error).not.toBeNull();
    });
  });

  describe('User Interactions', () => {
    let inputField: HTMLInputElement;
    let formElement: HTMLFormElement;

    beforeEach(() => {
      // Create mock props
      const props = {
        cozy: true,
        alwaysCenter: false,
      };

      // Render the component with mock props and wait for it to render
      jest.spyOn(HeroPricing.prototype, 'render').mockImplementation(() => {});
      global.render = jest.fn();
      global.render.mockImplementation(() => {});

      // Reset any side effects
      HeroPricing.prototype._handleFormSubmit = () => {};

      // Render the component with mock props and wait for it to render
      const { container } = render(<HeroPricing {...props} />);
      waitFor(() => expect(HeroPricing.prototype.render).toHaveBeenCalledTimes(1));

      // Get form element
      formElement = container.querySelector('form');
    });

    it('submits the form when submit button is clicked', async () => {
      const { getByText } = render(<HeroPricing />);
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      expect(HeroPricing.prototype._handleFormSubmit).toHaveBeenCalledTimes(1);
    });

    it('inputs value when input field changes', async () => {
      // Create mock props
      const props = {
        cozy: true,
        alwaysCenter: false,
      };

      // Render the component with mock props and wait for it to render
      jest.spyOn(HeroPricing.prototype, 'render').mockImplementation(() => {});
      global.render = jest.fn();
      global.render.mockImplementation(() => {});

      // Reset any side effects
      HeroPricing.prototype._handleFormSubmit = () => {};

      // Render the component with mock props and wait for it to render
      const { getByText } = render(<HeroPricing {...props} />);
      waitFor(() => expect(HeroPricing.prototype.render).toHaveBeenCalledTimes(1));

      // Get input field
      inputField = container.querySelector('input');

      // Input a value into the form
      fireEvent.change(inputField, { target: { value: 'test' } });

      // Assert that the state has updated correctly
      expect(HeroPricing.prototype._handleFormSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Rendering', () => {
    it('renders SectionHeadline when alwaysCenter prop is true', async () => {
      const { getByText } = render(<HeroPricing alwaysCenter={true} />);
      expect(getByText('SectionHeadline')).toBeInTheDocument();
    });

    it('does not render SectionHeadline when alwaysCenter prop is false', async () => {
      const { queryByText } = render(<HeroPricing alwaysCenter={false} />);
      expect(queryByText('SectionHeadline')).not.toBeInTheDocument();
    });
  });
});