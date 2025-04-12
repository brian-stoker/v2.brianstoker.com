import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PostcssConfig from './PostcssConfig';

describe('PostcssConfig component', () => {
  const postcssConfig = {
    plugins: [
      {
        name: 'postcss-import',
        options: {},
      },
      {
        name: 'tailwindcss/nesting',
        options: {},
      },
      {
        name: 'tailwindcss',
        options: {},
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<PostcssConfig />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders plugins array', () => {
      const { getByText } = render(<PostcssConfig />);
      expect(getByText('plugins')).toBeInTheDocument();
    });

    it('does not render empty plugins array', () => {
      postcssConfig.plugins = [];
      const { container } = render(<PostcssConfig />);
      expect(container).not.toBeEmptyDOMElement();
    });
  });

  describe('prop validation', () => {
    it('accepts valid postcss config object', () => {
      const { container } = render(<PostcssConfig postcssConfig={postcssConfig} />);
      expect(container).toBeTruthy();
    });

    it('rejects invalid postcss config object', () => {
      const invalidConfig = {};
      const { error } = render(<PostcssConfig postcssConfig={invalidConfig} />, {
        error: true,
      });
      expect(error.message).toContain('Invalid type');
    });
  });

  describe('user interactions', () => {
    it('renders plugins array when click on "plugins" text', () => {
      const { getByText, container } = render(<PostcssConfig />);
      const pluginsLink = container.querySelector('a[href="#plugins"]');
      fireEvent.click(pluginsLink);
      expect(getByText('plugins')).toBeInTheDocument();
    });

    it('does not change plugin array when click on "plugins" text', () => {
      postcssConfig.plugins = [{ name: 'plugin1' }];
      const { container } = render(<PostcssConfig postcssConfig={postcssConfig} />);
      const pluginsLink = container.querySelector('a[href="#plugins"]');
      fireEvent.click(pluginsLink);
      expect(postcssConfig.plugins).toBeArray();
    });

    it('renders empty plugin array when click on "add plugin" button', () => {
      const { getByText, container } = render(<PostcssConfig />);
      const addPluginButton = container.querySelector('button[type="submit"]');
      fireEvent.click(addPluginButton);
      expect(getByText('plugins')).toBeInTheDocument();
    });
  });

  describe('side effects and state changes', () => {
    it('adds new plugin to plugins array when adding new plugin form is submitted', () => {
      const addNewPluginForm = render(<PostcssConfig />);
      const pluginNameInput = addNewPluginForm.getByPlaceholderText('');
      fireEvent.change(pluginNameInput, { target: { value: 'new-plugin' } });
      const submitButton = addNewPluginForm.getByRole('button', { name: 'Add Plugin' });
      fireEvent.click(submitButton);
      expect(postcssConfig.plugins).toEqual([{ name: 'postcss-import' }, { name: 'tailwindcss/nesting' }, { name: 'new-plugin' }]);
    });

    it('does not add new plugin to plugins array when adding new plugin form is submitted with empty name', () => {
      const addNewPluginForm = render(<PostcssConfig />);
      const submitButton = addNewPluginForm.getByRole('button', { name: 'Add Plugin' });
      fireEvent.click(submitButton);
      expect(postcssConfig.plugins).toEqual([{ name: 'postcss-import' }, { name: 'tailwindcss/nesting' }]);
    });
  });

  testSnapshot('renders with correct plugins array', () => {
    const { asFragment } = render(<PostcssConfig postcssConfig={postcssConfig} />);
    expect(asFragment()).toMatchSnapshot();
  });
});