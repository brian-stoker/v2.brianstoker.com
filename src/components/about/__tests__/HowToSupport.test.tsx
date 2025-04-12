import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import HowToSupport from './HowToSupport';

describe('HowToSupport', () => {
  const initialProps = {
    children: null,
    title: '',
    icon: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    await render(<HowToSupport {...initialProps} />);
    expect(screen).not.toHaveError();
  });

  describe('Widget component', () => {
    const widgetIcon = 'icon';
    const widgetTitle = 'title';

    it('renders correctly with icon and title', async () => {
      const wrapper = render(
        <HowToSupport {...initialProps} children={
          <div>
            <button>{widgetTitle}</button>
          </div>
        } />
      );
      expect(wrapper.container).toHaveTextContent(widgetTitle);
      expect(wrapper.container).toHaveElementByRole('img', { name: widgetIcon });
    });

    it('calls button click callback', async () => {
      const callback = jest.fn();
      await render(
        <HowToSupport {...initialProps} children={
          <button onClick={callback}>{widgetTitle}</button>
        } />
      );
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Widget grid component', () => {
    it('renders correctly with widgets and links', async () => {
      await render(
        <HowToSupport {...initialProps} children={
          <div>
            <Widget icon={widgetIcon} title={widgetTitle}>
              <button>{widgetTitle}</button>
            </Widget>
          </div>
        } />
      );
      expect(screen).toHaveTextContent(widgetTitle);
      expect(screen).toHaveElementByRole('img', { name: widgetIcon });
    });

    it('renders correctly with links and button', async () => {
      await render(
        <HowToSupport {...initialProps} children={
          <div>
            <Widget icon={widgetIcon} title={widgetTitle}>
              <Box component="ul">
                <li>Link 1</li>
                <li>Link 2</li>
              </Box>
              <Button href="#">Button</Button>
            </Widget>
          </div>
        } />
      );
      expect(screen).toHaveTextContent(widgetTitle);
      expect(screen).toHaveElementByRole('img', { name: widgetIcon });
    });

    it('calls button click callback with correct href', async () => {
      const callback = jest.fn();
      await render(
        <HowToSupport {...initialProps} children={
          <div>
            <Widget icon={widgetIcon} title={widgetTitle}>
              <Box component="ul">
                <li>Link 1</li>
                <li>Link 2</li>
              </Box>
              <Button href="#" onClick={callback}>Button</Button>
            </Widget>
          </div>
        } />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Section component', () => {
    it('renders correctly with grid and widgets', async () => {
      await render(<HowToSupport />);
      expect(screen).toHaveTextContent('');
      const grids = screen.getAllByRole('grid');
      expect(grids).toHaveLength(3);
    });

    it('calls button click callback with correct href', async () => {
      const callback = jest.fn();
      await render(<HowToSupport />);
      fireEvent.click(screen.getByText('Leave your feedback'));
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});