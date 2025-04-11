import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import EditPage from './EditPage.test.js';
import { useUserLanguage, useTranslate } from '@stoked-ui/docs/i18n';
import { createMockedProvider } from '@stoked-ui/docs/test-utils';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';

jest.mock('@mui/icons-material', () => ({
  GitHubIcon: jest.fn(() => <div>Mock GitHub Icon</div>),
}));

const LOCALES = { zh: 'zh-CN', pt: 'pt-BR', es: 'es-ES' };

describe('EditPage component', () => {
  const sourceLocation = '/path/to/source/location';
  const userLanguage = 'en';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => render(<EditPage sourceLocation={sourceLocation} />)).not.toThrow();
  });

  describe('conditional rendering', () => {
    it('renders edit button when user language is en', () => {
      const { getByText } = render(<EditPage sourceLocation={sourceLocation} />);
      expect(getByText('editPage')).toBeInTheDocument();
    });

    it('renders crowdin link when user language is not en', () => {
      const { getByText } = render(<EditPage sourceLocation={sourceLocation} userLanguage="pt" />);
      expect(getByText('pt-BR')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error for invalid prop type', () => {
      expect(() =>
        render(<EditPage sourceLocation="/path/to/invalid/location" />)
      ).toThrowError(TypeError);
    });

    it('does not throw error for valid prop type', () => {
      render(<EditPage sourceLocation={sourceLocation} />);
    });
  });

  describe('user interactions', () => {
    it('calls data-ga-event-action when button is clicked', async () => {
      const { getByText } = render(<EditPage sourceLocation={sourceLocation} userLanguage="en" />);
      const button = getByText('editPage');
      fireEvent.click(button);
      expect(githubIcon).toHaveBeenCalledTimes(1);
    });

    it('calls data-ga-event-label when input is changed', async () => {
      const { getByText, getByRole } = render(<EditPage sourceLocation={sourceLocation} userLanguage="en" />);
      const button = getByText('editPage');
      const labelInput = getByRole('textbox');
      fireEvent.change(labelInput, { target: { value: 'label' } });
      expect(githubIcon).toHaveBeenCalledTimes(1);
    });

    it('submits form when button is clicked', async () => {
      const { getByText, getByRole } = render(<EditPage sourceLocation={sourceLocation} userLanguage="en" />);
      const button = getByText('editPage');
      fireEvent.click(button);
      expect(getByRole('form')).toHaveAttribute('method', 'post');
    });
  });

  describe('side effects', () => {
    it('does not throw error for valid prop values', async () => {
      render(<EditPage sourceLocation={sourceLocation} userLanguage="en" />);
      await waitFor(() => expect(githubIcon).toHaveBeenCalledTimes(1));
    });

    it('throws error for invalid prop values', async () => {
      expect(() =>
        render(<EditPage sourceLocation="/path/to/invalid/location" userLanguage="pt" />)
      ).toThrowError(TypeError);
    });
  });

  describe('mocked provider', () => {
    it('renders edit button when user language is en', async () => {
      const { getByText } = render(
        createMockedProvider({
          // Add mock data here
        }),
        <EditPage sourceLocation={sourceLocation} />
      );
      expect(getByText('editPage')).toBeInTheDocument();
    });

    it('renders crowdin link when user language is not en', async () => {
      const { getByText } = render(
        createMockedProvider({
          // Add mock data here
        }),
        <EditPage sourceLocation={sourceLocation} userLanguage="pt" />
      );
      expect(getByText('pt-BR')).toBeInTheDocument();
    });
  });

  describe('snapshot test', () => {
    it('matches the expected snapshot', async () => {
      const { asFragment } = render(<EditPage sourceLocation={sourceLocation} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});