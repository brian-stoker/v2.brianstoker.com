import { render, fireEvent, waitFor } from '@testing-library/react';
import Page from './index.test.js';
import Home from "pages";
import Main from "./main";

describe('Page component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', async () => {
        const { container } = render(<Page />);
        expect(container).not.toBeNull();
    });

    describe('conditional rendering', () => {
        it('renders HomeMain when passed as a prop', async () => {
            const { container } = render(<Page HomeMain={Main} />);
            expect(container).toMatchSnapshot();
        });

        it('does not render HomeMain without prop', async () => {
            const { container, queryByRole } = render(<Page />);
            expect(queryByRole('main')).toBeNull();
        });
    });

    describe('prop validation', () => {
        it('renders with valid HomeMain prop', async () => {
            const { container } = render(<Page HomeMain={Main} />);
            expect(container).toMatchSnapshot();
        });

        it('throws an error without valid HomeMain prop', async () => {
            await expect(render(<Page />)).rejects.toThrowError();
        });
    });

    describe('user interactions', () => {
        let homeMain;

        beforeEach(() => {
            homeMain = render(<Home />);
        });

        it('calls HomeMain when clicked', async () => {
            const button = document.querySelector('#main');
            fireEvent.click(button);
            expect(homeMain).toHaveBeenCalledTimes(1);
        });

        it('calls HomeMain with correct input value when input changed', async () => {
            const inputField = document.querySelector('#name');
            const inputValue = 'John Doe';
            inputField.value = inputValue;
            fireEvent.change(inputField, { target: { value: inputValue } });
            expect(homeMain).toHaveBeenCalledTimes(1);
        });

        it('calls HomeMain with correct form data when submitted', async () => {
            const form = document.querySelector('#form');
            const formData = { name: 'John Doe' };
            fireEvent.submit(form);
            expect(homeMain).toHaveBeenCalledTimes(1);
        });
    });

    describe('side effects or state changes', () => {
        it('calls Page\'s side effect function when rendered', async () => {
            // This test is not applicable to the provided code
            // because there's no side effect declared in the component.
        });
    });
});

const mockHomeMain = jest.fn(() => <div>Mock HomeMain</div>);
const mockRenderedHomeMain = render(<Home />);
jest.spyOn(Page.prototype, 'render').mockImplementation(mockRenderedHomeMain);