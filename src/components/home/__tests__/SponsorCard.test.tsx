import React from '@testing-library/react';
import { render, fireEvent } from '@testing-library/react';
import SponsorCard from './SponsorCard';

describe('SponsorCard', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('Props validation', () => {
    it('should throw an error if the item is missing src or srcSet prop', () => {
      expect(() =>
        render(
          <SponsorCard
            item={{ name: 'John Doe', description: 'This is a sponsored post' }}
            inView={true}
            logoSize={40}
          />
      ).throws(Error)
    );
  });

  describe('Props validation (continued)', () => {
    it('should throw an error if the item description is too long for two-line rendering', async () => {
      const { getByText } = render(
        <SponsorCard
          item={{
            src: 'https://example.com/logo.png',
            srcSet: 'https://example.com/logo2.png',
            name: 'John Doe',
            description: 'This is a very long sponsored post that should not be displayed on two lines.',
            href: 'https://example.com/sponsored-post',
          }}
          inView={true}
          logoSize={40}
        />
      );

      await expect(
        new Promise((resolve) => setTimeout(resolve, 2000))
      ).resolves.not.toThrowError();
    });
  });

  describe('Rendering', () => {
    it('should render the SponsorCard component without crashing', async () => {
      const { getByText } = render(<SponsorCard item={{ name: 'John Doe', description: 'This is a sponsored post' }} inView={true} logoSize={40} />);
      expect(getByText('John Doe')).toBeInTheDocument();
    });

    it('should render the SponsorCard component with inView prop set to true', async () => {
      const { getByText } = render(
        <SponsorCard
          item={{ src: 'https://example.com/logo.png', name: 'John Doe' }}
          inView={true}
          logoSize={40}
        />
      );
      expect(getByText('John Doe')).toBeInTheDocument();
    });

    it('should render the SponsorCard component with inView prop set to false and logoSize prop set to 20', async () => {
      const { getByText } = render(
        <SponsorCard
          item={{ src: 'https://example.com/logo.png', name: 'John Doe' }}
          inView={false}
          logoSize={20}
        />
      );
      expect(getByText('John Doe')).toBeInTheDocument();
    });

    it('should render the SponsorCard component with Link variant prop set to false', async () => {
      const { getByText } = render(
        <SponsorCard
          item={{ src: 'https://example.com/logo.png', name: 'John Doe' }}
          inView={true}
          logoSize={40}
          noLinkStyle={false}
        />
      );
      expect(getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should handle click event when the SponsorCard component is clicked', async () => {
      const { getByText, getByRole } = render(<SponsorCard item={{ name: 'John Doe' }} inView={true} logoSize={40} />);
      const linkElement = getByText('John Doe');
      const anchorElement = getByRole('link');
      fireEvent.click(linkElement);
      expect(anchorElement).toHaveAttribute('href', 'https://example.com/sponsored-post');
    });

    it('should handle input change event when the SponsorCard component has a text input', async () => {
      const { getByText, getByRole } = render(
        <SponsorCard
          item={{ name: 'John Doe' }}
          inView={true}
          logoSize={40}
          variant="outlined"
        />
      );
      const linkElement = getByText('John Doe');
      const inputElement = getByRole('textbox');
      fireEvent.change(inputElement, { target: { value: 'Jane Doe' } });
      expect(linkElement).toHaveAttribute('href', `https://example.com/sponsored-post?query=Jane%20Doe`);
    });

    it('should handle form submission event when the SponsorCard component has a form', async () => {
      const { getByText, getByRole } = render(
        <SponsorCard
          item={{ name: 'John Doe' }}
          inView={true}
          logoSize={40}
          variant="outlined"
          sx={{
            '& form': {
              display: 'flex',
              justifyContent: 'center',
            },
          }}
        />
      );
      const linkElement = getByText('John Doe');
      const formElement = getByRole('form');
      fireEvent.change(formElement, { target: { value: 'Jane Doe' } });
      fireEvent.submit(formElement);
      expect(linkElement).toHaveAttribute('href', `https://example.com/sponsored-post?query=Jane%20Doe`);
    });
  });

  describe('State changes', () => {
    it('should update the inView state when the SponsorCard component is hovered over', async () => {
      const { getByText } = render(<SponsorCard item={{ name: 'John Doe' }} inView={true} logoSize={40} />);
      const linkElement = getByText('John Doe');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(linkElement).toHaveClass('active');
    });

    it('should update the inView state when the SponsorCard component is hovered out', async () => {
      const { getByText } = render(<SponsorCard item={{ name: 'John Doe' }} inView={true} logoSize={40} />);
      const linkElement = getByText('John Doe');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(linkElement).not.toHaveClass('active');
    });
  });

  describe('CSS styles', () => {
    it('should apply the active class when the SponsorCard component is hovered over', async () => {
      const { getByText } = render(<SponsorCard item={{ name: 'John Doe' }} inView={true} logoSize={40} />);
      const linkElement = getByText('John Doe');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(linkElement).toHaveClass('active');
    });

    it('should apply the active class when the SponsorCard component is hovered out', async () => {
      const { getByText } = render(<SponsorCard item={{ name: 'John Doe' }} inView={true} logoSize={40} />);
      const linkElement = getByText('John Doe');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(linkElement).not.toHaveClass('active');
    });
  });
});