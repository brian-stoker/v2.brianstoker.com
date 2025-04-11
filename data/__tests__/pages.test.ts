import type { MuiPage } from '../src/MuiPage';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fileExplorerComponentApi from './file-explorer-component-api-pages';

const pages = [
  // Add test pages here
];

describe('MuiPage component', () => {
  const setup = (page: MuiPage) => {
    return render(<MuiPage {...page} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.closeAllMocks();
  });

  describe('renders without crashing', () => {
    pages.forEach((page) => {
      it(`should render with page ${page.pathname}`, () => {
        const component = setup(page);
        expect(component).toBeTruthy();
      });
    });
  });

  describe('conditional rendering', () => {
    pages.forEach((page) => {
      if (page.newFeature) {
        it(`should render new feature for page ${page.pathname}`, () => {
          const component = setup(page);
          expect(component).toHaveTextMatching(/New Feature/i);
        });
      } else if (page.alpha) {
        it(`should render alpha for page ${page.pathname}`, () => {
          const component = setup(page);
          expect(component).toHaveTextMatching(/Alpha/i);
        });
      }
    });
  });

  describe('prop validation', () => {
    pages.forEach((page) => {
      if (!page.newFeature && !page.alpha) {
        it(`should render with valid page ${page.pathname}`, () => {
          const component = setup(page);
          expect(component).toBeTruthy();
        });

        // Invalid prop
        it(`should throw error when invalid page ${page.pathname} is passed`, () => {
          expect(() => setup({ ...page, pathname: '/invalid-page' })).toThrowError();
        });
      }
    });
  });

  describe('user interactions', () => {
    pages.forEach((page) => {
      if (page.newFeature) {
        it(`should render new feature for page ${page.pathname}`, () => {
          const component = setup(page);
          const newFeatureButton = component.getByRole('button', { name: 'New Feature' });
          userEvent.click(newFeatureButton);
          expect(component).toHaveTextMatching(/New Feature/i);
        });

        it(`should close new feature for page ${page.pathname}`, () => {
          const component = setup(page);
          const newFeatureButton = component.getByRole('button', { name: 'New Feature' });
          userEvent.click(newFeatureButton);
          userEvent.click(component.getByRole('button', { name: 'Close' }));
          expect(component).not.toHaveTextMatching(/New Feature/i);
        });
      }

      if (page.alpha) {
        it(`should render alpha for page ${page.pathname}`, () => {
          const component = setup(page);
          const alphaButton = component.getByRole('button', { name: 'Alpha' });
          userEvent.click(alphaButton);
          expect(component).toHaveTextMatching(/Alpha/i);
        });

        it(`should close alpha for page ${page.pathname}`, () => {
          const component = setup(page);
          const alphaButton = component.getByRole('button', { name: 'Alpha' });
          userEvent.click(alphaButton);
          userEvent.click(component.getByRole('button', { name: 'Close' }));
          expect(component).not.toHaveTextMatching(/Alpha/i);
        });
      }
    });

    pages.forEach((page) => {
      if (!page.newFeature && !page.alpha) {
        it(`should render with default state for page ${page.pathname}`, () => {
          const component = setup(page);
          const titleButton = component.getByRole('button', { name: 'Title' });
          userEvent.click(titleButton);
          expect(component).toHaveTextMatching(page.title);
        });

        it(`should submit form for page ${page.pathname}`, () => {
          const component = setup(page);
          const form = component.getByRole('form');
          userEvent.fill(form, 'title', 'Test Title');
          userEvent.submit(form);
          expect(component).toHaveTextMatching(page.title);
        });
      }
    });
  });

  describe('api reference', () => {
    pages.forEach((page) => {
      if (page.newFeature) {
        it(`should render API documentation for page ${page.pathname}`, async () => {
          const component = setup(page);
          await waitFor(() => expect(component).toHaveTextMatching(/API Reference/i));
        });
      }

      if (page.alpha) {
        it(`should render API documentation for page ${page.pathname}`, async () => {
          const component = setup(page);
          await waitFor(() => expect(component).toHaveTextMatching(/API Reference/i));
        });

        // Add tests for fileExplorerComponentApi here
      }
    });
  });
});