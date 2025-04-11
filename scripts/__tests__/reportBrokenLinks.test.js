Here is an example of how you can write unit tests for the `parseDocFolder` function using Jest:
```
const { parseDocFolder, getAnchor } = require('./path-to-module');

describe('parseDocFolder', () => {
  it('should return an object with available links and used links', async () => {
    const folderPath = path.join(__dirname, '../');
    const availableLinks = {};
    const usedLinks = {};

    await parseDocFolder(folderPath, availableLinks, usedLinks);

    expect(availableLinks).toBeInstanceOf(Object);
    expect(usedLinks).toBeInstanceOf(Object);

    // Add some expected values to verify the output
    expect(availableLinks['https://mui.com']).toBe(true);
    expect(usedLinks['https://mui.com/#anchor-1']).toEqual(['file1.js', 'file2.js']);
  });

  it('should filter out unsupported paths', () => {
    const folderPath = path.join(__dirname, '../');
    const availableLinks = {};
    const usedLinks = {};

    parseDocFolder(folderPath, availableLinks, usedLinks);

    expect(availableLinks).not.toContainKey('/api/');
    expect(usedLinks).not.toContainKey('/careers/');
  });

  it('should handle pages with no links', () => {
    const folderPath = path.join(__dirname, '../');
    const availableLinks = {};
    const usedLinks = {};

    parseDocFolder(folderPath, availableLinks, usedLinks);

    expect(availableLinks).toBeInstanceOf(Object);
    expect(usedLinks).toBeInstanceOf(Object);
    Object.keys(usedLinks).forEach((link) => {
      expect(usedLinks[link]).toEqual([]);
    });
  });

  it('should handle pages with only anchors', () => {
    const folderPath = path.join(__dirname, '../');
    const availableLinks = {};
    const usedLinks = {};

    parseDocFolder(folderPath, availableLinks, usedLinks);

    expect(availableLinks).toBeInstanceOf(Object);
    expect(usedLinks).toBeInstanceOf(Object);
    Object.keys(usedLinks).forEach((link) => {
      expect(link)..startsWith('#');
    });
  });
});
```
Note that I've assumed that the `parseDocFolder` function returns a promise, so I've used the `async/await` syntax to call it. If that's not the case, you can remove the `async` keyword and use `.then()` instead.

Also, I've used some example values to verify the output of the function, but you should adjust these to match your specific requirements.

You'll also need to add some additional tests for the `getAnchor` function, such as:
```
it('should extract the anchor from a URL', () => {
  expect(getAnchor('https://mui.com#anchor-1')).toBe('anchor-1');
});

it('should return an empty string if no anchor is present', () => {
  expect(getAnchor('https://mui.com')).toBe('');
});
```
Make sure to run `jest` in your terminal to execute the tests.