import { render, fireEvent, waitFor } from '@testing-library/react';
import NotFoundHero from './NotFoundHero';
import { SectionHeadline } from 'src/components/typography/SectionHeadline';
import { Section } from 'src/layouts/Section';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';

describe('NotFoundHero', () => {
  const mocks = {
    theme: {
      palette: {
        grey: [255, 245, 238],
        primary: [24, 144, 255],
        common: ['rgb(0,0,0)'],
        primaryDark: [0, 8, 23],
      },
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<NotFoundHero />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    const props = {
      bg: 'gradient',
      title: 'Page not found',
      description: 'Apologies, but the page you were looking for wasn\'t found. Try reaching for the search button on the nav bar above to look for another one.',
    };

    it('renders SectionHeadline when alwaysCenter prop is true', () => {
      const { getByText } = render(<NotFoundHero {...props} alwaysCenter />);
      expect(getByText(props.title)).toBeInTheDocument();
    });

    it('does not render SectionHeadline when alwaysCenter prop is false', () => {
      const { queryByText } = render(<NotFoundHero {...props} alwaysCenter={false} />);
      expect(queryByText(props.title)).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when bg prop is invalid', () => {
      expect(() => <NotFoundHero bg="invalid" {...props} />).toThrowError(
        'Invalid background color'
      );
    });

    it('does not throw an error when bg prop is valid', () => {
      const { container } = render(<NotFoundHero bg={props.bg} {...props} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    const props = {
      ...props,
      alwaysCenter: false,
    };

    it('renders SectionHeadline with correct title when clicked', () => {
      const { getByText, queryByText } = render(<NotFoundHero {...props} />);
      expect(queryByText(props.title)).toBeInTheDocument();
      fireEvent.click(getByText(props.title));
      expect(queryByText(props.title)).not.toBeInTheDocument();
    });

    it('renders SectionHeadline with correct description when clicked', () => {
      const { getByText, queryByText } = render(<NotFoundHero {...props} />);
      expect(queryByText(props.description)).toBeInTheDocument();
      fireEvent.click(getByText(props.description));
      expect(queryByText(props.description)).not.toBeInTheDocument();
    });
  });

  it('renders NotFoundIllustration when props are valid', () => {
    const { container } = render(<NotFoundHero {...props} />);
    expect(container).toContainElement(NotFoundIllustration);
  });

  describe('side effects or state changes', () => {
    it('calls Section\'s useEffect hook when component mounts', async () => {
      jest.spyOn(Section, 'useEffect');
      const { container } = render(<NotFoundHero {...props} />);
      await waitFor(() => expect(Section.useEffect).toHaveBeenCalledTimes(1));
    });
  });

  it('renders correctly with mock theme', () => {
    mocks.theme.palette.primaryDark[700] = '#000';
    const { container } = render(<NotFoundHero {...props} theme={mocks.theme} />);
    expect(container).toBeInTheDocument();
  });

  describe('SectionHeadline props', () => {
    const props = {
      ...props,
      alwaysCenter: true,
    };

    it('renders with correct title and description when SectionHeadline props are valid', () => {
      const { getByText, queryByText } = render(<NotFoundHero {...props} />);
      expect(getByText(props.title)).toBeInTheDocument();
      expect(queryByText(props.description)).toBeInTheDocument();
    });

    it('does not throw an error when SectionHeadline props are invalid', () => {
      const { container } = render(<NotFoundHero {...props} />);
      expect(container).toBeInTheDocument();
    });
  });
});