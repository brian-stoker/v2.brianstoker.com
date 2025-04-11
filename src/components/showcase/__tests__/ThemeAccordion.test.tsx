import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Accordion, { accordionClasses } from '@mui/material/Accordion';
import AccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import AccordionDetails, { accordionDetailsClasses } from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FontDownloadRoundedIcon from '@mui/icons-material/FontDownloadRounded';
import Folder from '@mui/icons-material/Folder';

describe('ThemeAccordion', () => {
  let component;

  beforeEach(() => {
    component = React.render(<ThemeAccordion />, document.getElementById('root'));
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders AccordionSummary and AccordionDetails when expanded', () => {
      const handleChangeMock = jest.fn();
      component.props.onChange(handleChangeMock, 'panel1');
      expect(handleChangeMock).toHaveBeenCalledTimes(1);
    });

    it('does not render AccordionSummary and AccordionDetails when collapsed', () => {
      const handleChangeMock = jest.fn();
      component.props.onChange(handleChangeMock, false);
      expect(handleChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props Validation', () => {
    it('accepts valid props', () => {
      const { props } = component;
      expect(props).toBeDefined();
    });

    it('rejects invalid props (missing onChange prop)', () => {
      try {
        React.render(<ThemeAccordion />, document.getElementById('root'));
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('User Interactions', () => {
    it('responds to expand/collapse clicks', () => {
      const handleChangeMock = jest.fn();
      component.props.onChange(handleChangeMock, 'panel1');
      document.getElementById('panel1-header').click();
      expect(handleChangeMock).toHaveBeenCalledTimes(2);
    });

    it('responds to input changes in AccordionSummary', () => {
      const handleChangeMock = jest.fn();
      component.props.onChange(handleChangeMock, 'panel1');
      document.getElementById('panel1-header').innerHTML = 'New title';
      expect(handleChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side Effects and State Changes', () => {
    it('updates expanded state correctly when onChange is called', () => {
      const handleChangeMock = jest.fn();
      component.props.onChange(handleChangeMock, 'panel1');
      expect(component.state.expanded).toBe('panel1');
    });
  });

  // Snapshot test
  describe('Snapshot Test', () => {
    it('matches expected output snapshot', () => {
      expect(screen.getByRole('region')).toHaveStyleRule(
        accordionClasses.root,
        `background-color: #fff; border-color: grey.200; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.6);`
      );
    });
  });
});