import { render, fireEvent, waitFor } from '@testing-library/react';
import ErrorDecoder from './ErrorDecoder.test.js';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {
      code: 'code',
      args: ['arg1', 'arg2'],
    },
  }),
}));

const renderComponent = (props) => {
  const router = useRouter();
  const query = { code: props.code, args: props.args };
  return <ErrorDecoder {...query} {...props} />;
};

describe('ErrorDecoder component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = renderComponent({ code: 'code' });
    expect(container).toBeTruthy();
  });

  it('displays loading message when data state is loading', async () => {
    const { getByText } = render(renderComponent({ code: 'code', dataState: 'loading' }));
    await waitFor(() => getByText('Loading error codes'));
    expect(getByText('Loading error codes')).toBeInTheDocument();
  });

  it('displays rejected message when data state is rejected', async () => {
    const { getByText } = render(renderComponent({ code: 'code', dataState: 'rejected' }));
    await waitFor(() => getByText('Seems like we\'re having some issues loading the original message.'));
    expect(getByText('Seems like we\'re having some issues loading the original message.')).toBeInTheDocument();
  });

  it('displays error message when data state is resolved', async () => {
    const { getByText } = render(renderComponent({ code: 'code' }));
    await waitFor(() => getByText('When you encounter an error, you\'ll receive a link to this page for that specific error and we\'ll show you the full error text.'));
    expect(getByText('When you encounter an error, you\'ll receive a link to this page for that specific error and we\'ll show you the full error text.')).toBeInTheDocument();
  });

  it('renders markdown with correct rendering', async () => {
    const { getByText } = render(renderComponent({ code: 'code' }));
    await waitFor(() => getByText('[missing argument]'));
    expect(getByText('[missing argument]')).toHaveStyle({
      'font-style': 'italic',
    });
  });

  it('calls effect on mount', async () => {
    const fetchMock = jest.fn();
    fetch.mockImplementationOnce(() => Promise.resolve({ json: jest.fn() }));
    render(renderComponent({ code: 'code' }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/static/error-codes.json');
  });

  it('dispatches correct action when effect is called', async () => {
    const dispatchMock = jest.fn();
    fetch.mockImplementationOnce(() => Promise.resolve({ json: jest.fn() }));
    render(renderComponent({ code: 'code' }));
    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1));
    expect(dispatch).toHaveBeenCalledWith({ type: 'resolved', payload: { errorCodes: {}, state: '' } });
  });

  it('does not dispatch action when effect is called with cancelled prop', async () => {
    const fetchMock = jest.fn();
    fetch.mockImplementationOnce(() => Promise.resolve({ json: jest.fn() }));
    render(renderComponent({ code: 'code', cancelled: true }));
    await waitFor(() => expect(dispatch).not.toHaveBeenCalled());
  });

  it('renders correctly with valid props', async () => {
    const { getByText } = render(renderComponent({ code: 'code' }));
    expect(getByText('When you encounter an error, you\'ll receive a link to this page for that specific error and we\'ll show you the full error text.')).toBeInTheDocument();
  });

  it('does not render correctly with invalid props', async () => {
    const { getByText } = render(renderComponent({ code: 'code', dataState: 'invalid' }));
    expect(getByText('Invalid data state')).toBeInTheDocument();
  });
});