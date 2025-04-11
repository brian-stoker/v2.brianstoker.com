import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SponsorCard from './SponsorCard';

describe('SponsorCard component', () => {
  const item = {
    src: 'https://example.com/logo.png',
    srcSet: 'https://example.com/logo@2x.png, https://example.com/logo@3x.png',
    name: 'Example Sponsor',
    description: 'This is a very long description that should not be displayed.',
    href: 'https://stoked-ui.com/sponsors/example',
  };

  const inView = true;
  const logoSize = 40;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<SponsorCard item={item} inView={inView} logoSize={logoSize} />);
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders description correctly when it fits within two lines', async () => {
      const wrapper = render(<SponsorCard item={item} inView={inView} logoSize={40} />);
      const paperElement = wrapper.container.querySelector('paper');
      expect(paperElement).toHaveStyle('max-height: 100%');
    });

    it('throws error when description is too long for two-line rendering', async () => {
      const wrapper = render(<SponsorCard item={{ ...item, description: 'This is a very long description that should not be displayed.' }} inView={inView} logoSize={40} />);
      expect(() => wrapper.container.querySelector('paper')).toThrowError();
    });
  });

  describe('Props', () => {
    it('accepts required props', () => {
      const wrapper = render(<SponsorCard item={item} inView={inView} logoSize={logoSize} />);
      expect(wrapper.props.item).toEqual(item);
      expect(wrapper.props.inView).toBe(inView);
      expect(wrapper.props.logoSize).toBe(logoSize);
    });

    it('throws error when no required props are provided', () => {
      const wrapper = render(<SponsorCard inView={inView} logoSize={logoSize} />);
      expect(() => wrapper.container.querySelector('paper')).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('links to the href when clicked', async () => {
      const wrapper = render(<SponsorCard item={item} inView={inView} logoSize={logoSize} />);
      const linkElement = wrapper.container.querySelector('a');
      fireEvent.click(linkElement);
      expect(window.location.href).toBe(item.href);
    });

    it('calls target="_blank" when linked', async () => {
      const wrapper = render(<SponsorCard item={item} inView={inView} logoSize={logoSize} />);
      const linkElement = wrapper.container.querySelector('a');
      fireEvent.click(linkElement);
      expect(window.open).toHaveBeenCalledTimes(1);
    });

    it('calls rel="sponsored noopener" when linked', async () => {
      const wrapper = render(<SponsorCard item={item} inView={inView} logoSize={logoSize} />);
      const linkElement = wrapper.container.querySelector('a');
      fireEvent.click(linkElement);
      expect(window.open).toHaveBeenCalledWith(item.href, '', 'rel=sponsored noopener');
    });

    it('calls data-ga-event when linked', async () => {
      const wrapper = render(<SponsorCard item={item} inView={inView} logoSize={logoSize} />);
      const linkElement = wrapper.container.querySelector('a');
      fireEvent.click(linkElement);
      expect(window.gtag).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Changes', () => {
    it('updates the src and srcSet props when inView is true', async () => {
      const wrapper = render(<SponsorCard item={item} inView={false} logoSize={logoSize} />);
      expect(wrapper.props.item.src).toBe(item.src);
      expect(wrapper.props.item.srcSet).toBe(item.srcSet);
      wrapper.container.dispatchEvent(new Event('componentDidMount'));
      await new Promise(resolve => setTimeout(resolve));
      expect(wrapper.props.item.src).not.toBe(item.src);
      expect(wrapper.props.item.srcSet).not.toBe(item.srcSet);
    });

    it('does not update the src and srcSet props when inView is false', async () => {
      const wrapper = render(<SponsorCard item={item} inView={false} logoSize={logoSize} />);
      expect(wrapper.props.item.src).toBe(item.src);
      expect(wrapper.props.item.srcSet).toBe(item.srcSet);
    });
  });

  describe('Snapshots', () => {
    it('renders correctly when rendered with valid props', async () => {
      const wrapper = render(<SponsorCard item={item} inView={inView} logoSize={logoSize} />);
      expect(wrapper.asQueryByRole('link')).toMatchSnapshot();
      expect(wrapper.asQueryByRole('img')).toMatchSnapshot();
    });
  });
});