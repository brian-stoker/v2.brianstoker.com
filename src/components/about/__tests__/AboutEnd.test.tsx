import '@stoked-ui/docs/tests';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AboutEnd from './AboutEnd';

describe('AboutEnd component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AboutEnd />);
    expect(container).toBeInTheDocument();
  });

  describe('SectionHeadline prop', () => {
    const alwaysCenter = true;
    const overline = 'Join us';
    const title = <Typography variant="h2">Test Title</Typography>;
    const description = 'This is a test description';

    it('renders with correct content', () => {
      const { getByText } = render(<AboutEnd SectionHeadline={SectionHeadline} alwaysCenter={alwaysCenter} overline={overline} title={title} description={description} />);
      expect(getByText(overline)).toBeInTheDocument();
      expect(getByText(title.toString())).toBeInTheDocument();
    });

    it('renders with correct styles', () => {
      const { getByText } = render(<AboutEnd SectionHeadline={SectionHeadline} alwaysCenter={alwaysCenter} overline={overline} title={title} description={description} />);
      expect(getByText(overline)).toHaveStyle({ 'text-align': 'center' });
    });

    it('throws an error if prop is missing', () => {
      const { stderr } = render(<AboutEnd />);
      expect(stderr).toContain('SectionHeadline is required');
    });
  });

  describe('Button prop', () => {
    const href = ROUTES.careers;

    it('renders with correct content and styles', () => {
      const { getByText, getByRole } = render(<AboutEnd Button={Button} component={Link} noLinkStyle href={href} />);
      expect(getByText('View careers')).toBeInTheDocument();
      expect(getByRole('button')).toHaveAttribute('href', href);
    });

    it('redirects to the correct URL when clicked', () => {
      const { getByText, getByRole } = render(<AboutEnd Button={Button} component={Link} noLinkStyle href={href} />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(window.location.href).toBe(href);
    });
  });

  describe('GradientText prop', () => {
    it('renders with correct styles', () => {
      const { getByText } = render(<AboutEnd GradientText="Test Text" />);
      expect(getByText('Test Text')).toHaveStyle({ 'font-family': 'inherit' });
    });
  });

  describe('Section prop', () => {
    it('renders with correct background and padding styles', () => {
      const { getByRole } = render(<AboutEnd Section={{ bg: 'gradient', p: { sm: 8 } }} />);
      expect(getByRole('region')).toHaveStyle({ 'background-color': 'gradient' });
    });

    it('throws an error if prop is missing', () => {
      const { stderr } = render(<AboutEnd />);
      expect(stderr).toContain('Section is required');
    });
  });

  describe('Link component prop', () => {
    const href = ROUTES.careers;

    it('renders with correct content and styles', () => {
      const { getByText, getByRole } = render(<AboutEnd Link={Link} noLinkStyle href={href} />);
      expect(getByText('View careers')).toBeInTheDocument();
      expect(getByRole('link')).toHaveAttribute('href', href);
    });

    it('renders with correct content and styles when noLinkStyle is provided', () => {
      const { getByText, getByRole } = render(<AboutEnd Link={Link} noLinkStyle href={href} />);
      expect(getByText('View careers')).toBeInTheDocument();
      expect(getByRole('link')).toHaveAttribute('style', 'no-link-style');
    });
  });

  describe('SectionHeadline styles', () => {
    const alwaysCenter = true;

    it('renders with correct styles when alwaysCenter is true', () => {
      const { getByText } = render(<AboutEnd SectionHeadline={SectionHeadline} alwaysCenter={alwaysCenter} overline="Join us" title={<Typography variant="h2">Test Title</Typography>} description="This is a test description" />);
      expect(getByText(overline)).toHaveStyle({ 'text-align': 'center' });
    });

    it('throws an error if prop is missing', () => {
      const { stderr } = render(<AboutEnd />);
      expect(stderr).toContain('alwaysCenter is required');
    });
  });

  describe('Section styles', () => {
    const bg = 'gradient';

    it('renders with correct background style when bg is provided', () => {
      const { getByRole } = render(<AboutEnd Section={{ bg, p: { sm: 8 } }} />);
      expect(getByRole('region')).toHaveStyle({ 'background-color': bg });
    });

    it('throws an error if prop is missing', () => {
      const { stderr } = render(<AboutEnd />);
      expect(stderr).toContain('bg is required');
    });
  });

  describe('Button styles', () => {
    it('renders with correct width style when width is provided', () => {
      const { getByText, getByRole } = render(<AboutEnd Button={Button} component={Link} noLinkStyle href={ROUTES.careers} />);
      expect(getByText('View careers')).toBeInTheDocument();
      expect(getByRole('button')).toHaveAttribute('style', 'width: fit-content');
    });

    it('throws an error if prop is missing', () => {
      const { stderr } = render(<AboutEnd />);
      expect(stderr).toContain('noLinkStyle is required');
    });
  });
});