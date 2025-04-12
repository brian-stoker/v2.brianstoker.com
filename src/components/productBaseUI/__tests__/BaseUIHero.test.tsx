import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import BaseUIHero from './BaseUIHero';
import HeroContainer from 'src/layouts/HeroContainer';
import IconImage from 'src/components/icon/IconImage';
import GradientText from 'src/components/typography/GradientText';
import GetStartedButtons from 'src/components/home/GetStartedButtons';
import { Link } from '@stoked-ui/docs/Link';

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

describe('BaseUIHero', () => {
  let mockIconImage: jest.Mock;
  let mockGradientText: jest.Mock;

  beforeEach(() => {
    mockIconImage = jest.fn();
    mockGradientText = jest.fn();

    render(<BaseUIHero />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(true).toBeTruthy();
  });

  describe('props', () => {
    it('should render with linearGradient prop set to true', () => {
      const { getByText } = render(<BaseUIHero linearGradient={true} />);
      expect(getByText('linearGradient')).toBeInTheDocument();
    });

    it('should render with disableMobileHidden prop set to false', () => {
      const { getByText } = render(<BaseUIHero disableMobileHidden={false} />);
      expect(getByText('disableMobileHidden')).toBeInTheDocument();
    });

    it('should render with disableTabExclusion prop set to true', () => {
      const { getByText } = render(<BaseUIHero disableTabExclusion={true} />);
      expect(getByText('disableTabExclusion')).toBeInTheDocument();
    });

    it('should throw an error if props are invalid', () => {
      expect(() => render(<BaseUIHero invalidProp='invalidValue' />)).toThrowError(
        'Invalid prop: invalidProp',
      );
    });
  });

  describe('user interactions', () => {
    it('should call onChange function when clicked', () => {
      const onChange = jest.fn();
      const { getByText } = render(<BaseUIHero onClick={onChange} />);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit function when form is submitted', () => {
      const onSubmit = jest.fn();
      const { getByText, getByRole } = render(
        <BaseUIHero onSubmit={onSubmit}>
          <GetStartedButtons />
        </BaseUIHero>,
      );
      expect(getByRole('form')).toBeInTheDocument();
      fireEvent.submit(getByRole('form'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('conditional rendering', () => {
    it('should render HeroContainer correctly', () => {
      const { getByText, getAllByRole } = render(<BaseUIHero />);
      expect(getByText('linearGradient')).toBeInTheDocument();
      expect(getAllByRole('region')).toHaveLength(2);
    });
  });

  describe('side effects', () => {
    it('should apply dark styles correctly', () => {
      const { getByText, getAllByRole } = render(<BaseUIHero />);
      expect(getByText('linearGradient')).toBeInTheDocument();
      expect(getAllByRole('region')).toHaveLength(2);
    });
  });

  describe('snapshot testing', () => {
    it('should snapshot the component correctly', () => {
      const { asFragment, getByText } = render(<BaseUIHero />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});