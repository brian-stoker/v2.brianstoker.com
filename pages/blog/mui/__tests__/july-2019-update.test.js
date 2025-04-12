import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './july-2019-update.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderings', () => {
    it('should render without crashing', () => {
      expect(page).toBeTruthy();
    });
    it('should render the TopLayoutBlog component', () => {
      const topLayoutBlog = page.getByRole('region');
      expect(topLayoutBlog).toBeInTheDocument();
    });
    it('should render docs when passed as a prop', () => {
      const { getByText } = render(<Page docs={docs} />);
      expect(getByText('july-2019-update')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should throw an error if no docs are provided', () => {
      expect(() => render(<Page />)).toThrowError();
    });
    it('should not throw an error when docs are provided', () => {
      const { getByText } = render(<Page docs={docs} />);
      expect(getByText('july-2019-update')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update the page when click is triggered', async () => {
      const { getByRole, getByText } = render(<Page docs={docs} />);
      const button = getByRole('button');
      fireEvent.click(button);
      await waitFor(() => expect(getByText('updated')).toBeInTheDocument());
    });
  });

  describe('Snapshot Test', () => {
    it('should match the expected snapshot', async () => {
      const { asFragment } = render(<Page docs={docs} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});