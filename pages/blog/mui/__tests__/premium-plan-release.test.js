import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './premium-plan-release.md?muiMarkdown';

describe('Page', () => {
  let page;
  let mockDocs;

  beforeEach(() => {
    mockDocs = { title: 'Mock Docs' };
  });

  it('renders without crashing', async () => {
    document.body.innerHTML = '<div></div>';
    page = render(<TopLayoutBlog docs={mockDocs} />);
    expect(page).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders blog title when docs prop is provided', async () => {
      page = render(<TopLayoutBlog docs={mockDocs} />);
      const titleElement = await page.findByText(mockDocs.title);
      expect(titleElement).toBeInTheDocument();
    });

    it('renders empty content when docs prop is not provided', async () => {
      document.body.innerHTML = '<div></div>';
      page = render(<TopLayoutBlog docs={null} />);
      const contentElement = await page.findByText('');
      expect(contentElement).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when docs prop is null or undefined', async () => {
      document.body.innerHTML = '<div></div>';
      await expect(() => render(<TopLayoutBlog docs={null} />)).rejects.toThrowError();
      await expect(() => render(<TopLayoutBlog docs={undefined} />)).rejects.toThrowError();
    });

    it('throws an error when docs prop is not an object', async () => {
      document.body.innerHTML = '<div></div>';
      await expect(() => render(<TopLayoutBlog docs="not an object" />)).rejects.toThrowError();
    });
  });

  describe('user interactions', () => {
    it('clicks on the blog title', async () => {
      page = render(<TopLayoutBlog docs={mockDocs} />);
      const titleElement = await page.findByText(mockDocs.title);
      fireEvent.click(titleElement);
      expect(page).toHaveTitle(mockDocs.title);
    });

    it('enters text in the input field', async () => {
      document.body.innerHTML = '<input type="text" />';
      page = render(<TopLayoutBlog docs={mockDocs} />);
      const inputField = await page.findByPlaceholderText('');
      fireEvent.change(inputField, { target: { value: 'new text' } });
      expect(page).toHaveValue('new text', 'input');
    });

    it('submits the form when clicked', async () => {
      document.body.innerHTML = '<form></form>';
      page = render(<TopLayoutBlog docs={mockDocs} />);
      const formElement = await page.findByText('');
      fireEvent.click(formElement);
      expect(page).toHaveFormSubmission();
    });
  });

  describe('side effects', () => {
    it('calls the callback function when clicked', async () => {
      const callbackMock = jest.fn();
      document.body.innerHTML = '<div></div>';
      page = render(<TopLayoutBlog docs={mockDocs} callback={callbackMock} />);
      const titleElement = await page.findByText(mockDocs.title);
      fireEvent.click(titleElement);
      expect(callbackMock).toHaveBeenCalledTimes(1);
    });
  });

  it('renders with snapshot', async () => {
    document.body.innerHTML = '<div></div>';
    page = render(<TopLayoutBlog docs={mockDocs} />);
    await waitFor(() => expect(page.asFragment()).toMatchSnapshot());
  });
});