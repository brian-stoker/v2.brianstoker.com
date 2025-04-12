import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './making-customizable-components.md?muiMarkdown';

describe('TopLayoutBlog Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(<Page />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Render Tests', () => {
    it('renders without crashing', () => {
      expect(wrapper).toBeTruthy();
    });

    it('renders TopLayoutBlog component correctly', async () => {
      const { getByText } = wrapper;
      expect(getByText(docs.title)).toBeInTheDocument();
    });
  });

  describe('Prop Validation Tests', () => {
    it('accepts valid docs prop', () => {
      const props = { docs: docs };
      render(<TopLayoutBlog {...props} />);
      expect(wrapper).toBeTruthy();
    });

    it('rejects invalid docs prop', async () => {
      const props = { docs: null };
      render(<TopLayoutBlog {...props} />);
      expect(wrapper).not.toBeTruthy();
    });
  });

  describe('User Interaction Tests', () => {
    it('renders correctly after clicking on a button', async () => {
      const { getByText } = wrapper;
      await fireEvent.click(getByText(docs.button));
      expect(getByText(docs.successful)).toBeInTheDocument();
    });

    it('updates state correctly when input changes', async () => {
      const { getByPlaceholderText } = wrapper;
      const inputField = getByPlaceholderText(docs.inputPlaceHolder);
      fireEvent.change(inputField, { target: { value: 'new-value' } });
      expect(wrapper).toHaveValue(docs.inputPlaceHolder, 'new-value');
    });

    it('submits form correctly', async () => {
      const { getByText } = wrapper;
      await fireEvent.submit(getByText(docs.button));
      expect(getByText(docs.successful)).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering Tests', () => {
    it('renders different component when docs prop is null', async () => {
      const props = { docs: null };
      render(<TopLayoutBlog {...props} />);
      expect(wrapper).toHaveTextContent('No content available');
    });

    it('renders default component when docs prop is undefined', async () => {
      const props = {};
      render(<TopLayoutBlog {...props} />);
      expect(wrapper).toHaveTextContent('Default text');
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for valid docs prop', () => {
      const props = { docs: docs };
      render(<TopLayoutBlog {...props} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('does not match snapshot for invalid docs prop', async () => {
      const props = { docs: null };
      render(<TopLayoutBlog {...props} />);
      expect(wrapper).not.toMatchSnapshot();
    });
  });
});