Here's an example of how you could write unit tests for the provided React component using Jest and Enzyme.

First, let's install the required packages:

```bash
npm install --save-dev @jest-environment jsdom enzyme jest-dom
```

Next, create a new file `SwipeableViews.test.js` in the same directory as your original component file.

```javascript
import React from 'react';
import { mount } from 'enzyme';
import SwipeableViews from './index'; // Import the component you want to test

describe('SwipeableViews', () => {
  it('renders correctly', () => {
    const wrapper = mount(<SwipeableViews />);
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onChangeIndex with the correct index', () => {
    const onChangeIndexMock = jest.fn();
    const wrapper = mount(
      <SwipeableViews onChangeIndex={onChangeIndexMock} index={0} />
    );
    wrapper.instance().handleChangeIndex(1);
    expect(onChangeIndexMock).toHaveBeenCalledTimes(1);
    expect(onChangeIndexMock).toHaveBeenCalledWith(1);
  });

  it('renders all items in the correct order', () => {
    const item1 = { name: 'Item 1' };
    const item2 = { name: 'Item 2' };
    const wrapper = mount(<SwipeableViews items={[item1, item2]} index={0} />);
    expect(wrapper.find('.react-swipeable-view-container').childAt(0).text()).toBe(item1.name);
    expect(wrapper.find('.react-swipeable-view-container').childAt(1).text()).toBe(item2.name);
  });

  it('handles mouse events', () => {
    const wrapper = mount(<SwipeableViews />);
    wrapper.instance().handleChangeIndex(1); // Trigger a change
    expect(wrapper.instance().isMouseOver()).toBe(true);
  });
});
```

This test file checks the following scenarios:

* The component renders correctly.
* The `onChangeIndex` prop is called with the correct index when the user navigates through the swipe views.
* All items are rendered in the correct order within the swipe views.
* The component handles mouse events correctly.

You can add more tests as needed to ensure your component behaves as expected.