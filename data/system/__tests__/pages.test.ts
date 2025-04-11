import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import type { MuiPage } from 'src/MuiPage';
import pagesApi from 'data/system/pagesApi';

const pages: readonly MuiPage[] = [
  // ... (pages array remains the same)
];

describe('MuiPage component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MuiPage pages={pages} />);
    expect(container).toMatchSnapshot();
  });

  describe('conditional rendering', () => {
    it('renders children when pathname is provided', async () => {
      const mockChildren: JSX.Element[] = [];
      const { container } = render(
        <MuiPage pages={{ pathname: '/system/getting-started-group', title: 'Getting started' }} />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders children when legacy prop is set to true', async () => {
      const mockChildren: JSX.Element[] = [];
      const { container } = render(
        <MuiPage pages={{ pathname: '/system/getting-started-group', title: 'Getting started' }} legacy={true} />
      );
      expect(container).toMatchSnapshot();
    });

    it('does not render children when pathname is not provided and legacy prop is set to false', async () => {
      const { container } = render(<MuiPage pages={{}} legacy={false} />);
      expect(container).toHaveTextContent('No children');
    });
  });

  describe('prop validation', () => {
    it('accepts valid pages array', async () => {
      const { container } = render(<MuiPage pages={pages} />);
      expect(() => componentRendered).not.toThrow();
    });

    it('throws error when pages array is invalid', async () => {
      expect(() => <MuiPage pages={[]} />).toThrowError();
    });
  });

  describe('user interactions', () => {
    const mockClick = jest.fn();

    it('calls click prop when pathname is clicked', async () => {
      const { getByText } = render(<MuiPage pages={pages} />);
      const linkElement = getByText('/system/getting-started-group');
      fireEvent.click(linkElement);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('calls click prop with correct pathname when pathname is clicked', async () => {
      const { getByText } = render(<MuiPage pages={pages} />);
      const linkElement = getByText('/system/getting-started-group');
      fireEvent.click(linkElement);
      expect(mockClick).toHaveBeenCalledWith('/system/getting-started-group');
    });

    it('calls click prop with correct pathname and children when pathname is clicked', async () => {
      const { getByText } = render(<MuiPage pages={pages} />);
      const linkElement = getByText('/system/getting-started-group');
      fireEvent.click(linkElement);
      expect(mockClick).toHaveBeenCalledWith({
        pathname: '/system/getting-started-group',
        children: expect.any(Array),
      });
    });

    it('calls click prop when input field is changed', async () => {
      const { getByPlaceholderText, byRole } = render(<MuiPage pages={pages} />);
      const inputField = getByPlaceholderText('');
      fireEvent.change(inputField, { target: { value: '/system/getting-started-group' } });
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('calls click prop with correct pathname when input field is changed', async () => {
      const { getByPlaceholderText, byRole } = render(<MuiPage pages={pages} />);
      const inputField = getByPlaceholderText('');
      fireEvent.change(inputField, { target: { value: '/system/getting-started-group' } });
      expect(mockClick).toHaveBeenCalledWith('/system/getting-started-group');
    });

    it('calls click prop with correct pathname and children when input field is changed', async () => {
      const { getByPlaceholderText, byRole } = render(<MuiPage pages={pages} />);
      const inputField = getByPlaceholderText('');
      fireEvent.change(inputField, { target: { value: '/system/getting-started-group' } });
      expect(mockClick).toHaveBeenCalledWith({
        pathname: '/system/getting-started-group',
        children: expect.any(Array),
      });
    });

    it('calls click prop when form is submitted', async () => {
      const { getByRole, getByText } = render(<MuiPage pages={pages} />);
      const inputField = getByPlaceholderText('');
      const submitButton = getByText('Submit');
      fireEvent.change(inputField, { target: { value: '/system/getting-started-group' } });
      fireEvent.click(submitButton);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('calls click prop with correct pathname when form is submitted', async () => {
      const { getByRole, getByText } = render(<MuiPage pages={pages} />);
      const inputField = getByPlaceholderText('');
      const submitButton = getByText('Submit');
      fireEvent.change(inputField, { target: { value: '/system/getting-started-group' } });
      fireEvent.click(submitButton);
      expect(mockClick).toHaveBeenCalledWith('/system/getting-started-group');
    });

    it('calls click prop with correct pathname and children when form is submitted', async () => {
      const { getByRole, getByText } = render(<MuiPage pages={pages} />);
      const inputField = getByPlaceholderText('');
      const submitButton = getByText('Submit');
      fireEvent.change(inputField, { target: { value: '/system/getting-started-group' } });
      fireEvent.click(submitButton);
      expect(mockClick).toHaveBeenCalledWith({
        pathname: '/system/getting-started-group',
        children: expect.any(Array),
      });
    });
  });

  it('renders correctly with children', async () => {
    const mockChildren = render(<p>Hello World!</p>);
    const { container } = <MuiPage pages={{}}>{mockChildren}</MuiPage>;
    expect(container).toMatchSnapshot();
  });
});