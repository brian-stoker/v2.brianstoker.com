import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/react-engineer-x.md?muiMarkdown';

const mockProps = {
  ...pageProps,
  // any additional props you want to pass
};

jest.mock('src/modules/components/TopLayoutCareers', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe('Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutCareers {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  it('renders top layout careers component with valid props', async () => {
    const { getByText } = render(<TopLayoutCareers {...mockProps} />);
    await waitFor(() => expect(getByText(pageProps.title)).toBeInTheDocument());
  });

  it('renders top layout careers component with invalid props', async () => {
    const mockPropsInvalid = { ...pageProps, invalidProp: 'invalidValue' };
    const { container } = render(<TopLayoutCareers {...mockPropsInvalid} />);
    expect(container).toBeInTheDocument();
  });

  it('calls children function when child is passed', async () => {
    const mockChildren = jest.fn(() => {});
    const { rerender, getByText } = render(
      <TopLayoutCareers {...mockProps}>
        {mockChildren}
      </TopLayoutCareers>
    );
    await waitFor(() => expect(mockChildren).toHaveBeenCalledTimes(1));
  });

  it('handles user input changes', async () => {
    const { getByPlaceholderText } = render(<TopLayoutCareers {...mockProps} />);
    const inputField = getByPlaceholderText(pageProps.inputPlaceholder);
    fireEvent.change(inputField, { target: { value: 'newValue' } });
    await waitFor(() => expect(inputField.value).toBe('newValue'));
  });

  it('handles form submission', async () => {
    const { getByText, getByRole } = render(<TopLayoutCareers {...mockProps} />);
    const submitButton = getByText(pageProps.submitButtonText);
    fireEvent.click(submitButton);
    await waitFor(() => expect(getByRole('button')).toHaveAttribute('disabled'));
  });

  it('displays loading state when data is being fetched', async () => {
    jest.mocked(TopLayoutCareers, 'fetchData').mockResolvedValueOnce({ data: [] });
    const { getByText } = render(<TopLayoutCareers {...mockProps} />);
    await waitFor(() => expect(getByText(pageProps.loadingMessage)).toBeInTheDocument());
  });

  it('displays error message when data fetch fails', async () => {
    jest.mocked(TopLayoutCareers, 'fetchData').mockRejectedValueOnce(new Error('Mock error'));
    const { getByText } = render(<TopLayoutCareers {...mockProps} />);
    await waitFor(() => expect(getByText(pageProps.errorMessage)).toBeInTheDocument());
  });

  it('renders snapshot', async () => {
    jest.mocked(TopLayoutCareers, 'fetchData').mockResolvedValueOnce({ data: [] });
    const { asFragment } = render(<TopLayoutCareers {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});