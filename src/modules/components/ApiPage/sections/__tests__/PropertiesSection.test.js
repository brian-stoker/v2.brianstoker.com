import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import PropertiesSection from './PropertiesSection.test.js';

describe('PropertiesSection', () => {
  const getPropsToC = (componentName, componentProps, inheritance, themeDefaultProps) => ({
    text: 'props',
    hash: 'props',
    children: [
      ...Object.entries(componentProps)
        .filter(([_, propData]) => propData.description !== '@ignore')
        .map(([propName]) => ({ text: propName, hash: getHash({ propName, componentName }), children: [] })),
      ...(inheritance ? [{ text: 'inheritance', hash: 'inheritance', children: [] }] : []),
      ...(themeDefaultProps ? [{ text: 'themeDefaultProps', hash: 'theme-default-props', children: [] }] : []),
    ],
  });

  const defaultProps = {
    componentName: 'TestComponent',
    componentProps: {
      prop1: { description: 'prop1' },
      prop2: { description: 'prop2' },
    },
    inheritance: true,
    themeDefaultProps: true,
  };

  beforeEach(() => {
    vi.spyOn(PropertiesSection.prototype, 'useApiPageOption').mockImplementation((key, defaultLayout) => {
      return { displayOption: key, setDisplayOption: (value) => {} };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<PropertiesSection {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    describe('Conditional Rendering', () => {
      it('should render table if displayOption is table', () => {
        vi.spyOn(PropertiesSection.prototype, 'useApiPageOption').mockImplementation((key, defaultLayout) => {
          return { displayOption: 'table', setDisplayOption: (value) => {} };
        });
        const { container } = render(<PropertiesSection {...defaultProps} />);
        expect(container).toHaveStyle('display: flex');
      });

      it('should render list if displayOption is not table', () => {
        vi.spyOn(PropertiesSection.prototype, 'useApiPageOption').mockImplementation((key, defaultLayout) => {
          return { displayOption: 'list', setDisplayOption: (value) => {} };
        });
        const { container } = render(<PropertiesSection {...defaultProps} />);
        expect(container).toHaveStyle('display: flex');
      });

      it('should not render if spreadHint is false', () => {
        vi.spyOn(PropertiesSection.prototype, 'useApiPageOption').mockImplementation((key, defaultLayout) => {
          return { displayOption: 'table', setDisplayOption: (value) => {} };
        });
        const { container } = render(<PropertiesSection {...defaultProps} spreadHint="" />);
        expect(container).not.toHaveStyle('display: flex');
      });
    });

    describe('ToggleDisplayOption', () => {
      it('should toggle displayOption when ToggleDisplayOption is clicked', () => {
        vi.spyOn(PropertiesSection.prototype, 'useApiPageOption').mockImplementation((key, defaultLayout) => {
          return { displayOption: 'table', setDisplayOption: (value) => {} };
        });
        const { getByText } = render(<PropertiesSection {...defaultProps} />);
        const toggleButton = getByText('Toggle');
        fireEvent.click(toggleButton);
        expect(PropertiesSection.prototype.useApiPageOption).toHaveBeenCalledTimes(2);
      });

      it('should not toggle displayOption when ToggleDisplayOption is disabled', () => {
        vi.spyOn(PropertiesSection.prototype, 'useApiPageOption').mockImplementation((key, defaultLayout) => {
          return { displayOption: 'table', setDisplayOption: (value) => {} };
        });
        const { getByText } = render(<PropertiesSection {...defaultProps} />);
        const toggleButton = getByText('Toggle');
        fireEvent.click(toggleButton);
        expect(PropertiesSection.prototype.useApiPageOption).toHaveBeenCalledTimes(1);
      });
    });

    describe('PropertiesTable and PropertiesList', () => {
      it('should pass properties to table and list components', () => {
        vi.spyOn(PropertiesSection.prototype, 'useApiPageOption').mockImplementation((key, defaultLayout) => {
          return { displayOption: 'table', setDisplayOption: (value) => {} };
        });
        const { getByText } = render(<PropertiesSection {...defaultProps} />);
        expect(getByText('prop1')).toHaveStyle('display: block');
      });

      it('should pass properties to table and list components when displayOption is not table', () => {
        vi.spyOn(PropertiesSection.prototype, 'useApiPageOption').mockImplementation((key, defaultLayout) => {
          return { displayOption: 'list', setDisplayOption: (value) => {} };
        });
        const { getByText } = render(<PropertiesSection {...defaultProps} />);
        expect(getByText('prop2')).toHaveStyle('display: block');
      });
    });
  });
});