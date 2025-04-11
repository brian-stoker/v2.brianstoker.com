import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './base-ui-2024-plans.md?muiMarkdown';

describe('Page', () => {
  const setup = (props) => render(<Page {...props} />);
  let component;

  beforeEach(() => {
    component = setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(component).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutBlog with docs prop', () => {
      expect(component).toMatchSnapshot();
    });

    it('renders default content when docs prop is not provided', () => {
      const props = {};
      component = setup(props);
      expect(component).toMatchSnapshot();
    });
  });

  describe('Props Validation', () => {
    it('accepts valid docs prop', () => {
      const props = { docs: docs };
      component = setup(props);
      expect(component).toBeTruthy();
    });

    it('throws error when docs prop is not provided', () => {
      const props = {};
      const throwError = jest.spyOn(component, 'error');
      component = setup(props);
      expect(throwError).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Interactions', () => {
    it('renders correct content when user interacts with docs prop', () => {
      const props = { docs: docs };
      const docLink = document.querySelector('.doc-link');
      fireEvent.click(docLink);
      expect(component).toMatchSnapshot();
    });

    it('renders error message when user tries to access non-existent doc link', () => {
      const props = { docs: docs };
      const throwError = jest.spyOn(component, 'error');
      const invalidDocLink = document.querySelector('.invalid-doc-link');
      fireEvent.click(invalidDocLink);
      expect(throwError).toHaveBeenCalledTimes(1);
    });

    it('renders search bar when user types in search input', () => {
      const props = { docs: docs };
      const searchInput = document.querySelector('input[type="search"]');
      fireEvent.change(searchInput, { target: { value: 'example' } });
      expect(component).toMatchSnapshot();
    });
  });

  describe('Side Effects and State Changes', () => {
    it('renders correct content when user submits form', async () => {
      const props = { docs: docs };
      const submitButton = document.querySelector('button[type="submit"]');
      fireEvent.click(submitButton);
      await waitFor(() => expect(component).toMatchSnapshot());
    });
  });
});