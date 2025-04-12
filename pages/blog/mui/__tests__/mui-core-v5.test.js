import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-core-v5.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Renders without crashing', () => {
    it('renders successfully', () => {
      expect(page).toBeTruthy();
    });
  });

  describe('Conditional rendering', () => {
    it('renders TopLayoutBlog component with docs prop', () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('renders empty layout when docs prop is null or undefined', () => {
      const docsNull = null;
      const docsUndefined = undefined;
      render(<Page docs={docsNull} />);
      expect(page).toHaveStyleRule('display', 'none');

      render(<Page docs={docsUndefined} />);
      expect(page).toHaveStyleRule('display', 'none');
    });
  });

  describe('Prop validation', () => {
    it('throws an error when docs prop is not provided', () => {
      expect(() => <Page />).toThrowError();
    });

    it('throws an error when docs prop is null or undefined', () => {
      expect(() => render(<Page docs={null} />)).toThrowError();
      expect(() => render(<Page docs={undefined} />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    it('does not throw an error when clicked', async () => {
      const { getByText } = page;
      const element = getByText(docs.title);
      fireEvent.click(element);
      expect(page).toBeTruthy();
    });

    it('does not throw an error when input changes', async () => {
      const { getByText, getByPlaceholderText } = page;
      const element = getByText(docs.title);
      const inputField = getByPlaceholderText('');
      fireEvent.change(inputField, { target: { value: 'new value' } });
      expect(page).toBeTruthy();
    });

    it('submits the form when clicked', async () => {
      const { getByText, getByRole } = page;
      const element = getByText(docs.title);
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      await waitFor(() => expect(page).not.toHaveByRole('form'));
    });
  });

  describe('Snapshot testing', () => {
    it('matches the expected snapshot when rendered', async () => {
      await waitFor(() => expect(render(<Page />)).toMatchSnapshot());
    });
  });
});