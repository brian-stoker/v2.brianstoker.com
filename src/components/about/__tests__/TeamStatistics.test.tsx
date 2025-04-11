import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TeamStatistics from './TeamStatistics';
import { Box, Typography } from '@mui/material';

const data = [
  { number: '2011', metadata: 'The starting year' },
  { number: '100%', metadata: 'Remote global team' },
  { number: '3+', metadata: 'Countries represented' },
];

type Props = {
  title?: string;
};

describe('TeamStatistics component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TeamStatistics />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders with data', () => {
      const { getByText } = render(<TeamStatistics data={data} />);
      expect(getByText(data[0].number)).toBeInTheDocument();
      expect(getByText(data[1].metadata)).toBeInTheDocument();
      expect(getByText(data[2].metadata)).toBeInTheDocument();
    });

    it('does not render without data', () => {
      const { container } = render(<TeamStatistics />);
      expect(container).not.toBeEmptyDOMElement();
    });
  });

  describe('prop validation', () => {
    it('accepts valid props', () => {
      const { getByText } = render(<TeamStatistics data={data} />);
      expect(getByText(data[0].number)).toBeInTheDocument();
    });

    it('rejects invalid prop (string)', () => {
      const result = render(<TeamStatistics title="Invalid Prop" />);
      expect(result).toBeNull();
    });

    it('rejects invalid prop (object without data)', () => {
      const result = render(<TeamStatistics title={{}} />);
      expect(result).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('responds to clicks on boxes', () => {
      const onClickMock = jest.fn();
      const { getByText } = render(<TeamStatistics data={data} onClick={onClickMock} />);
      fireEvent.click(getByText(data[0].number));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('responds to input changes in boxes', () => {
      const onChangeMock = jest.fn();
      const { getByText } = render(<TeamStatistics data={data} onChange={onChangeMock} />);
      fireEvent.change(getByText(data[0].number), { target: { value: 'New Data' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('responds to form submission', () => {
      const onSubmitMock = jest.fn();
      const { getByText, getByLabelText } = render(<TeamStatistics data={data} onSubmit={onSubmitMock} />);
      fireEvent.change(getByText(data[0].number), { target: { value: 'New Data' } });
      fireEvent.click(getByLabelText('Submit'));
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('applies dark styles to typography', async () => {
      const getDarkStyles = jest.fn();
      const { getByText } = render(<TeamStatistics data={data} applyDarkStyles={getDarkStyles} />);
      await waitFor(() => expect(getDarkStyles).toHaveBeenCalledTimes(1));
    });
  });

  it('matches snapshot', () => {
    const tree = render(<TeamStatistics />);
    expect(tree).toMatchSnapshot();
  });
});