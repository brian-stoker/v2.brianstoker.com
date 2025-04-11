import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import BaseButtonDemo from './BaseButtonDemo';

describe('BaseButtonDemo component', () => {
  let baseButtonDemo;

  beforeEach(() => {
    baseButtonDemo = render(<BaseButtonDemo />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(baseButtonDemo).not.toThrowError();
    });

    it('renders different styling types', () => {
      const { container } = baseButtonDemo;
      const systemStylingElement = container.querySelector('[data-system-styling]');
      const cssStylingElement = container.querySelector('[data-css-styling]');
      const tailwindStylingElement = container.querySelector('[data-tailwind-styling]');

      expect(systemStylingElement).toBeInTheDocument();
      expect(cssStylingElement).toBeInTheDocument();
      expect(tailwindStylingElement).toBeInTheDocument();
    });

    it('renders styled button components', () => {
      const { getByText } = baseButtonDemo;
      const systemStylingElement = container.querySelector('[data-system-styling]');
      const cssStylingElement = container.querySelector('[data-css-styling]');

      expect(getByText('Button')).toBeInTheDocument();
      expect(getByText('Disabled')).toBeInTheDocument();

      const buttonElements = Array.from(container.querySelectorAll('button'));

      expect(buttonElements).toHaveLength(4);

      buttonElements.forEach((button, index) => {
        if (index === 0 || index === 3) {
          expect(button).toHaveStyle(`background: var(--primary);`);
        } else {
          expect(button).toHaveStyle(`border: none;`);
        }
      });
    });

    it('renders styled button components with tailwind styling', () => {
      const { getByText } = baseButtonDemo;
      const systemStylingElement = container.querySelector('[data-system-styling]');
      const cssStylingElement = container.querySelector('[data-css-styling]');

      expect(getByText('Button')).toBeInTheDocument();
      expect(getByText('Disabled')).toBeInTheDocument();

      const buttonElements = Array.from(container.querySelectorAll('button'));

      expect(buttonElements).toHaveLength(4);

      buttonElements.forEach((button, index) => {
        if (index === 0 || index === 3) {
          expect(button).toHaveStyle(`background: indigo-600;`);
        } else {
          expect(button).toHaveStyle(`border: none;`);
        }
      });
    });
  });

  describe('Actions', () => {
    it('calls callback function on button click', async () => {
      const callback = jest.fn();
      baseButtonDemo = render(<BaseButtonDemo callback={callback} />);

      const buttonElement = container.querySelector('[data-system-styling]');

      fireEvent.click(buttonElement);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('calls callback function on disabled button click', async () => {
      const callback = jest.fn();
      baseButtonDemo = render(<BaseButtonDemo callback={callback} />);

      const disabledButtonElement = container.querySelector('[data-system-styling]');

      fireEvent.click(disabledButtonElement);

      expect(callback).toHaveBeenCalledTimes(0);
    });
  });

  describe('getCode function', () => {
    it('returns code for styling system type', async () => {
      const code = await BaseButtonDemo.getCode('system');
      expect(code).toBe(`import { Button } from '@mui/base/Button';
import { styled } from '@mui/system';

const StyledButton = styled('button')\`${buttonStyles}\`;

<Button slots={{ root: StyledButton }}>Button</Button>
<Button slots={{ root: StyledButton }}>Disabled</Button>
`);
    });

    it('returns code for styling CSS type', async () => {
      const code = await BaseButtonDemo.getCode('css');
      expect(code).toBe(`import { Button } from '@mui/base/Button';
import './styles.css';

<Button>Button</Button>
<Button disabled>Disabled</Button>

/* styles.css */
.base-Button-root {${buttonStyles}}
`);
    });

    it('returns code for styling tailwind type', async () => {
      const code = await BaseButtonDemo.getCode('tailwindcss');
      expect(code).toBe(`import { Button } from '@mui/base/Button';

<Button
  className="cursor-pointer select-none rounded-[8px] 
  border-none bg-indigo-600 p-[6px_12px] text-[0.875rem] leading-[1.5] font-bold 
  text-white [font-family:IBM_Plex_sans] hover:bg-indigo-500 
  ui-active:bg-indigo-800 ui-disabled:cursor-not-allowed ui-disable