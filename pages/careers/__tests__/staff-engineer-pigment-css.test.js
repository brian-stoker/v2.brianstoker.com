import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/staff-engineer-pigment-css.md?muiMarkdown';

describe('Staff Engineer Pigment CSS Page', () => {
  let renderComponent;

  beforeEach(() => {
    renderComponent = jest.fn((props) => render(<TopLayoutCareers {...props} />));
  });

  afterEach(() => {
    renderComponent.mockClear();
  });

  it('renders without crashing', async () => {
    const props = pageProps;
    await renderComponent(props);
    expect(renderComponent).toHaveBeenCalledTimes(1);
  });

  describe('conditional rendering', () => {
    it('renders when no params are passed', async () => {
      const props = {};
      const { container } = renderComponent(props);
      expect(container).toMatchSnapshot();
    });

    it('renders with pageProps', async () => {
      const props = pageProps;
      await renderComponent(props);
      expect(renderComponent).toHaveBeenCalledTimes(1);
    });
  });

  describe('prop validation', () => {
    let errorElement;

    beforeEach(() => {
      renderComponent.mockClear();
    });

    it('throws an error when invalid prop is passed', async () => {
      const props = { invalidProp: 'value' };
      try {
        await renderComponent(props);
        expect(false).toBe(true);
      } catch (error) {
        errorElement = renderComponent.mock.calls[0][1];
        expect(errorElement.type).toBe('div');
        expect(errorElement.textContent).toBe('Invalid prop passed');
      }
    });

    it('does not throw an error when valid props are passed', async () => {
      const props = pageProps;
      await renderComponent(props);
      expect(renderComponent).toHaveBeenCalledTimes(1);
      expect(errorElement).toBeNull();
    });
  });

  describe('user interactions', () => {
    let inputField;

    beforeEach(() => {
      renderComponent.mockClear();
    });

    it('calls onSearchClick when search button is clicked', async () => {
      const props = pageProps;
      const { getByText, byPlaceholderText } = renderComponent(props);
      const searchButton = getByText('Search');
      fireEvent.click(searchButton);
      expect(props.onSearchClick).toHaveBeenCalledTimes(1);
    });

    it('calls onFilterClick when filter button is clicked', async () => {
      const props = pageProps;
      const { getByText, byPlaceholderText } = renderComponent(props);
      const filterButton = getByText('Filter');
      fireEvent.click(filterButton);
      expect(props.onFilterClick).toHaveBeenCalledTimes(1);
    });

    it('calls onInputChange when input field changes', async () => {
      const props = pageProps;
      inputField = byPlaceholderText('Search term');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(props.onInputChange).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmitForm when form is submitted', async () => {
      const props = pageProps;
      const { getByLabelText, getByText } = renderComponent(props);
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      expect(props.onSubmitForm).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    let dataElement;

    beforeEach(() => {
      renderComponent.mockClear();
    });

    it('renders data when API call is successful', async () => {
      const props = { pageProps: { data: [] } };
      await waitFor(() => expect(props.onDataReceived).toHaveBeenCalledTimes(1));
    });
  });

  // Snapshot test
  it('renders correctly when rendered for the first time', () => {
    const props = pageProps;
    renderComponent(props);
    expect(renderComponent).toMatchSnapshot();
  });
});