import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/staff-engineer-pigment-css.md?muiMarkdown';

describe('Page component', () => {
  const initialProps = { ...pageProps };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<TopLayoutCareers {...initialProps} />);
    });

    it('renders with props', async () => {
      const { getByText } = render(
        <TopLayoutCareers {...{ ...initialProps, title: 'Test Title' }} />
      );
      expect(getByText(initialProps.title)).toBeInTheDocument();
    });
  });

  describe('Conditional rendering', () => {
    it('renders top layout section', async () => {
      const { getByText } = render(<TopLayoutCareers {...initialProps} />);
      expect(getByText('Top Layout Section')).toBeInTheDocument();
    });

    it('does not render top layout section', async () => {
      jest.spyOn(initialProps, 'includesTopLayoutSection').mockReturnValue(false);
      const { queryByText } = render(
        <TopLayoutCareers {...{ ...initialProps, includesTopLayoutSection: false }} />
      );
      expect(queryByText('Top Layout Section')).not.toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('valid props', async () => {
      const { getByText } = render(<TopLayoutCareers {...initialProps} />);
      expect(getByText(initialProps.title)).toBeInTheDocument();
    });

    it('invalid prop: invalid type', async () => {
      jest.spyOn(initialProps, 'includesTopLayoutSection').mockImplementation(() =>
        undefined
      );
      const { queryByText } = render(
        <TopLayoutCareers {...{ ...initialProps, includesTopLayoutSection: null }} />
      );
      expect(queryByText('Top Layout Section')).not.toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('clicks on link', async () => {
      const { getByText } = render(<TopLayoutCareers {...initialProps} />);
      const link = getByText(initialProps.title);
      fireEvent.click(link);
      expect(link).toHaveClass('active');
    });

    it('changes input field value', async () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <TopLayoutCareers {...{ ...initialProps, placeholder: 'Test Placeholder' }} />
      );
      const inputField = getByPlaceholderText(initialProps.placeholder);
      fireEvent.change(inputField, { target: { value: 'New Value' } });
      expect(inputField.value).toBe('New Value');
    });

    it('submits form', async () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <TopLayoutCareers {...{ ...initialProps, placeholder: 'Test Placeholder' }} />
      );
      const inputField = getByPlaceholderText(initialProps.placeholder);
      const submitButton = getByLabelText('Submit');
      fireEvent.change(inputField, { target: { value: 'New Value' } });
      fireEvent.click(submitButton);
      expect(inputField.value).toBe('New Value');
    });
  });

  describe('Side effects', () => {
    it('calls callback function on user interaction', async () => {
      const callback = jest.fn();
      const { getByText, getByLabelText } = render(
        <TopLayoutCareers {...{ ...initialProps, placeholder: 'Test Placeholder', onUserInteraction: callback }} />
      );
      const inputField = getByPlaceholderText(initialProps.placeholder);
      fireEvent.change(inputField, { target: { value: 'New Value' } });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshots', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<TopLayoutCareers {...initialProps} />);
      await waitFor(() => {
        expect(asFragment()).toMatchSnapshot();
      });
    });
  });
});