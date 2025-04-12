import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { vi } from 'vitest-axios-mock-service';
import ApiPage from './ApiPage';

const server = setupServer(
  rest.get('/system/api/box', (_req, res, ctx) => res(ctx.json([
    { pathname: '/system/api/box' },
  ]))),
  rest.get('/system/api/container', (_req, res, ctx) => res(ctx.json([
    { pathname: '/system/api/container' },
  ]))),
  rest.get('/system/api/grid', (_req, res, ctx) => res(ctx.json([
    { pathname: '/system/api/grid' },
  ]))),
  rest.get('/system/api/stack', (_req, res, ctx) => res(ctx.json([
    { pathname: '/system/api/stack' },
  ])))
);

vi.setupServer(server);

describe('ApiPage component', () => {
  beforeEach(() => {
    vi.clearMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<ApiPage />);
    expect(getByText('/system/api/box')).toBeInTheDocument();
  });

  describe('with valid props', () => {
    it('displays all paths', async () => {
      const { getAllByRole } = render(<ApiPage paths={['/system/api/box']} />);
      const paths = await Promise.all(
        getAllByRole('listitem').map((node) => node.textContent)
      );
      expect(paths).toEqual(['/system/api/box']);
    });

    it('displays all container types', async () => {
      const { getAllByRole } = render(<ApiPage paths={['/system/api/container']} />);
      const containerTypes = await Promise.all(
        getAllByRole('listitem').map((node) => node.textContent)
      );
      expect(containerTypes).toEqual(['/system/api/container']);
    });

    it('displays all grid types', async () => {
      const { getAllByRole } = render(<ApiPage paths={['/system/api/grid']} />);
      const gridTypes = await Promise.all(
        getAllByRole('listitem').map((node) => node.textContent)
      );
      expect(gridTypes).toEqual(['/system/api/grid']);
    });

    it('displays all stack types', async () => {
      const { getAllByRole } = render(<ApiPage paths={['/system/api/stack']} />);
      const stackTypes = await Promise.all(
        getAllByRole('listitem').map((node) => node.textContent)
      );
      expect(stackTypes).toEqual(['/system/api/stack']);
    });
  });

  describe('with invalid props', () => {
    it('throws an error if paths is not provided', async () => {
      await expect(render(<ApiPage />)).rejects.toThrowError('paths prop is required');
    });

    it('throws an error if paths is empty array', async () => {
      await expect(render(<ApiPage paths={[]} })).rejects.toThrowError(
        'At least one path must be provided'
      );
    });
  });

  describe('with user interactions', () => {
    it('calls API endpoint when a link is clicked', async () => {
      const { getByText } = render(<ApiPage />);
      const link = await Promise.all(
        getAllByRole('link').map((node) => node.href)
      );
      fireEvent.click(link[0]);
      await server.getEvents();
      expect(server.getInteractions()).toHaveLength(1);
    });

    it('submits a form when all fields are filled', async () => {
      const { getByPlaceholderText, getByValue } = render(<ApiPage />);
      const inputField = getByPlaceholderText('');
      const submitButton = getByValue('/');
      fireEvent.change(inputField, { target: { value: '/system/api/box' } });
      fireEvent.click(submitButton);
      await server.getEvents();
      expect(server.getInteractions()).toHaveLength(1);
    });

    it('does not submit a form when all fields are empty', async () => {
      const { getByPlaceholderText, getByValue } = render(<ApiPage />);
      const inputField = getByPlaceholderText('');
      const submitButton = getByValue('/');
      fireEvent.change(inputField, { target: { value: '' } });
      fireEvent.click(submitButton);
      await server.getEvents();
      expect(server.getInteractions()).toHaveLength(0);
    });
  });

  describe('with conditional rendering', () => {
    it('renders paths if no paths are provided', async () => {
      const { getAllByRole } = render(<ApiPage />);
      const emptyPaths = await Promise.all(
        getAllByRole('listitem').map((node) => node.textContent)
      );
      expect(emptyPaths).toHaveLength(0);
    });

    it('renders paths if at least one path is provided', async () => {
      const { getAllByRole } = render(<ApiPage paths={['/system/api/box']} />);
      const paths = await Promise.all(
        getAllByRole('listitem').map((node) => node.textContent)
      );
      expect(paths).toHaveLength(1);
    });
  });

  it('renders a message if no API responses are received', async () => {
    vi.setupServer(server);
    server.getInteractions().mockClear();
    const { getByText } = render(<ApiPage />);
    await waitFor(() => getByText('No API responses received'));
  });

  it('renders a message if API responses contain errors', async () => {
    vi.setupServer(server);
    rest.get('/system/api/box', (_req, res, ctx) => res(ctx.status(500)));
    const { getByText } = render(<ApiPage />);
    await waitFor(() => getByText('An error occurred while fetching API data'));
  });

  it('renders a message if API responses take too long to receive', async () => {
    vi.setupServer(server);
    rest.get('/system/api/box', (_req, res, ctx) => new Promise((resolve) =>
      setTimeout(() => resolve(ctx.json({})), 2000)
    ));
    const { getByText } = render(<ApiPage />);
    await waitFor(() => getByText('API request timed out'));
  });
});