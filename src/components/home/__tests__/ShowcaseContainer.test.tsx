import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ShowcaseContainer from './ShowcaseContainer.test.tsx';
import { render as mockRender, cleanup } from '@testing-library/react-dom';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import NoSsr from '@mui/material/NoSsr';
import Frame from 'src/components/action/Frame';

describe('ShowcaseContainer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    container = render(<ShowcaseContainer preview={null} code={null} sx={{ width: '100%', height: '100%' }} />);
  });

  afterEach(cleanup);

  it('renders without crashing', () => {
    expect(container).not.toBeNull();
  });

  describe('Props validation', () => {
    it('should render with valid props', () => {
      const { getByText } = render(<ShowcaseContainer preview="test" code="code" sx={{ width: '100%', height: '100%' }} />);
      expect(getByText('test')).toBeInTheDocument();
      expect(getByText('code')).toBeInTheDocument();
    });

    it('should not render with invalid props', () => {
      const { container } = render(<ShowcaseContainer preview={null} code="code" sx={{ width: '100%', height: '100%' }} />);
      expect(container).toBeNull();
    });
  });

  describe('Conditional rendering', () => {
    it('should render Frame.Demo with valid props', () => {
      const { getByText } = render(<ShowcaseContainer preview="test" code={null} sx={{ width: '100%', height: '100%' }} />);
      expect(getByText('test')).toBeInTheDocument();
    });

    it('should not render Frame.Info with null props', () => {
      const { container } = render(<ShowcaseContainer preview={null} code={null} sx={{ width: '100%', height: '100%' }} />);
      expect(container).toBeNull();
    });
  });

  describe('User interactions', () => {
    it('should call callback on click of Frame.Demo', async () => {
      const onClick = jest.fn();
      render(<ShowcaseContainer preview="test" code={null} sx={{ width: '100%', height: '100%' }} onClick={onClick} />);
      const demo = container.querySelector('.demo');
      if (demo) {
        fireEvent.click(demo);
        await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
      }
    });

    it('should update code on input change of Frame.Info', async () => {
      const handleChange = jest.fn();
      render(<ShowcaseContainer preview="test" code={null} sx={{ width: '100%', height: '100%' }} />);
      const info = container.querySelector('.info');
      if (info) {
        fireEvent.change(info, { target: { value: 'newCode' } });
        await waitFor(() => expect(handleChange).toHaveBeenCalledTimes(1));
      }
    });

    it('should call callback on form submission of Frame.Info', async () => {
      const handleSubmit = jest.fn();
      render(<ShowcaseContainer preview="test" code={null} sx={{ width: '100%', height: '100%' }} />);
      const info = container.querySelector('.info');
      if (info) {
        fireEvent.change(info, { target: { value: 'newCode' } });
        fireEvent.submit(info);
        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
      }
    });
  });

  describe('Snapshots', () => {
    it('should render with the correct layout', async () => {
      const { asFragment } = render(<ShowcaseContainer preview="test" code="code" sx={{ width: '100%', height: '100%' }} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Side effects and state changes', () => {
    it('should update state with new props', async () => {
      const { rerender } = render(<ShowcaseContainer preview="test" code={null} sx={{ width: '100%', height: '100%' }} />);
      await waitFor(() => expect(rerender).toHaveBeenCalledTimes(1));
    });

    it('should not crash on state changes', async () => {
      const { rerender } = render(<ShowcaseContainer preview={null} code="code" sx={{ width: '100%', height: '100%' }} />);
      await waitFor(() => expect(rerender).toHaveBeenCalledTimes(1));
    });
  });
});