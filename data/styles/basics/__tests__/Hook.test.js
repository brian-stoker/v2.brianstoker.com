import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
  },
});

describe('Hook', () => {
  const Hook = React.memo(function Hook() {
    const classes = useStyles();
    return <Button className={classes.root}>Styled with Hook API</Button>;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Hook />);
    expect(container).not.toBeNull();
  });

  describe('Conditional Rendering', () => {
    it('renders Button when component is not null', () => {
      const { getByText } = render(<Hook />);
      expect(getByText('Styled with Hook API')).toBeInTheDocument();
    });

    it('does not render Button when component is null', () => {
      const { container, findByRole } = render(null);
      const button = findByRole('button');
      expect(button).toBeNull();
    });
  });

  describe('Props Validation', () => {
    it('throws an error if className prop is not a string', () => {
      expect(() => render(<Hook className={123} />)).toThrowError(
        'Invalid props: "className" expected a string value, received number',
      );
    });

    it('renders correctly when className prop is a valid string', () => {
      const { getByText } = render(<Hook className="custom-class" />);
      expect(getByText('Styled with Hook API')).toHaveClass('custom-class');
    });
  });

  describe('User Interactions', () => {
    let button;

    beforeEach(() => {
      button = render(<Hook />);
    });

    it('calls onClick event when clicked', () => {
      const onClickMock = jest.fn();
      const { getByText } = render(<Hook onClick={onClickMock} />);
      const element = getByText('Styled with Hook API');
      fireEvent.click(element);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick event when clicked but disabled', () => {
      const onClickMock = jest.fn();
      const { getByText } = render(<Hook onClick={onClickMock} disabled />);
      const element = getByText('Styled with Hook API');
      fireEvent.click(element);
      expect(onClickMock).not.toHaveBeenCalled();
    });
  });

  describe('State Changes', () => {
    it('sets className state when clicked', async () => {
      const classNameMock = jest.fn(() => 'new-class-name');
      const { getByText } = render(<Hook onClick={classNameMock} />);
      const element = getByText('Styled with Hook API');
      fireEvent.click(element);
      await waitFor(() => expect(classNameMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('Side Effects', () => {
    it('renders Button when component is not null', async () => {
      const { getByText } = render(<Hook />);
      await waitFor(() => expect(getByText('Styled with Hook API')).toBeInTheDocument());
    });

    it('does not render Button when component is null', async () => {
      const { container, findByRole } = render(null);
      await waitFor(() => expect(findByRole('button')).toBeNull());
    });
  });

  describe('Snapshot Test', () => {
    it('matches snapshot', () => {
      const { asFragment } = render(<Hook />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});