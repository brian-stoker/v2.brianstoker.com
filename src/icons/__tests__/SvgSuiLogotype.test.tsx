Here's an example of how you could test this React component using Jest and Enzyme:

**Component.js**
```javascript
import React from 'react';
import { Wrapper } from './Wrapper';

const Svg = () => {
  return (
    <Wrapper>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        {/* SVG contents */}
      </svg>
    </Wrapper>
  );
};

export default Svg;
```

**tests/Svg.test.js**
```javascript
import React from 'react';
import { mount } from 'enzyme';
import Svg from './Svg';

describe('Svg component', () => {
  it('renders correctly', () => {
    const wrapper = mount(<Svg />);
    expect(wrapper.find('svg').length).toBe(1);
    expect(wrapper.find('Wrapper').length).toBe(1);
  });

  it('has correct width and height', () => {
    const wrapper = mount(<Svg />);
    expect(wrapper.find('svg').prop('width')).toBe(24);
    expect(wrapper.find('svg').prop('height')).toBe(24);
  });

  it('renders SVG contents', () => {
    const svgContents = '<path d="M12 2c0-7.14 5.29-13 12-13s12 5.86 12 13-5.29 13-12 13-12-5.86-13-12z" fill="#007FFF">';
    const wrapper = mount(<Svg />);
    expect(wrapper.find('svg').children()).toContainElement(svgContents);
  });
});
```

**Wrapper.js**
```javascript
import React from 'react';

const Wrapper = ({ children }) => {
  return <div>{children}</div>;
};

export default Wrapper;
```

**tests/Wrapper.test.js**
```javascript
import React from 'react';
import { mount } from 'enzyme';
import Wrapper from './Wrapper';

describe('Wrapper component', () => {
  it('renders children correctly', () => {
    const wrapper = mount(<Wrapper>test</Wrapper>);
    expect(wrapper.text()).toBe('test');
  });

  it('has correct style', () => {
    const wrapper = mount(<Wrapper>test</Wrapper>);
    expect(wrapper.first().prop('style')).toHaveProperty('display', 'block');
  });
});
```

Note that this is just an example, and you may need to modify the tests to fit your specific use case. Additionally, you'll need to make sure that the `Svg` component is properly wrapped in a React context, as Enzyme uses a virtual DOM under the hood.