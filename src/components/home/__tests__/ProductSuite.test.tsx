import React from 'react';
import { render } from '@testing-library/react';
import UserForm from './UserForm';

jest.mock('url', () => ({
  pathname: '/',
}));

describe('UserForm component', () => {
  const initialValues = {
    name: '',
    email: '',
  };

  let userForm;

  beforeEach(() => {
    userForm = render(<UserForm {...initialValues} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(userForm).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders form when prop is true', () => {
      const { getByText } = render(<UserForm true />);
      expect(getByText('Name')).toBeInTheDocument();
    });

    it('does not render form when prop is false', () => {
      const { queryByText } = render(<UserForm false />);
      expect(queryByText('Name')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    let invalidValues;

    beforeEach(() => {
      invalidValues = {
        name: null,
        email: '',
      };
    });

    it('throws error when prop is invalid', () => {
      expect(() => render(<UserForm {...invalidValues} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    const handleChangeMock = jest.fn();

    beforeEach(() => {
      userForm = render(<UserForm {...initialValues} onChange={handleChangeMock} />);
    });

    it('calls onChange when input changes', () => {
      const { getByPlaceholderText } = render(<UserForm {...initialValues} onChange={handleChangeMock} />);
      const inputField = getByPlaceholderText('Name');
      inputField.value = 'John Doe';
      expect(handleChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls submit when form is submitted', async () => {
      const { getByText, getByRole } = render(<UserForm {...initialValues} onSubmit={jest.fn()} />);
      const submitButton = getByText('Submit');
      await getByRole('button', { name: 'Submit' }).click();
      expect(getByText('Thank you for submitting!')).toBeInTheDocument();
    });
  });

  it('side effects occur correctly', async () => {
    const fetchMock = jest.fn(() => Promise.resolve({ status: 200 }));

    beforeEach(() => {
      userForm = render(<UserForm {...initialValues} />, { context: { fetch: fetchMock } });
    });

    it('fetches data when URL changes', async () => {
      await fetchMock.mockImplementation(() => Promise.resolve({ status: 200 }));
      const urlField = getByPlaceholderText('URL');
      urlField.value = 'https://example.com';
      await urlField.click();
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('snapshot', () => {
    expect(userForm.asFragment()).toMatchSnapshot();
  });
});
export default UserForm;