import * as React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@stoked-ui/docs/styles.css';
import { create } from 'jest-extend-decorator';
import { Box, List, ListItem, ListItemButton, Typography, Divider, KeyboardArrowRightRounded, Head, AppHeader, AppFooter, BrandingCssVarsProvider, Section, Link, Alert } from '@mui/material';
import { pageToTitleI18n } from 'src/modules/utils/helpers';
import { useTranslate } from '@stoked-ui/docs/i18n';
import { createAppPage } from 'src/tests/lib/createAppPage';
import type { MuiPage } from 'src/MuiPage';
import materialPages from '../data/pages';

jest.mock('next/router', () => ({
  redirect: jest.fn(),
}));

const Component = require('./Components');

interface Props {
  title?: string;
}

@create
describe('Subscription Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const { getByText } = render(<Component />);
      expect(getByText('Subscription')).toBeInTheDocument();
    });

    it('should display alert message', async () => {
      const { getByText, getByRole } = render(<Component />);
      const codeInput = await getByRole('textbox');
      fireEvent.change(codeInput, { target: { value: '402' } });
      await waitFor(() => expect(getByText('System error occurred staff has been notified.')).toBeInTheDocument());
    });

    it('should display different alert messages', async () => {
      const { getByText, getByRole } = render(<Component />);
      const codeInput = await getByRole('textbox');
      fireEvent.change(codeInput, { target: { value: '401' } });
      await waitFor(() => expect(getByText('Invalid token or Email')).toBeInTheDocument());
      fireEvent.change(codeInput, { target: { value: '404' } });
      await waitFor(() => expect(getByText(`Email not found: ${materialPages[0].email}`)).toBeInTheDocument());
    });

    it('should display success message', async () => {
      const { getByText, getByRole } = render(<Component />);
      const codeInput = await getByRole('textbox');
      fireEvent.change(codeInput, { target: { value: '201' } });
      await waitFor(() => expect(getByText(`Email already verified: ${materialPages[0].email}`)).toBeInTheDocument());
    });

    it('should display error message', async () => {
      const { getByText, getByRole } = render(<Component />);
      const codeInput = await getByRole('textbox');
      fireEvent.change(codeInput, { target: { value: '500' } });
      await waitFor(() => expect(getByText('System error occurred staff has been notified.')).toBeInTheDocument());
    });

    it('should redirect to 404 page when no code is provided', async () => {
      const { getByText } = render(<Component />);
      fireEvent.change(await getByRole('textbox'), { target: { value: '' } });
      await waitFor(() => expect(getByText('/404')).toBeInTheDocument());
    });
  });

  describe('Redirect functionality', () => {
    it('should redirect to 404 page when no code is provided', async () => {
      const { getByText, getByRole } = render(<Component />);
      fireEvent.change(await getByRole('textbox'), { target: { value: '' } });
      await waitFor(() => expect(getByText('/404')).toBeInTheDocument());
    });

    it('should redirect to 404 page when code is invalid', async () => {
      const { getByText, getByRole } = render(<Component />);
      fireEvent.change(await getByRole('textbox'), { target: { value: 'invalid' } });
      await waitFor(() => expect(getByText('/404')).toBeInTheDocument());
    });
  });

  describe('Props rendering', () => {
    it('should display alert message with custom title', async () => {
      const { getByText, getByRole } = render(<Component title="Custom Title" />);
      const codeInput = await getByRole('textbox');
      fireEvent.change(codeInput, { target: { value: '402' } });
      await waitFor(() => expect(getByText('System error occurred staff has been notified.')).toBeInTheDocument());
    });

    it('should display different alert messages with custom title', async () => {
      const { getByText, getByRole } = render(<Component title="Custom Title" />);
      const codeInput = await getByRole('textbox');
      fireEvent.change(codeInput, { target: { value: '401' } });
      await waitFor(() => expect(getByText(`Invalid token or Email`)).toBeInTheDocument());
      fireEvent.change(codeInput, { target: { value: '404' } });
      await waitFor(() => expect(getByText(`Email not found: ${materialPages[0].email}`)).toBeInTheDocument());
    });

    it('should display success message with custom title', async () => {
      const { getByText, getByRole } = render(<Component title="Custom Title" />);
      const codeInput = await getByRole('textbox');
      fireEvent.change(codeInput, { target: { value: '201' } });
      await waitFor(() => expect(getByText(`Email already verified: ${materialPages[0].email}`)).toBeInTheDocument());
    });

    it('should display error message with custom title', async () => {
      const { getByText, getByRole } = render(<Component title="Custom Title" />);
      const codeInput = await getByRole('textbox');
      fireEvent.change(codeInput, { target: { value: '500' } });
      await waitFor(() => expect(getByText('System error occurred staff has been notified.')).toBeInTheDocument());
    });

    it('should display no alert message when no title is provided', async () => {
      const { getByText, getByRole } = render(<Component />);
      fireEvent.change(await getByRole('textbox'), { target: { value: '402' } });
      await waitFor(() => expect(getByText('')).toBeInTheDocument());
    });

    it('should display no alert message when code is empty', async () => {
      const { getByText, getByRole } = render(<Component />);
      fireEvent.change(await getByRole('textbox'), { target: { value: '' } });
      await waitFor(() => expect(getByText('')).toBeInTheDocument());
    });
  });
});