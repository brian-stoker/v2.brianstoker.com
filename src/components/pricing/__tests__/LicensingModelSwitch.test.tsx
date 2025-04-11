import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { createBrowserHistory } from 'history/createBrowserHistory';
import { useLicensingModel } from 'src/components/pricing/LicensingModelContext';
import LicensingModelSwitch from './LicensingModelSwitch.test';

jest.mock('src/components/pricing/LicensingModelContext');

describe('LicensingModelSwitch component', () => {
  const history = createMemoryHistory();
  const browserHistory = createBrowserHistory(history);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', () => {
    render(<LicensingModelSwitch />);
    expect(document.body).not.toBeNull();
  });

  describe('conditional rendering', () => {
    const perpetualDescription =
      'One-time purchase to use the current released versions forever. 12 months of updates included.';
    const annualDescription =
      'Upon expiration, your permission to use the Software in development ends. The license is perpetual in production.';

    it('renders perpetual tab by default', () => {
      render(<LicensingModelSwitch />);
      expect(document.body).toMatchInlineSnapshot(`
        <div>
          <Box sx={{ display: "flex" }}>
            <StyledTabs
              aria-label="licensing model"
              selectionFollowsFocus
              value="perpetual"
              onChange={() => {}}
            >
              <Tab
                disableFocusRipple
                value="perpetual"
                label={
                  <Tooltip title="${perpetualDescription}" enterDelay={400} enterNextDelay={50} enterTouchDelay={500} placement="top" describeChild true sx={{ fontSize: 12 }}>{}</Tooltip>
                }
              />
              <Tab
                disableFocusRipple
                value="annual"
                label={
                  <Tooltip title="${annualDescription}" enterDelay={400} enterNextDelay={50} enterTouchDelay={500} placement="top" describeChild true slotProps={{ tooltip: { sx: { fontSize: 12 } } }}>{}</Tooltip>
                }
              />
            </StyledTabs>
          </Box>
        </div>
      `);
    });

    it('renders annual tab when "annual" value is passed as a prop', () => {
      const licensingModel = 'annual';
      render(<LicensingModelSwitch licensingModel={licensingModel} />);
      expect(document.body).toMatchInlineSnapshot(`
        <div>
          <Box sx={{ display: "flex" }}>
            <StyledTabs
              aria-label="licensing model"
              selectionFollowsFocus
              value="${licensingModel}"
              onChange={() => {}}
            >
              <Tab
                disableFocusRipple
                value="annual"
                label={
                  <Tooltip title="${annualDescription}" enterDelay={400} enterNextDelay={50} enterTouchDelay={500} placement="top" describeChild true slotProps={{ tooltip: { sx: { fontSize: 12 } } }}>{}</Tooltip>
                }
              />
            </StyledTabs>
          </Box>
        </div>
      `);
    });
  });

  it('prop validation', () => {
    const licensingModel = 'invalid';
    expect(() => render(<LicensingModelSwitch licensingModel={licensingModel} />)).toThrowError();
  });

  describe('user interactions', () => {
    let changeHandler;

    beforeEach(() => {
      changeHandler = jest.fn();
    });

    it('calls onChange prop when tab is changed', () => {
      const licensingModel = 'perpetual';
      render(<LicensingModelSwitch licensingModel={licensingModel} onChange={changeHandler} />);
      const tab = document.querySelector('tab');
      fireEvent.click(tab);
      expect(changeHandler).toHaveBeenCalledTimes(1);
    });

    it('calls onChange prop with correct value when tab is changed', () => {
      const licensingModel = 'perpetual';
      render(<LicensingModelSwitch licensingModel={licensingModel} onChange={changeHandler} />);
      const tab = document.querySelector('tab');
      fireEvent.click(tab);
      expect(changeHandler).toHaveBeenCalledTimes(1);
      expect(changeHandler).toHaveBeenCalledWith(expect.any(Object), expect.any(Number));
    });
  });

  describe('context api', () => {
    it('sets the licensing model state when onChange prop is called', () => {
      const setLicensingModel = jest.fn();
      render(<LicensingModelSwitch setLicensingModel={setLicensingModel} />);
      const changeHandler = (event: React.SyntheticEvent, newValue: number) => {
        setLicensingModel(newValue);
      };
      render(<LicensingModelSwitch onChange={changeHandler} />);
      expect(setLicensingModel).toHaveBeenCalledTimes(1);
    });
  });
});