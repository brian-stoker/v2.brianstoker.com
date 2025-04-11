import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Head from './Head.test.tsx';
import { useRouter } from 'next/router';
import { LANGUAGES_SSR } from 'config';
import { useUserLanguage, useTranslate } from '@stoked-ui/docs/i18n';
import { pathnameToLanguage } from 'src/modules/utils/helpers';

jest.mock('next/head');
jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/' }),
}));

describe('Head component', () => {
  it('renders without crashing', async () => {
    const { getByText } = render(<Head />);
    expect(getByText('Head Title')).toBeInTheDocument();
  });

  it('renders all conditional rendering paths', async () => {
    const { getByText } = render(<Head disableAlternateLocale={true} />);
    expect(getByText('HEAD_TITLE')).toBeInTheDocument();

    const { getByText } = render(<Head disableAlternateLocale={false} />);
    expect(getByText('Head Title')).toBeInTheDocument();
  });

  it('tests prop validation', async () => {
    const { getByText } = render(<Head title="test title" description="test description" />);
    expect(getByText('test title')).toBeInTheDocument();
    expect(getByText('test description')).toBeInTheDocument();

    const { getByText, getByRole } = render(
      <Head
        title="test title"
        description={null}
        lang="en-US"
        children={<button />}
      />,
    );
    expect(getByText('test title')).toBeInTheDocument();
    expect(getByRole('button')).toBeInTheDocument();

    const { getByText } = render(<Head title={null} description="test description" />);
    expect(getByText('test description')).toBeInTheDocument();
  });

  it('tests user interactions', async () => {
    const { getByText, getByRole } = render(<Head title="test title" description="test description" />);

    const button = getByRole('button');
    fireEvent.click(button);
    await waitFor(() => expect(getByText('Head Title')).toBeInTheDocument());

    const link = document.querySelector('a') as HTMLAnchorElement;
    fireEvent.click(link);
    await waitFor(() => expect(getByText('Head Title')).toBeInTheDocument());
  });

  it('tests side effects', async () => {
    const { getByText } = render(<Head title="test title" description="test description" />);

    const button = document.querySelector('button') as HTMLButtonElement;
    fireEvent.click(button);
    await waitFor(() => expect(getByText('test title')).toBeInTheDocument());
  });

  it('renders with custom logo css', async () => {
    const { getByText } = render(<Head logoCss=".stoked-font" />);
    expect(document.body.style).toContain('.stoked-font');
  });
});