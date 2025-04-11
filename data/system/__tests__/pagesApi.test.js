import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vitest } from 'vitest';
import { ApiPaths } from './ApiPaths'; // Import the component to test
import { mockApiServerResponse } from './mocks/api'; // Mock API server response

vitest.init({
  setupFiles: ['./setupTests.js'],
});

describe('ApiPaths', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<ApiPaths />);
      expect(container).toBeTruthy();
    });

    it('renders API paths correctly', async () => {
      const { getByText } = render(<ApiPaths />);
      const apiPathElements = await getByText([
        '/system/api/box',
        '/system/api/container',
        '/system/api/grid',
        '/system/api/stack',
      ]);
      expect(apiPathElements.length).toBe(4);
    });

    it('renders all API paths when all paths are available', async () => {
      const { getAllByRole } = render(<ApiPaths />);
      const apiPathRoles = await getAllByRole('listitem');
      expect(apiPathRoles.length).toBe(4);
    });
  });

  describe('Props Validation', () => {
    it('throws an error when invalid prop is provided', async () => {
      expect(() => <ApiPaths invalidProp="test" />).toThrowError();
    });

    it('renders correctly with valid props', async () => {
      const { getByText } = render(<ApiPaths validProp1="value1" />);
      const apiPathElements = await getByText([
        '/system/api/box',
        '/system/api/container',
        '/system/api/grid',
        '/system/api/stack',
      ]);
      expect(apiPathElements.length).toBe(4);
    });
  });

  describe('User Interactions', () => {
    it('calls onFetchApi event when clicking an API path', async () => {
      const fetchApiMock = jest.fn();
      const { getByText } = render(<ApiPaths onFetchApi={fetchApiMock} />);
      const apiPathElement = await getByText('/system/api/box');
      fireEvent.click(apiPathElement);
      expect(fetchApiMock).toHaveBeenCalledTimes(1);
    });

    it('calls onFetchApi event when clicking all API paths', async () => {
      const fetchApiMock = jest.fn();
      const { getAllByRole } = render(<ApiPaths onFetchApi={fetchApiMock} />);
      const apiPathRoles = await getAllByRole('listitem');
      fireEvent.click(apiPathRoles[0]);
      expect(fetchApiMock).toHaveBeenCalledTimes(1);
    });

    it('calls onInput event when input field is changed', async () => {
      const setInputMock = jest.fn();
      const { getByPlaceholderText, getByRole } = render(<ApiPaths onInput={setInputMock} />);
      const inputField = await getByPlaceholderText('API Path');
      fireEvent.change(inputField, { target: { value: '/system/api/box' } });
      expect(setInputMock).toHaveBeenCalledTimes(1);
    });

    it('calls onFetchApi event when form is submitted', async () => {
      const fetchApiMock = jest.fn();
      const { getByText, getByRole } = render(<ApiPaths onFetchApi={fetchApiMock} />);
      const apiPathElement = await getByText('/system/api/box');
      fireEvent.change(apiPathElement, { target: { value: '/system/api/box' } });
      fireEvent.submit(document.body);
      expect(fetchApiMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side Effects', () => {
    it('displays loading state while API is being fetched', async () => {
      mockApiServerResponse(() => Promise.resolve({ data: 'test' }));
      const { getByText } = render(<ApiPaths />);
      expect(getByText('Loading...')).toBeInTheDocument();
      await waitFor(() => expect(getByText('Loading...')).not.toBeInTheDocument());
    });
  });

  describe('Snapshot Test', () => {
    it('renders correctly with expected snapshot', async () => {
      const { asFragment } = render(<ApiPaths />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});