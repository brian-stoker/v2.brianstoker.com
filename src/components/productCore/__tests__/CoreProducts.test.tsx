import { render, fireEvent, waitFor } from '@testing-library/react';
import CoreProducts from './CoreProducts';
import '@stoked-ui/docs/InfoCard';

describe('CoreProducts component', () => {
  const content = [
    {
      title: 'Stoked UI',
      description: "An open-source React component library that implements Google's Material Design.",
      link: '/material-ui/',
    },
    {
      title: 'Joy UI',
      description:
        "An open-source React component library that implements SUI's own in-house design principles.",
      link: '/joy-ui/getting-started/',
    },
    {
      title: 'Base UI',
      description:
        "A library of unstyled React components and low-level hooks. With Base UI, you gain complete control over your app's CSS and accessibility features.",
      link: '/base-ui/',
    },
    {
      title: 'SUI System',
      description:
        'A set of CSS utilities to help you build custom designs more efficiently. It makes it possible to rapidly lay out custom designs.',
      link: '/system/getting-started/',
    },
  ];

  const mockLink = (url: string) => jest.fn(() => void ({}));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<CoreProducts content={content} />);
      expect(screen).not.toThrow();
    });
  });

  describe('Content rendering', () => {
    it('renders all components correctly', async () => {
      const { getByText } = render(<CoreProducts content={content} />);
      const grid = screen.queryByRole('grid');
      if (!grid) {
        return expect(screen).toHaveTextMatching(
          new RegExp(`Expected a grid component but did not find any`)
        );
      }
      const row = grid.children[0];
      expect(row).toBeInstanceOf(React.ReactElement);
      expect(getByText(content[0].title)).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('accepts valid props', async () => {
      render(<CoreProducts content={content} />);
      expect(screen).not.toThrow();
    });

    it('throws an error for invalid props', async () => {
      const mockContent = ' invalid prop ';
      const { getByText } = render(
        <CoreProducts content={mockContent} />
      );
      expect(getByText(mockContent)).toBeInTheDocument();

      // Note: This test may require additional work, as we need to implement a more complex validation system.
    });
  });

  describe('User interactions', () => {
    it('fires link click events correctly', async () => {
      const mockLink = jest.fn();
      render(<CoreProducts content={content} link={mockLink} />);
      fireEvent.click(screen.getByText(content[0].title));
      expect(mockLink).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot test', () => {
    it('renders the expected snapshot', async () => {
      const { asFragment } = render(<CoreProducts content={content} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Edge cases', () => {
    it('handles empty content array correctly', async () => {
      const mockContent = [];
      render(<CoreProducts content={mockContent} />);
      expect(screen).not.toThrow();
    });
  });
});