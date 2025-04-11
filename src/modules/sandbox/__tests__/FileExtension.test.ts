import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { getFileExtension as getFileExtensionFunction } from './getFileExtension'

describe('getFileExtension', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return tsx when codeVariant is TS', () => {
        const codeVariant = 'TS'
        const result = getFileExtensionFunction(codeVariant)
        expect(result).toBe('tsx')
    })

    it('should return js when codeVariant is JS', () => {
        const codeVariant = 'JS'
        const result = getFileExtensionFunction(codeVariant)
        expect(result).toBe('js')
    })

    it('should throw an error for invalid code variant', () => {
        const codeVariant = 'Invalid'
        expect(() => getFileExtensionFunction(codeVariant)).toThrowError(
            `Unsupported codeVariant: ${codeVariant}`
        )
    })

    describe('rendering', () => {
        it('renders without crashing', async () => {
            const { container } = render(<getFileExtension codeVariant="TS" />)
            expect(container).toBeTruthy()
        })

        it('should conditionally render based on code variant', async () => {
            const { container } = render(
                <div>
                    <getFileExtension codeVariant="TS" />
                    <getFileExtension codeVariant="JS" />
                </div>
            )
            expect(container).toContainHTML('<span>tsx</span>')
            expect(container).not.toContainHTML('<span>js</span>')
        })
    })

    describe('interactions', () => {
        const { getByText } = render(<getFileExtension codeVariant="TS" />)

        it('should handle click events correctly', async () => {
            const buttonElement = getByText(/tsx/i)
            fireEvent.click(buttonElement)
            expect(getByText('tsx')).toHaveClass('active')
        })

        it('should handle input changes correctly', async () => {
            const inputElement = getByText('ts')
            fireEvent.change(inputElement, { target: { value: 'TS' } })
            expect(getByText('tsx')).toBeInTheDocument()
        })
    })

    describe('validation', () => {
        it('should validate props correctly', () => {
            expect(() => render(<getFileExtension codeVariant="Invalid" />)).toThrow(
                Error
            )
        })
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })
})