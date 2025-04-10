// @ts-ignore
import LZString from 'lz-string';
import addHiddenInput from 'src/modules/utils/addHiddenInput';
import SandboxDependencies from 'src/modules/sandbox/Dependencies';
import * as CRA from 'src/modules/sandbox/CreateReactApp';
import getFileExtension from 'src/modules/sandbox/FileExtension';
import {DemoData} from 'src/modules/sandbox/types';

function compress(object: any) {
  return LZString.compressToBase64(JSON.stringify(object))
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, ''); // Remove ending '='
}

function openSandbox({ files, codeVariant, initialFile }: any) {
  const extension = codeVariant === 'TS' ? '.tsx' : '.js';
  const parameters = compress({ files });

  // ref: https://codesandbox.io/docs/api/#define-api
  const form = document.createElement('form');
  form.method = 'POST';
  form.target = '_blank';
  form.action = 'https://codesandbox.io/api/v1/sandboxes/define';
  addHiddenInput(form, 'parameters', parameters);
  addHiddenInput(
    form,
    'query',
    `file=${initialFile}${initialFile.match(/(\.tsx|\.ts|\.js)$/) ? '' : extension}`,
  );
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function createReactApp(demoData: DemoData) {
  const ext = getFileExtension(demoData.codeVariant);
  const { title, githubLocation: description } = demoData;

  const files: Record<string, object> = {
    'public/index.html': {
      content: CRA.getHtml(demoData),
    },
    [`src/index.${ext}`]: {
      content: CRA.getRootIndex(demoData),
    },
    [`src/Demo.${ext}`]: {
      content: demoData.raw,
    },
    ...(demoData.codeVariant === 'TS' && {
      'tsconfig.json': {
        content: CRA.getTsconfig(),
      },
    }),
  };

  const { dependencies, devDependencies } = SandboxDependencies(demoData, {
    commitRef: process.env.PULL_REQUEST_ID ? process.env.COMMIT_REF : undefined,
  });

  files['package.json'] = {
    content: {
      description,
      dependencies,
      devDependencies,
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject',
      },
      ...(demoData.codeVariant === 'TS' && {
        main: 'index.tsx',
      }),
    },
  };

  return {
    title,
    description,
    files,
    dependencies,
    devDependencies,
    /**
     * @param {string} initialFile
     * @description should start with `/`, for example `/Demo.tsx`. If the extension is not
     *   provided, it will be appended based on the code variant.
     */
    openSandbox: (initialFile: string = `/src/Demo.${ext}`) =>
      openSandbox({ files, codeVariant: demoData.codeVariant, initialFile }),
  };
}

export default {
  createReactApp,
};
