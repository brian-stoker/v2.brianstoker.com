import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import type { MuiPage } from '../src/MuiPage';
import fileExplorerComponentApi from './file-explorer-component-api-pages';

const pages: MuiPage[] = require('./pages');

describe('Pages', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(
      <MuiPage pages={pages} />
    );
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Renders without crashing', () => {
    it('renders with no errors', () => {
      expect(wrapper).not.toThrowError();
    });
  });

  describe('Conditional rendering', () => {
    const path = '/file-explorer/docs/file-explorer-basic/items';

    it('renders the correct content for file explorer basic items', () => {
      const { getByText } = wrapper;
      expect(getByText('File Explorer Basic')).toBeInTheDocument();
      expect(getByText('Items')).toBeInTheDocument();
    });

    it('renders the correct content for file explorer selection', () => {
      const { getByText } = wrapper;
      expect(getByText('Selection')).toBeInTheDocument();
    });

    it('renders the correct content for file explorer expansion', () => {
      const { getByText } = wrapper;
      expect(getByText('Expansion')).toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    const invalidPages = [null, undefined, []];

    invalidPages.forEach((invalidPage) => {
      it(`throws an error when given ${invalidPage}`, () => {
        expect(() => render(<MuiPage pages={invalidPage} />)).toThrowError();
      });
    });

    it('renders without errors when given valid pages', () => {
      const { getByText } = wrapper;
      expect(getByText('File Explorer')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    const path = '/file-explorer/docs/file-explorer-basic/items';

    it('clicks on the file explorer basic items link navigates to the correct page', () => {
      const { getByText } = wrapper;
      expect(getByText('File Explorer Basic')).toBeInTheDocument();
      const link = getByText('Items');
      fireEvent.click(link);
      expect(wrapper).toHaveURL(path);
    });

    it('clicks on the file explorer selection link navigates to the correct page', () => {
      const { getByText } = wrapper;
      expect(getByText('Selection')).toBeInTheDocument();
      const link = getByText('Items');
      fireEvent.click(link);
      expect(wrapper).toHaveURL(path);
    });
  });

  describe('Side effects and state changes', () => {
    // No specific side effects or state changes to test
  });
});

export default { pages };