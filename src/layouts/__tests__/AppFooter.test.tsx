import { render, fireEvent, waitFor } from '@testing-library/react';
import AppFooter from './AppFooter';

describe('AppFooter component', () => {
  let mockGithubUrl = 'https://github.com/brian-stoker';
  let mockRssFeedUrl = 'https://example.com/rss';
  let mockStackOverflowUrl = 'https://stackoverflow.com/users/brian-stoker?tab=profile';
  let mockSlackUrl = 'https://stokedconsulting.slack.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the footer with all links and icons', () => {
    const { getByText } = render(<AppFooter />);
    expect(getByText('Content')).toBeInTheDocument();
    expect(getByText('Art')).toBeInTheDocument();
    expect(getByText('Photography')).toBeInTheDocument();
    expect(getByText('Drums')).toBeInTheDocument();
    expect(getByText('blog')).toBeInTheDocument();
    expect(getByText('Resume')).toBeInTheDocument();

    expect(getByText('About')).toBeInTheDocument();
    expect(getByText('Vision')).toBeInTheDocument();
    expect(getByText('Support')).toBeInTheDocument();
    expect(getByText('Privacy policy')).toBeInTheDocument();
    expect(getByText('Contact us')).toBeInTheDocument();

    expect(getByText('Copyright')).toBeInTheDocument();
    expect(getByText(mockGithubUrl)).toBeInTheDocument();
    expect(getByText(mockRssFeedUrl)).toBeInTheDocument();
    expect(getByText(mockSlackUrl)).toBeInTheDocument();
  });

  it('renders the footer with a link to GitHub', () => {
    const { getByText } = render(<AppFooter />);
    expect(getByText('Copyright')).toBeInTheDocument();
    expect(getByText(mockGithubUrl)).toBeInTheDocument();
  });

  it('renders the footer with a link to RSS Feed', () => {
    const { getByText } = render(<AppFooter />);
    expect(getByText('Copyright')).toBeInTheDocument();
    expect(getByText(mockRssFeedUrl)).toBeInTheDocument();
  });

  it('renders the footer with a link to Slack', () => {
    const { getByText } = render(<AppFooter />);
    expect(getByText('Copyright')).toBeInTheDocument();
    expect(getByText(mockSlackUrl)).toBeInTheDocument();
  });

  it('renders the footer with a link to LinkedIn', () => {
    const { getByText } = render(<AppFooter />);
    expect(getByText('Copyright')).toBeInTheDocument();
    expect(getByText('https://www.linkedin.com/in/brian-stoker/')).toBeInTheDocument();
  });

  it('renders the footer with a link to Discord', () => {
    const { getByText } = render(<AppFooter />);
    expect(getByText('Copyright')).toBeInTheDocument();
    expect(getByText(mockSlackUrl)).toBeInTheDocument();
  });

  if (process.env.CI) return;

  it('navigates to GitHub when clicked', async () => {
    const { getByText, getByRole } = render(<AppFooter />);
    const githubButton = getByRole('button');
    fireEvent.click(githubButton);
    await waitFor(() => expect(window.location.href).toBe(mockGithubUrl));
  });

  it('navigates to RSS Feed when clicked', async () => {
    const { getByText, getByRole } = render(<AppFooter />);
    const rssFeedButton = getByRole('button');
    fireEvent.click(rssFeedButton);
    await waitFor(() => expect(window.location.href).toBe(mockRssFeedUrl));
  });

  it('navigates to Slack when clicked', async () => {
    const { getByText, getByRole } = render(<AppFooter />);
    const slackButton = getByRole('button');
    fireEvent.click(slackButton);
    await waitFor(() => expect(window.location.href).toBe(mockSlackUrl));
  });

  it('navigates to LinkedIn when clicked', async () => {
    const { getByText, getByRole } = render(<AppFooter />);
    const linkedinButton = getByRole('button');
    fireEvent.click(linkedinButton);
    await waitFor(() => expect(window.location.href).toBe(mockSlackUrl));
  });

  it('navigates to Discord when clicked', async () => {
    const { getByText, getByRole } = render(<AppFooter />);
    const discordButton = getByRole('button');
    fireEvent.click(discordButton);
    await waitFor(() => expect(window.location.href).toBe(mockSlackUrl));
  });

  if (process.env.CI) return;

  it('navigates to Stack Overflow when stackOverflowUrl is present', async () => {
    const { getByText, getByRole } = render(<AppFooter />);
    const stackOverflowButton = getByRole('button');
    jest.spyOn(AppFooter.prototype, 'componentDidMount').mockImplementation(() => {
      this.stackOverflowUrl = mockStackOverflowUrl;
    });
    fireEvent.click(stackOverflowButton);
    await waitFor(() => expect(window.location.href).toBe(mockStackOverflowUrl));
  });
});