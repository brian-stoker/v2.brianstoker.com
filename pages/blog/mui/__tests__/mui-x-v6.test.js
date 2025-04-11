import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-v6.md?muiMarkdown';

describe('Page component', () => {
  let page: any;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      expect(page).not.toBeNull();
    });

    it('renders with docs prop', async () => {
      const docsProp = 'some-docs';
      render(<Page docs={docsProp} />);
      expect(page.getByPlaceholderText(docsProp)).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutBlog component', async () => {
      const { getByText } = render(<Page />);
      await waitFor(() => expect(getByText('Top Layout Blog')).toBeInTheDocument());
    });

    it('does not render TopLayoutBlog component with null docs prop', async () => {
      render(<Page docs={null} />);
      expect(page.queryByRole('region')).toBeNull();
    });
  });

  describe('Props Validation', () => {
    it('validates docs prop type', async () => {
      const invalidDocsProp = 'invalid-docs';
      { expectedError: jest.spyOn(React, 'isValidElement') }
        .mockImplementation((element) =>
          !Array.isArray(element) && typeof element === 'object'
        );
      render(<Page docs={invalidDocsProp} />);
      expect(page.getByPlaceholderText(invalidDocsProp)).toBeNull();
    });

    it('does not validate docs prop type with valid prop', async () => {
      const { getByText } = render(<Page docs={'some-docs'} />);
      await waitFor(() => expect(getByText('Top Layout Blog')).toBeInTheDocument());
    });
  });

  describe('User Interactions', () => {
    it('calls onDocSelect callback when clicked', async () => {
      const onDocSelectSpy = jest.fn();
      render(<Page onDocSelect={onDocSelectSpy} />);
      const buttonElement = page.getByRole('button');
      fireEvent.click(buttonElement);
      expect(onDocSelectSpy).toHaveBeenCalledTimes(1);
    });

    it('calls onDocSelect callback with correct doc props', async () => {
      const onDocSelectSpy = jest.fn();
      render(<Page onDocSelect={onDocSelectSpy} />);
      const buttonElement = page.getByRole('button');
      fireEvent.click(buttonElement);
      expect(onDocSelectSpy).toHaveBeenCalledTimes(1);
      expect(onDocSelectSpy).toHaveBeenCalledWith({ doc: 'some-docs' });
    });

    it('calls onChange callback when input changes', async () => {
      const onChangeSpy = jest.fn();
      render(<Page onChange={onChangeSpy} />);
      const inputElement = page.getByPlaceholderText('');
      fireEvent.change(inputElement, { target: { value: 'new-value' } });
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit callback when form submits', async () => {
      const onSubmitSpy = jest.fn();
      render(<Page onSubmit={onSubmitSpy} />);
      const formElement = page.getByRole('form');
      fireEvent.submit(formElement);
      expect(onSubmitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Test', () => {
    it('matches snapshot with expected rendering', async () => {
      await waitFor(() => {
        expect(page).toMatchSnapshot();
      });
    });
  });
});