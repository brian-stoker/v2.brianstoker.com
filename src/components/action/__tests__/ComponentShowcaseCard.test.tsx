import React from 'react';
import '@stoked-ui/docs/Link';
import { alpha } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { createMemoryHistory, createBrowserHistory } from 'history';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ComponentShowcaseCard } from './ComponentShowcaseCard';

describe('Component Showcase Card', () => {
  const props = {
    link: '/',
    srcLight: '/src-light.jpg',
    srcDark: '/src-dark.jpg',
    name: 'Test Name',
    md1: <Chip label="MD1" size="small" variant="outlined" color="primary" />,
    md2: null,
    md3: null,
    noGuidelines: <Chip label="No guidelines" size="small" variant="outlined" color="info" />,
  };

  const history = createBrowserHistory();

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(
      render(<ComponentShowcaseCard {...props} />),
    ).not.toThrow();
  });

  describe('link prop validation', () => {
    const invalidLink = '/invalid-link';

    it('should throw an error when link is empty', () => {
      expect(() => <ComponentShowcaseCard {...props} link={''} />).toThrow();
    });

    it('should throw an error when link is undefined', () => {
      expect(() => <ComponentShowcaseCard {...props} link={undefined} />).toThrow();
    });

    it('should not throw an error when link is valid', () => {
      expect(() => <ComponentShowcaseCard {...props} link={invalidLink} />).not.toThrow();
    });
  });

  describe('conditional rendering', () => {
    const noGuidelines = true;
    const md2Only = true;

    it('should render when all props are present', () => {
      expect(
        render(<ComponentShowcaseCard {...props} md2={md2Only} />),
      ).toMatchSnapshot();
    });

    it('should not render when md2 prop is undefined', () => {
      expect(
        render(<ComponentShowcaseCard {...props} md2={undefined} />),
      ).not.toMatchSnapshot();
    });
  });

  describe('user interactions', () => {
    const history = createBrowserHistory();

    it('should navigate to link on click', async () => {
      const { getByText } = render(<ComponentShowcaseCard {...props} />);
      const card = getByText(props.name);

      fireEvent.click(card);

      await waitFor(() => expect(history.location.pathname).toBe('/'));
    });

    it('should handle input changes for name prop', async () => {
      const { getByLabelText, getByRole } = render(<ComponentShowcaseCard {...props} />);
      const inputField = getByRole('textbox');
      const chipContainer = getByText(props.name);

      fireEvent.change(inputField, { target: { value: 'New Name' } });

      expect(chipContainer).toHaveTextContent('New Name');
    });
  });
});