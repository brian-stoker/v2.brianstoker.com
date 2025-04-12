Here is an example of how you might test this script using Jest:
```js
const { transpileFile } = require('./transpile-file');
const fs = require('fs');
jest.mock('babel-core');

describe('transpileFile', () => {
  const fileContent = 'import { classes } from\'./classes';';
  const project = {};

  test('should return success if no errors occur', async () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    expect(await transpileFile(fileContent, project)).toBe(TranspileResult.Success);
  });

  test('should throw an error if watch mode is enabled and file changes', async () => {
    process.env.WATCH = 'true';
    const spyWriteFileSync = jest.spyOn(fs, 'writeFileSync');
    await transpileFile(fileContent, project);
    expect(spyWriteFileSync).toHaveBeenCalledTimes(1);
  });

  test('should write file to disk when watch mode is enabled', async () => {
    process.env.WATCH = 'true';
    const spyWriteFileSync = jest.spyOn(fs, 'writeFileSync');
    await transpileFile(fileContent, project, true);
    expect(spyWriteFileSync).toHaveBeenCalledTimes(1);
  });

  test('should fail if file cannot be read', async () => {
    const fsReadFileSyncMock = jest.fn(() => { throw new Error('file not found'); });
    fs.readFileSync = fsReadFileSyncMock;
    await transpileFile(fileContent, project);
    expect(fsReadFileSyncMock).toHaveBeenCalledTimes(1);
  });

  test('should catch any errors that occur during compilation', async () => {
    const errorSpy = jest.spyOn(console, 'error');
    await transpileFile(fileContent, project, true);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
```
Note that you'll need to create a `transpile-file.js` file and add the `transpileFile` function to it. You can also use `jest.mock` to mock out dependencies like `babel-core`. Additionally, you may want to consider adding more tests for edge cases or specific scenarios.

Also note that this is just an example and you should adjust it according to your needs and requirements. The above code assumes that the `transpileFile` function returns a promise, if it doesn't return one you'll need to modify the test accordingly.

Here is a simple implementation of `transpileFile` for testing purposes:
```js
const transpileFile = async (fileContent, project, watchMode) => {
  try {
    // write file to disk
    await fs.promises.writeFile('test-file.ts', fileContent);
    
    // transpile file using babel
    const { code } = await babel.transformAsync(fileContent, {
      plugins: ['transform-react-jsx'],
    });
    
    return TranspileResult.Success;
  } catch (error) {
    console.error(error);
    return TranspileResult.Failed;
  }
};

const fs = require('fs').promises;
const babelTransformAsync = jest.fn((input, options) => ({ code: input }));
module.exports = transpileFile;
```
Please note that this is a simplified example and does not include all the functionality of the original script.