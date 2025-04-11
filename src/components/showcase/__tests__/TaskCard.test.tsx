import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TaskCard from './TaskCard'; // replace './TaskCard' with the actual path to your component file
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Fade from '@mui/material/Fade';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import CodeRounded from '@mui/icons-material/CodeRounded';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  MuiAvatar: () => ({}),
}));

describe('TaskCard component', () => {
  let taskCard;

  beforeEach(() => {
    taskCard = render(<TaskCard />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(taskCard).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('renders the correct content for March 25th', () => {
      const { getByText } = render(<TaskCard date="March 25th" />);
      expect(getByText('March 25th')).toBeInTheDocument();
    });

    it('renders the code snippet for "Customize every button and chip instance primary color"', () => {
      const { getByText } = render(<TaskCard codeSnippets={['Customize every button and chip instance primary color']} />);
      expect(getByText('Customize every button and chip instance primary color')).toBeInTheDocument();
    });

    it('renders the assigned user for "Lucas Smith"', () => {
      const { getByText } = render(<TaskCard assignees={['Lucas Smith']} />);
      expect(getByText('Lucas Smith')).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('throws an error when date is not a string', () => {
      expect(() => render(<TaskCard date={123} />)).toThrowError();
    });

    it('throws an error when codeSnippets is not an array', () => {
      expect(() => render(<TaskCard codeSnippets={"Customize every button and chip instance primary color"} />)).toThrowError();
    });

    it('throws an error when assignees is not an array', () => {
      expect(() => render(<TaskCard assignees={"Lucas Smith"} />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    it('calls the onChange function when the date input changes', () => {
      const onChange = jest.fn();
      const { getByLabelText, getByRole } = render(<TaskCard onChange={onChange} />);
      const dateInput = getByLabelText('Date');
      fireEvent.change(dateInput, { target: { value: 'April 1st' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls the onChange function when the code snippet input changes', () => {
      const onChange = jest.fn();
      const { getByLabelText, getByRole } = render(<TaskCard onChange={onChange} />);
      const codeSnippetInput = getByLabelText('Code Snippet');
      fireEvent.change(codeSnippetInput, { target: { value: 'New code snippet' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls the onChange function when the assigned user input changes', () => {
      const onChange = jest.fn();
      const { getByLabelText, getByRole } = render(<TaskCard onChange={onChange} />);
      const assigneeInput = getByLabelText('Assigned User');
      fireEvent.change(assigneeInput, { target: { value: 'John Doe' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls the onSubmit function when the form is submitted', () => {
      const onSubmit = jest.fn();
      const { getByRole, getByLabelText } = render(<TaskCard onSubmit={onSubmit} />);
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('State changes', () => {
    it('updates the progress value when the progress input changes', async () => {
      const onProgressChange = jest.fn();
      const { getByLabelText, getByRole } = render(<TaskCard onProgressChange={onProgressChange} />);
      const progressInput = getByLabelText('Progress');
      fireEvent.change(progressInput, { target: { value: '80%' } });
      await waitFor(() => expect(onProgressChange).toHaveBeenCalledTimes(1));
    });
  });
});