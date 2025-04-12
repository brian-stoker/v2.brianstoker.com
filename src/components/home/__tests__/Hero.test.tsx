import { render, fireEvent, waitFor } from '@testing-library/react';
import Hero from './Hero';

const createHero = (props: any) => {
  const globalTheme = { breakpoints: { up: 'md' } };
  return <Hero {...props} />;
};

describe('Hero component', () => {
  it('renders without crashing', async () => {
    render(createHero({ linearGradient: true }));
  });

  it('renders with correct layout for md and lg screens', async () => {
    const { getByText, getByRole } = render(createHero({
      linearGradient: true,
      rightSx: {
        p: 4,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden',
      },
    }));

    expect(getByText('Move faster')).toBeInTheDocument();
    expect(getByRole('img', { name: /gradient/i })).toBeInTheDocument();

    const button = getByRole('button', { name: /discover the core libraries/i });
    expect(button).toBeInTheDocument();

    const card1 = getByRole('region');
    expect(card1).toBeInTheDocument();

    const card2 = getByRole('region', { name: 'Theme Chip' });
    expect(card2).toBeInTheDocument();
  });

  it('renders with correct theme colors', async () => {
    const { getByText, queryByRole } = render(createHero({
      linearGradient: true,
      rightSx: {
        p: 4,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden',
        '& > div': {
          width: 360,
          display: 'inline-flex',
          verticalAlign: 'top',
          '&:nth-of-type(2)': {
            width: { xl: 400 },
          },
        },
      },
    }));

    const text = getByText('Move faster');
    expect(queryByRole('img', { name: /gradient/i })).not.toBeInTheDocument();

    const button = getByRole('button', { name: /discover the core libraries/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with correct card sizes for md and lg screens', async () => {
    const { queryByRole, getByText } = render(createHero({
      linearGradient: true,
      rightSx: {
        p: 4,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden',
        '& > div': {
          width: 360,
          display: 'inline-flex',
          verticalAlign: 'top',
          '&:nth-of-type(2)': {
            width: { xl: 400 },
          },
        },
      },
    }));

    const text = getByText('Move faster');
    expect(queryByRole('img', { name: /gradient/i })).not.toBeInTheDocument();

    const button = getByRole('button', { name: /discover the core libraries/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with correct card colors', async () => {
    const { queryByText, queryByRole } = render(createHero({
      linearGradient: true,
      rightSx: {
        p: 4,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden',
        '& > div': {
          width: 360,
          display: 'inline-flex',
          verticalAlign: 'top',
          '&:nth-of-type(2)': {
            width: { xl: 400 },
          },
        },
      },
    }));

    const text = queryByText(/Move faster/i);
    expect(queryByRole('img', { name: /gradient/i })).not.toBeInTheDocument();

    const button = queryByRole('button', { name: /discover the core libraries/i });
    expect(button).toBeInTheDocument();
  });

  it('calls useMediaQuery with correct breakpoint value', async () => {
    const globalTheme = { breakpoints: { up: 'md' } };
    const spyUseMediaQuery = jest.spyOn(globalTheme, 'useMediaQuery');
    const { rerender } = render(createHero({ linearGradient: true }));

    expect(spyUseMediaQuery).toHaveBeenCalledTimes(1);
  });

  it('calls useMediaQuery with correct breakpoint value', async () => {
    const globalTheme = { breakpoints: { up: 'lg' } };
    const spyUseMediaQuery = jest.spyOn(globalTheme, 'useMediaQuery');
    const { rerender } = render(createHero({ linearGradient: true }));

    expect(spyUseMediaQuery).toHaveBeenCalledTimes(1);
  });

  it('renders with correct card sizes when isMdUp is false', async () => {
    const spyIsMdUp = jest.spyOn({}, 'isMdUp');
    spyIsMdUp.mockReturnValue(false);

    const { queryByRole, getByText } = render(createHero({
      linearGradient: true,
      rightSx: {
        p: 4,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden',
        '& > div': {
          width: 360,
          display: 'inline-flex',
          verticalAlign: 'top',
          '&:nth-of-type(2)': {
            width: { xl: 400 },
          },
        },
      },
    }));

    const text = getByText('Move faster');
    expect(queryByRole('img', { name: /gradient/i })).not.toBeInTheDocument();

    const button = getByRole('button', { name: /discover the core libraries/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with correct card sizes when isMdUp is true', async () => {
    const spyIsMdUp = jest.spyOn({}, 'isMdUp');
    spyIsMdUp.mockReturnValue(true);

    const { queryByRole, getByText } = render(createHero({
      linearGradient: true,
      rightSx: {
        p: 4,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden',
        '& > div': {
          width: 360,
          display: 'inline-flex',
          verticalAlign: 'top',
          '&:nth-of-type(2)': {
            width: { xl: 400 },
          },
        },
      },
    }));

    const text = getByText('Move faster');
    expect(queryByRole('img', { name: /gradient/i })).not.toBeInTheDocument();

    const button = getByRole('button', { name: /discover the core libraries/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with correct card sizes when isMdUp and lg are true', async () => {
    const spyIsMdUp = jest.spyOn({}, 'isMdUp');
    spyIsMdUp.mockReturnValue(true);

    const spyIsLg = jest.spyOn({}, 'isLg');
    spyIsLg.mockReturnValue(true);

    const { queryByRole, getByText } = render(createHero({
      linearGradient: true,
      rightSx: {
        p: 4,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden',
        '& > div': {
          width: 360,
          display: 'inline-flex',
          verticalAlign: 'top',
          '&:nth-of-type(2)': {
            width: { xl: 400 },
          },
        },
      },
    }));

    const text = getByText('Move faster');
    expect(queryByRole('img', { name: /gradient/i })).not.toBeInTheDocument();

    const button = getByRole('button', { name: /discover the core libraries/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with correct card sizes when isMdUp and lg are false', async () => {
    const spyIsMdUp = jest.spyOn({}, 'isMdUp');
    spyIsMdUp.mockReturnValue(false);

    const spyIsLg = jest.spyOn({}, 'isLg');
    spyIsLg.mockReturnValue(false);

    const { queryByRole, getByText } = render(createHero({
      linearGradient: true,
      rightSx: {
        p: 4,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden',
        '& > div': {
          width: 360,
          display: 'inline-flex',
          verticalAlign: 'top',
          '&:nth-of-type(2)': {
            width: { xl: 400 },
          },
        },
      },
    }));

    const text = getByText('Move faster');
    expect(queryByRole('img', { name: /gradient/i })).not.toBeInTheDocument();

    const button = getByRole('button', { name: /discover the core libraries/i });
    expect(button).toBeInTheDocument();
  });

  it('calls useMediaQuery with correct breakpoint value when isMdUp and lg are false', async () => {
    const spyIsMdUp = jest.spyOn({}, 'isMdUp');
    spyIsMdUp.mockReturnValue(false);

    const spyIsLg = jest.spyOn({}, 'isLg');
    spyIsLg.mockReturnValue(false);

    const { rerender } = render(createHero({ linearGradient: true }));

    expect(spyUseMediaQuery).toHaveBeenCalledTimes(1);
  });
});