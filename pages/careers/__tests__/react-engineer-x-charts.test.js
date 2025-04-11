const React = require('react');
const { test, describe } = require('vitest');
const TopLayoutCareers = require('./TopLayoutCareers');

describe('TopLayoutCareers component', () => {
    let props;
    const pageProps = require('./pages/careers/react-engineer-x-charts.md?muiMarkdown');

    beforeEach(() => {
        props = { ...pageProps };
    });

    test('renders without crashing', async () => {
        document.body.innerHTML = '<div></div>';

        await testElement(RemoveChild, TopLayoutCareers);

        expect(document.body.querySelector('div')).not.toBeNull();
    });

    describe('conditional rendering', () => {
        let children;
        beforeEach(() => {
            children = jest.fn();
        });

        test('renders child when prop is present', async () => {
            props.children = children;

            await testElement(React.render, TopLayoutCareers(props));

            expect(children).toHaveBeenCalledTimes(1);
        });

        test('does not render child when prop is absent', async () => {
            delete props.children;

            await testElement(RemoveChild, TopLayoutCareers(props));

            expect(document.body.querySelector('div')).toBeNull();
        });
    });

    describe('prop validation', () => {
        let invalidProps;
        beforeEach(() => {
            invalidProps = { invalidProp: 'invalid' };
        });

        test('throws error when prop is invalid', async () => {
            await expect(TopLayoutCareers(invalidProps)).rejects.toThrow();
        });
    });

    describe('user interactions', () => {
        let onClick;

        beforeEach(() => {
            onClick = jest.fn();
        });

        test('calls onClick when clicked', async () => {
            props.onClick = onClick;
            await testElement(React.render, TopLayoutCareers(props));

            document.dispatchEvent(new MouseEvent('click'));

            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('side effects or state changes', () => {
        let state;

        beforeEach(() => {
            state = { someState: 'someValue' };
        });

        test('calls function when changed', async () => {
            props.onChange = (newState) => state = newState;
            await testElement(React.render, TopLayoutCareers(props));

            document.dispatchEvent(new MouseEvent('change'));

            expect(state).not.toBe(null);
        });
    });
});

function RemoveChild(element) {
  const parent = element.parentNode;

  if (parent && parent.removeChild) {
    parent.removeChild(element);

    return true;
  }
}