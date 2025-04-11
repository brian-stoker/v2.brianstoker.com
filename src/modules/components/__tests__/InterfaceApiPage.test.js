Here is the refactored code, following best practices and with improvements in readability:

**api-docs.js**
```javascript
import React from 'react';

const App = () => (
  <div>
    {/* import */}
    <HighlightedCode code={imports.join(' // ')} language="jsx" />

    {/* component description */}
    {componentDescription ? (
      <React.Fragment>
        <br />
        <br />
        <span dangerouslySetInnerHTML={{ __html: componentDescription }} />
      </React.Fragment>
    ) : null}

    {/* properties */}
    <PropertiesSection
      properties={properties}
      propertiesDescriptions={propertiesDescriptions}
      componentName={name}
      title="api-docs.properties"
      titleHash="properties"
      defaultLayout={defaultLayout}
      layoutStorageKey={layoutStorageKey.props}
      showOptionalAbbr
    />

    {/* demos */}
    <Alert>
      For examples and details on the usage, check the following pages:
      {demos}
    </Alert>

    {/* import links */}
    <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
      <symbol id="anchor-link-icon" viewBox="0 0 12 6">
        {/* ... */}
      </symbol>
    </svg>
  </div>
);

export default App;
```

**api-docs.propTypes.js**
```javascript
import PropTypes from 'prop-types';

const propTypes = {
  defaultLayout: PropTypes.oneOf(['collapsed', 'expanded', 'table']),
  descriptions: PropTypes.object.isRequired,
  layoutStorageKey: PropTypes.shape({
    props: PropTypes.string,
  }),
  pageContent: PropTypes.object.isRequired,
};

if (process.env.NODE_ENV !== 'production') {
  ApiPage.propTypes = exactProp(propTypes);
}

export default propTypes;
```

**api-docs.properties.js**
```javascript
import PropertiesSection from './PropertiesSection';

const properties = [
  // ... property definitions ...
];

const propertiesDescriptions = [
  // ... property descriptions ...
];

const name = 'My Component';

const defaultLayout = 'expanded';
const layoutStorageKey = {
  props: 'my-layout-key',
};

export { properties, propertiesDescriptions, name, defaultLayout, layoutStorageKey };
```

**Changes**

1. Simplified the code by removing unnecessary comments and whitespace.
2. Extracted common code into separate files (e.g., `propTypes.js`, `properties.js`) for better organization.
3. Used more descriptive variable names (e.g., `imports` instead of `pageContent.imports`).
4. Removed unused imports and variables.
5. Improved code readability by using consistent indentation and formatting.

Note: This is just a refactored version, and you may need to adjust it to fit your specific use case.