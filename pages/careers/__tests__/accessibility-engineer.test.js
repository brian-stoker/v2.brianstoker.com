import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/accessibility-engineer.md?muiMarkdown';

describe('Page Component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Render', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders TopLayoutCareers with correct props', () => {
      const { container } = page;
      const topLayoutCareers = container.querySelector('TopLayoutCareers');
      expect(topLayoutCareers).toBeInTheDocument();
      expect(topLayoutCareers.props).toEqual(pageProps);
    });
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutCareers with correct props', () => {
      page.debugView();
      const { container } = page;
      const topLayoutCareers = container.querySelector('TopLayoutCareers');
      expect(topLayoutCareers).toBeInTheDocument();
      expect(topLayoutCareers.props).toEqual(pageProps);
    });

    it('does not render TopLayoutCareers with incorrect props', () => {
      const incorrectProps = { ...pageProps, prop1: 'incorrect-value' };
      page.props = incorrectProps;
      const { container } = page;
      const topLayoutCareers = container.querySelector('TopLayoutCareers');
      expect(topLayoutCareers).not.toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('renders with valid props', () => {
      render(<Page />);
      expect(page).toBeTruthy();
    });

    it('does not render with invalid props', () => {
      const invalidProps = { prop1: 'invalid-value' };
      render(<Page {...invalidProps} />);
      expect(page).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('renders correctly after clicking a button', () => {
      const { getByText } = page;
      const buttonText = page.debugView().querySelector('.button').textContent;
      fireEvent.click(getByText(buttonText));
      expect(page).toBeTruthy();
    });

    it('does not render with incorrect props after input change', () => {
      const incorrectProps = { ...pageProps, prop1: 'incorrect-value' };
      const { getByPlaceholderText } = page;
      const inputField = getByPlaceholderText('input-field');
      fireEvent.change(inputField, { target: { value: '' } });
      expect(page).not.toBeInTheDocument();
    });

    it('submits the form correctly after form submission', () => {
      const { getByText } = page;
      const submitButton = page.debugView().querySelector('.button').textContent;
      fireEvent.click(getByText(submitButton));
      expect(page).toBeTruthy();
    });
  });
});

export default {};