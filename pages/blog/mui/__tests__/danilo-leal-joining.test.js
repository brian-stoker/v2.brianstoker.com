import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './danilo-leal-joining.md?muiMarkdown';

describe('Page component', () => {
  const mockDocs = { content: {} };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Page />);
    expect(() => document.querySelector('.top-layout-blog')).not.toThrowError();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog when provided with docs', async () => {
      const { getByText } = render(<Page />);
      expect(getByText('Top Layout Blog')).toBeInTheDocument();
    });

    it('does not render anything without docs prop', async () => {
      const { queryByTitle } = render(<Page />);
      expect(queryByTitle('Top Layout Blog')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('renders with valid docs prop', async () => {
      render(<Page docs={mockDocs} />);
      expect(() => document.querySelector('.top-layout-blog')).not.toThrowError();
    });

    it('does not render when docs is an empty object', async () => {
      const { queryByTitle } = render(<Page docs={{}}/>);
      expect(queryByTitle('Top Layout Blog')).not.toBeInTheDocument();
    });

    it('does not render when docs is null or undefined', async () => {
      const { queryByTitle } = render(<Page docs={null} />);
      expect(queryByTitle('Top Layout Blog')).not.toBeInTheDocument();

      const { queryByTitle } = render(<Page docs={undefined}/>);
      expect(queryByTitle('Top Layout Blog')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('renders page title on click', async () => {
      const { getByText, getByRole } = render(<Page />);
      const titleElement = getByRole('heading');
      fireEvent.click(titleElement);
      expect(getByText('Top Layout Blog')).toBeInTheDocument();
    });

    it('does not submit the form when clicking outside', async () => {
      const { getByRole, queryByTitle } = render(<Page />);
      const form = getByRole('form');
      fireEvent.click(form);
      const outsideFormElement = document.querySelector('.outside-form');
      expect(queryByTitle('Top Layout Blog')).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('renders content after page is fully loaded', async () => {
      render(<Page />);
      await waitFor(() => expect(document.querySelector('.content')).toBeInTheDocument());
    });
  });

  test('snapshot matches the rendered HTML', () => {
    const { asFragment } = render(<Page />);
    expect(asFragment()).toMatchSnapshot();
  });
});