import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-material-ui-v6-and-beyond.md?muiMarkdown';

describe('Page component', () => {
  let page: HTMLDivElement;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      const { getByText } = render(<Page />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('renders TopLayoutBlog component with empty docs prop', () => {
      jest.spyOn(React, 'useEffect').mockImplementation(() => {});
      const { getByText } = render(<Page docs="" />);
      expect(getByText('').toBeInTheDocument());
    });
  });

  describe('Props validation', () => {
    it('throws error when docs prop is falsy', () => {
      const page = render(<Page docs={null} />);
      expect(page).toBeNull();
    });

    it('throws error when docs prop is not an object', () => {
      jest.spyOn(React, 'useEffect').mockImplementation(() => {});
      const page = render(<Page docs={123} />);
      expect(page).toBeNull();
    });
  });

  describe('User interactions', () => {
    it('calls useEffect with correct props when docs prop is provided', async () => {
      jest.spyOn(React, 'useEffect');
      const { getByText } = render(<Page />);
      await waitFor(() => getByText(docs.title));
      expect(React.useEffect).toHaveBeenCalledTimes(1);
      expect(React.useEffect).toHaveBeenCalledWith([() => {}], []);
    });

    it('calls useEffect with correct props when docs prop is empty', async () => {
      jest.spyOn(React, 'useEffect');
      const { getByText } = render(<Page docs="" />);
      await waitFor(() => getByText('').toBeInTheDocument());
      expect(React.useEffect).toHaveBeenCalledTimes(1);
      expect(React.useEffect).toHaveBeenCalledWith([() => {}], []);
    });

    it('calls useEffect with correct props when docs prop is falsy', async () => {
      jest.spyOn(React, 'useEffect');
      const { getByText } = render(<Page docs={null} />);
      await waitFor(() => getByText('').toBeInTheDocument());
      expect(React.useEffect).toHaveBeenCalledTimes(1);
      expect(React.useEffect).toHaveBeenCalledWith([() => {}], []);
    });
  });

  describe('Snapshot test', () => {
    it('matches snapshot', async () => {
      const { asFragment } = render(<Page />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});