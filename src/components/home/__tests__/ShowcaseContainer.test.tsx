import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import NoSsr from '@mui/material/NoSsr';
import Frame from 'src/components/action/Frame';

describe('ShowcaseContainer', () => {
  const preview = <div>Preview</div>;
  const code = <div>Code</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(render(<ShowcaseContainer preview={preview} code={code} sx={{}} />)).toBeTruthy();
  });

  describe('conditional rendering', () => {
    const showcase = render(
      <ShowcaseContainer preview={preview} sx={{}}>
        <div>No code provided</div>
      </ShowcaseContainer>
    );

    it('renders preview when no code is provided', () => {
      expect(showcase.getByTestId('preview')).toBeInTheDocument();
    });

    const infoShowcase = render(
      <ShowcaseContainer code={code} sx={{}} />
    );

    it('renders code when provided', () => {
      expect(infoShowcase.getByTestId('code')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    let showcase;

    beforeEach(() => {
      showcase = render(
        <ShowcaseContainer preview={preview} sx={{}} />
      );
    });

    it('accepts valid props', () => {
      expect(showcase.getByTestId('preview')).toBeInTheDocument();
    });

    it('throws an error when invalid props are provided', () => {
      const invalidProps = { preview: null, code: undefined };
      expect(() => render(<ShowcaseContainer {...invalidProps} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    let showcase;

    beforeEach(() => {
      showcase = render(
        <ShowcaseContainer preview={preview} sx={{}} />
      );
    });

    it('renders preview when clicked', async () => {
      const togglePreviewButton = showcase.getByTestId('toggle-preview-button');
      fireEvent.click(togglePreviewButton);
      await waitFor(() => expect(showcase.getByTestId('preview')).toBeInTheDocument());
    });
  });

  describe('side effects or state changes', () => {
    // No side effects in this component
  });
});

describe('mocking external dependencies', () => {
  it('renders without crashing when Frame is mocked', async () => {
    const mockFrame = {
      Demo: jest.fn(),
      Info: jest.fn(),
    };
    render(<ShowcaseContainer preview={preview} code={code} sx={{}}.Frame = {mockFrame} />);
    expect(mockFrame.Demo).toHaveBeenCalledTimes(1);
    expect(mockFrame.Info).toHaveBeenCalledTimes(1);
  });
});