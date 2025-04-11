import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { i18n } from './i18n';

describe('I18n Test', () => {
  beforeEach(() => {
    global.fetchMockClear();
  });

  it('renders without crashing with no props', async () => {
    const { container } = render(<i18n />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders Toolpad and X links when i18n prop is truthy', async () => {
      global.fetchMockClear();
      const { container, getByText } = render(<i18n i18n={true} />);
      expect(getByText(/Toolpad/i)).toBeInTheDocument();
      expect(getByText(/X/i)).toBeInTheDocument();
    });

    it('does not render Toolpad and X links when i18n prop is falsy', async () => {
      global.fetchMockClear();
      const { container, queryByText } = render(<i18n i18n={false} />);
      expect(queryByText(/Toolpad/i)).not.toBeInTheDocument();
      expect(queryByText(/X/i)).not.toBeInTheDocument();
    });

    it('renders default message when i18n prop is undefined', async () => {
      global.fetchMockClear();
      const { container, getByText } = render(<i18n />);
      expect(getByText('No i18n provided')).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('throws an error when i18n prop is not a boolean', async () => {
      global.fetchMockClear();

      await expect(render(<i18n i18n={null} />)).rejects.toThrowError(
        'Invalid prop type for `i18n`'
      );
    });

    it('does not throw an error when i18n prop is a boolean', async () => {
      global.fetchMockClear();
      const { container } = render(<i18n i18n={true} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onChange callback on input change', async () => {
      global.fetchMockClear();

      const onChange = jest.fn();

      const { getByText, getByRole } = render(
        <i18n i18n={true} onChange={onChange} />
      );

      fireEvent.change(getByRole('textbox'), { target: 'new value' });

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onClick callback on button click', async () => {
      global.fetchMockClear();

      const onClick = jest.fn();

      const { getByText, getByRole } = render(
        <i18n i18n={true} onClick={onClick} />
      );

      fireEvent.click(getByText(/Click me/i));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit callback on form submission', async () => {
      global.fetchMockClear();

      const onSubmit = jest.fn();
      const { getByRole, getByText } = render(
        <i18n i18n={true} onSubmit={onSubmit} />
      );

      fireEvent.change(getByRole('textbox'), { target: 'new value' });
      fireEvent.submit(getByText(/Submit/i));

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Test', () => {
    it('matches the snapshot', async () => {
      global.fetchMockClear();

      const { asFragment } = render(<i18n />);
      await waitFor(() => {
        expect(asFragment()).toMatchSnapshot();
      });
    });
  });
});