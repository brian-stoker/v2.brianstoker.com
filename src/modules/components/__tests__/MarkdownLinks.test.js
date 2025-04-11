import { render, screen } from '@testing-library/react';
import { Router } from 'next/router';
import { pathnameToLanguage } from 'src/modules/utils/helpers';

describe('MarkdownLinks component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.removeEventListener('click', handleClick);
    document.removeEventListener('mouseover', handleMouseOver);
  });

  const MockLink = ({ children, href }) => (
    <a href={href}>{children}</a>
  );

  let handleMouseOverMock;
  let handleClickMock;

  beforeEach(() => {
    handleMouseOverMock = jest.fn();
    handleClickMock = jest.fn();

    document.addEventListener('mouseover', handleMouseOverMock);
    document.addEventListener('click', handleClickMock);

    Router.prefetch = jest.fn().mockResolvedValue(Promise.resolve());
  });

  it('renders without crashing', () => {
    render(<MarkdownLinks />);
    expect(screen.queryByText('')).not.toBeNull();
  });

  describe('handleClick prop', () => {
    it('should prevent default link behavior for same page links', () => {
      document.body.innerHTML = '<a href="/page">Link</a>';
      const link = screen.getByText('Link');
      link.click();
      expect(handleClickMock).toHaveBeenCalledTimes(1);
    });

    it('should not prevent default link behavior for different pages', () => {
      document.body.innerHTML = '<a href="https://example.com">External Link</a>';
      const link = screen.getByText('External Link');
      link.click();
      expect(handleClickMock).not.toHaveBeenCalled();
    });
  });

  describe('handleMouseOver prop', () => {
    it('should prefetch JSON page when user hovers over a link', () => {
      document.body.innerHTML = '<a href="/page">Link</a>';
      const link = screen.getByText('Link');
      link:hover();
      expect(handleMouseOverMock).toHaveBeenCalledTimes(1);
      expect(Router.prefetch).toHaveBeenCalledTimes(1);
    });

    it('should not prefetch JSON page when user hovers over an external link', () => {
      document.body.innerHTML = '<a href="https://example.com">External Link</a>';
      const link = screen.getByText('External Link');
      link:hover();
      expect(handleMouseOverMock).toHaveBeenCalledTimes(1);
      expect(Router.prefetch).not.toHaveBeenCalled();
    });
  });

  describe('conditional rendering', () => {
    it('should render nothing when no links are found', () => {
      document.body.innerHTML = '<div>No links here</div>';
      const link = screen.getByText('Link');
      link.click();
      expect(screen.queryByText('')).not.toBeNull();
    });
  });

  describe('prop validation', () => {
    it('should throw an error when no handles are provided', () => {
      document.body.innerHTML = '<a href="/page">Link</a>';
      const link = screen.getByText('Link');
      expect(() => render(<MarkdownLinks />)).toThrowError();
    });

    it('should not throw an error when handles are provided', () => {
      document.body.innerHTML = '<a href="/page">Link</a>';
      const link = screen.getByText('Link');
      expect(() => render(<MarkdownLinks handleClick={handleClick} handleMouseOver={handleMouseOver} />)).not.toThrowError();
    });
  });

  describe('snapshots', () => {
    it('should snapshot the component in its default state', () => {
      const tree = render(<MarkdownLinks />);
      expect(tree).toMatchSnapshot();
    });

    it('should snapshot the component with handles when no links are found', () => {
      document.body.innerHTML = '<div>No links here</div>';
      const link = screen.getByText('');
      expect(render(<MarkdownLinks />)).toMatchSnapshot();
    });
  });
});