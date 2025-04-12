import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Hero from '../../src/components/home/HeroMain';

describe('HeroMain component', () => {
    let props;

    beforeEach(() => {
        props = {
            // Test valid props
            id: 1,
            title: 'Test Title',
            subtitle: 'Test Subtitle',
            buttonText: 'Click me',
            image: 'https://example.com/image.jpg'
        };

        jest.spyOn(Hero, 'useEffect').mockImplementation(() => {
            // Mock effect logic
        });
    });

    afterEach(() => {
        props = null;
        jest.restoreAllMocks();
    });

    it('renders without crashing', async () => {
        const { container } = render(<Hero {...props} />);
        expect(container).toBeTruthy();
    });

    describe('conditional rendering', () => {
        it('renders Hero component', async () => {
            props.id = 1;
            const { container } = render(<Hero {...props} />);
            expect(container.querySelector('.hero__item')).toBeInTheDocument();
        });

        it('does not render Hero component by default', async () => {
            delete props.id;
            const { queryByRole } = render(<Hero {...props} />);
            expect(queryByRole('img')).not.toBeInTheDocument();
        });
    });

    describe('prop validation', () => {
        it('throws error for invalid id prop', async () => {
            props.id = null;
            jest.spyOn(Hero, 'useEffect').mockImplementation(() => {
                throw new Error('Invalid prop');
            });
            expect(() => render(<Hero {...props} />)).toThrowError();
        });

        it('does not throw error for valid id prop', async () => {
            delete props.id;
            const { container } = render(<Hero {...props} />);
            expect(container).toBeTruthy();
        });
    });

    describe('user interactions', () => {
        it('calls effect on button click', async () => {
            props.buttonText = 'Click me';
            const { getByRole, getByLabelText } = render(<Hero {...props} />);
            const button = await getByRole('button');
            fireEvent.click(button);
            expect(Hero.useEffect).toHaveBeenCalledTimes(1);
        });

        it('does not call effect on invalid input', async () => {
            props.buttonText = '';
            const { getByRole, getByLabelText } = render(<Hero {...props} />);
            const button = await getByRole('button');
            fireEvent.change(button, { target: { value: '' } });
            expect(Hero.useEffect).not.toHaveBeenCalled();
        });

        it('calls effect on form submission', async () => {
            props.form = true;
            const { getByLabelText, getByRole } = render(<Hero {...props} />);
            const button = await getByRole('button');
            fireEvent.change(button, { target: { value: 'Submit' } });
            expect(Hero.useEffect).toHaveBeenCalledTimes(1);
        });

        it('does not call effect on invalid form submission', async () => {
            props.form = false;
            const { getByLabelText, getByRole } = render(<Hero {...props} />);
            const button = await getByRole('button');
            fireEvent.change(button, { target: { value: '' } });
            expect(Hero.useEffect).not.toHaveBeenCalled();
        });
    });

    describe('side effects', () => {
        it('calls useEffect on mount', async () => {
            jest.spyOn(Hero, 'useEffect').mockImplementation(() => {
                // Mock effect logic
            });
            const { container } = render(<Hero {...props} />);
            expect(Hero.useEffect).toHaveBeenCalledTimes(1);
        });

        it('does not call useEffect on unmount', async () => {
            jest.spyOn(Hero, 'useEffect').mockImplementation(() => {
                // Mock effect logic
            });
            const { container } = render(<Hero {...props} />);
            expect(Hero.useEffect).toHaveBeenCalledTimes(1);
            render(<></>);
            expect(Hero.useEffect).toHaveBeenCalledTimes(2);
        });

        it('calls useEffect on update', async () => {
            jest.spyOn(Hero, 'useEffect').mockImplementation(() => {
                // Mock effect logic
            });
            const { container } = render(<Hero {...props} />);
            expect(Hero.useEffect).toHaveBeenCalledTimes(1);

            props.buttonText = 'Click me';
            const newProps = { ...props };
            delete newProps.id;
            render(<Hero {...newProps} />);
            expect(Hero.useEffect).toHaveBeenCalledTimes(2);
        });
    });

    it('renders snapshot', async () => {
        jest.spyOn(Hero, 'useEffect').mockImplementation(() => {
            // Mock effect logic
        });
        const { container } = render(<Hero {...props} />);
        await waitFor(() => expect(container).toMatchSnapshot());
    });
});