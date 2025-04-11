import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MuiPage } from 'src/MuiPage';
import translationsFile from '../translations/translations.json';

describe('Translations Generator Component', () => {
  let runMock;

  beforeEach(() => {
    jest.clearAllMocks();
    runMock = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MuiPage />);
    expect(container).toBeTruthy();
  });

  it('traverses pages and generates translations', async () => {
    // Mock the run function to return immediately
    runMock.mockImplementation(() => Promise.resolve());

    const { container } = render(<MuiPage />);
    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(1));
  });

  it('should exclude api and blog paths', async () => {
    const page = {
      pathname: '/api-docs',
      subheader: 'API Documentation',
      children: [],
    };

    const { container } = render(<MuiPage page={page} />);
    expect(container).not.toContain(element => element.textContent === 'API Documentation');
  });

  it('should generate translations for valid pages', async () => {
    const page1 = {
      pathname: '/home',
      subheader: '',
      children: [],
    };

    const page2 = {
      pathname: '/about',
      subheader: 'About Us',
      children: [],
    };

    const { container } = render(<MuiPage pages={[page1, page2]} />);
    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(2));
  });

  it('should not generate translations for invalid pages', async () => {
    const page = {
      pathname: '/invalid-page',
      subheader: '',
      children: [],
    };

    const { container } = render(<MuiPage page={page} />);
    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(0));
  });

  it('should handle form submission', async () => {
    const { getByRole, getByText } = render(<MuiPage />);
    const inputField = getByRole('textbox');
    const submitButton = getByText('Submit');

    fireEvent.change(inputField, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(1));
  });

  it('should generate translations for all pages', async () => {
    const page3 = {
      pathname: '/x/react-',
      subheader: '',
      children: [],
    };

    const { container } = render(<MuiPage pages={[page3]} />);
    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(1));
  });

  it('should not generate translations for excluded paths', async () => {
    const page4 = {
      pathname: '/x/react-',
      subheader: '',
      children: [],
    };

    const { container } = render(<MuiPage pages={[page4]} />);
    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(0));
  });

  it('should not generate translations for page with empty title', async () => {
    const page5 = {
      pathname: '/empty-title-page',
      subheader: '',
      children: [],
    };

    const { container } = render(<MuiPage pages={[page5]} />);
    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(0));
  });

  it('should generate translations for all pages when run is called', async () => {
    const page6 = {
      pathname: '/test-page',
      subheader: 'Test Page',
      children: [],
    };

    const { container } = render(<MuiPage pages={[page6]} />);
    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(1));
  });
});