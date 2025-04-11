import { render, fireEvent } from '@testing-library/react';
import MaterialNavigationComponents from './MaterialNavigationComponents.test.js';
import ComponentShowcaseCard from 'src/components/action/ComponentShowcaseCard';

describe('Material Navigation Components', () => {
  const navigationComponents = [
    // Add your navigation components here
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MaterialNavigationComponents />);
    expect(() => render(<MaterialNavigationComponents />)).not.toThrowError();
  });

  describe('Conditional Rendering', () => {
    it('should render ComponentShowcaseCard component when link prop is present', () => {
      const mockComponentShowcaseCard = jest.fn();
      render(
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {navigationComponents.map(
            ({ name, link, ...props }) =>
              props.link ? (
                <ComponentShowcaseCard {...props} key={name} />
              ) : null,
          )}
        </Grid>,
      );
      expect(mockComponentShowcaseCard).toHaveBeenCalledTimes(navigationComponents.length);
    });

    it('should not render ComponentShowcaseCard component when link prop is absent', () => {
      const mockComponentShowcaseCard = jest.fn();
      render(
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {navigationComponents.map(({ name, ...props }) =>
            !props.link ? (
              <ComponentShowcaseCard {...props} key={name} />
            ) : null,
          )}
        </Grid>,
      );
      expect(mockComponentShowcaseCard).not.toHaveBeenCalled();
    });
  });

  describe('Prop Validation', () => {
    it('should validate link prop when present', () => {
      const mockComponentShowcaseCard = jest.fn();
      render(
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {navigationComponents.map(({ name, link }) =>
            link ? (
              <ComponentShowcaseCard link={link} key={name} />
            ) : null,
          )}
        </Grid>,
      );
      expect(mockComponentShowcaseCard).toHaveBeenCalledTimes(navigationComponents.length);
    });

    it('should not validate link prop when absent', () => {
      const mockComponentShowcaseCard = jest.fn();
      render(
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {navigationComponents.map(({ name }) =>
            !name ? null : (
              <ComponentShowcaseCard key={name} />
            ),
          )}
        </Grid>,
      );
      expect(mockComponentShowcaseCard).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should handle click event for ComponentShowcaseCard component', () => {
      const mockComponentShowcaseCard = jest.fn();
      render(
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {navigationComponents.map(({ name, link }) =>
            link ? (
              <ComponentShowcaseCard
                onClick={() => console.log('Clicked')}
                key={name}
                link={link}
              />
            ) : null,
          )}
        </Grid>,
      );
      const component = render(
        <ComponentShowcaseCard
          link={'https://www.example.com'}
          onClick={() => console.log('Clicked')}
        />,
      ).container;
      fireEvent.click(component);
      expect(mockComponentShowcaseCard).toHaveBeenCalledTimes(1);
    });

    it('should handle input change event for ComponentShowcaseCard component', () => {
      const mockComponentShowcaseCard = jest.fn();
      render(
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {navigationComponents.map(({ name, link }) =>
            link ? (
              <ComponentShowcaseCard
                onChange={(e) => console.log('Changed')}
                key={name}
                link={link}
              />
            ) : null,
          )}
        </Grid>,
      );
      const component = render(
        <ComponentShowcaseCard
          link={'https://www.example.com'}
          onChange={(e) => console.log('Changed')}
        />,
      ).container;
      fireEvent.change(component, { target: { value: 'new value' } });
      expect(mockComponentShowcaseCard).toHaveBeenCalledTimes(1);
    });

    it('should handle hover event for ComponentShowcaseCard component', () => {
      const mockComponentShowcaseCard = jest.fn();
      render(
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {navigationComponents.map(({ name, link }) =>
            link ? (
              <ComponentShowcaseCard
                onMouseOver={() => console.log('Hovered')}
                key={name}
                link={link}
              />
            ) : null,
          )}
        </Grid>,
      );
      const component = render(
        <ComponentShowcaseCard
          link={'https://www.example.com'}
          onMouseOver={() => console.log('Hovered')}
        />,
      ).container;
      fireEvent.mouseOver(component);
      expect(mockComponentShowcaseCard).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should render ComponentShowcaseCard component with accessible props', () => {
      const mockComponentShowcaseCard = jest.fn();
      render(
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {navigationComponents.map(({ name, link }) =>
            link ? (
              <ComponentShowcaseCard
                accessibility="visible"
                key={name}
                link={link}
              />
            ) : null,
          )}
        </Grid>,
      );
      expect(mockComponentShowcaseCard).toHaveBeenCalledTimes(navigationComponents.length);
    });
  });
});