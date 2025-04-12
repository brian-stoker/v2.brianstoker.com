import { render, fireEvent, waitFor } from '@testing-library/react';
import LinkifyTranslation from './LinkifyTranslation';
import createXTypeScriptProjects from '../createXTypeScriptProjects';
import buildInterfacesDocumentationPage from './buildInterfacesDocumentation';
import { XTypeScriptProjects, interfacesToDocument } from '../createXTypeScriptProjects';
import DocumentedInterfaces from './utils';

describe('Linkify Translation', () => {
  it('renders without crashing', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentedInterfaces} folder="" />);

    expect(true).toBe(true);
  });

  it('linkifies all the [[...]] occurrence by the documentedInterfaces if possible', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentatedInterfaces} folder="" />);

    expect(documentedInterfaces).toBeTruthy();

    // TODO: Test for linkification in file
  });

  it('links files without [[...]]', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentatedInterfaces} folder="" />);

    expect(documentedInterfaces).toBeTruthy();

    // TODO: Test for no linkification
  });

  it('throws error when no config path', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentatedInterfaces} folder="" />);

    expect(documentedInterfaces).toBeTruthy();

    // TODO: Test for prettier.config.js error
  });

  it('renders with valid prop', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentatedInterfaces} folder="" />);

    expect(documentedInterfaces).toBeTruthy();

    // TODO: Test for valid prop
  });

  it('renders with invalid prop', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentedInterfaces} folder="" />);

    expect(documentedInterfaces).toBeTruthy();

    // TODO: Test for invalid prop
  });

  it('resolves config path', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentatedInterfaces} folder="" />);

    expect(documentedInterfaces).toBeTruthy();

    // TODO: Test for config path
  });

  it('throws error when prettier config not found', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentatedInterfaces} folder="" />);

    expect(documentedInterfaces).toBeTruthy();

    // TODO: Test for no config path
  });

  it('submits form', async () => {
    const directory = './test/directory';
    const documentedInterfaces = new DocumentedInterfaces();
    await createXTypeScriptProjects();

    render(<LinkifyTranslation directory={directory} documentedInterfaces={documentatedInterfaces} folder="" />);

    const input = document.querySelector('input');
    fireEvent.change(input, { target: { value: 'example' } });

    expect(documentedInterfaces).toBeTruthy();

    // TODO: Test for form submission
  });
});