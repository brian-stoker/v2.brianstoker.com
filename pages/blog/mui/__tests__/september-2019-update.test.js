import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './september-2019-update.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<TopLayoutBlog docs={docs} />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(page).toBeTruthy();
  });

  describe('props validation', () => {
    it('valid props', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });

    it('invalid docs prop', () => {
      expect(() => <TopLayoutBlog docs={null} />).toThrowError(
        'Docs is required'
      );
    });
  });

  describe('conditional rendering', () => {
    it('renders when docs are provided', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });

    it('does not render when docs are missing', () => {
      const { container: containerWithoutDocs } = render(<TopLayoutBlog />);
      expect(containerWithoutDocs).toBeEmptyDOMElement();
    });
  });

  describe('user interactions', () => {
    it('renders content on page load', async () => {
      await waitFor(() => expect(page.body).toHaveTextContent('September 2019 Update'));
    });

    it('renders content after clicking button', async () => {
      const button = page.getByRole('button');
      fireEvent.click(button);
      await waitFor(() => expect(page.body).toHaveTextContent('September 2019 Update'));
    });
  });

  describe('side effects', () => {
    it('calls callback function when new docs are provided', async () => {
      const updateDocsMock = jest.fn();
      const { container } = render(<TopLayoutBlog docs={docs} callback={updateDocsMock} />);
      await waitFor(() => expect(updateDocsMock).toHaveBeenCalledTimes(1));
    });
  });
});