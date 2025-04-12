import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog'

describe('Page component', () => {
    let page
    const docs = require('./introducing-pigment-css.md?muiMarkdown')

    beforeEach(() => {
        page = render(<TopLayoutBlog docs={docs} />)
    })

    it('renders without crashing', () => {
        expect(page).toBeInTheDocument()
    })

    describe('conditional rendering', () => {
        it('renders TopLayoutBlog with props', () => {
            expect(page.body().innerHTML).toContain('Introduction to pigment.css')
        })

        it('renders empty div when no docs prop is provided', () => {
            const newPage = render(<TopLayoutBlog />)
            expect(newPage.body().innerHTML).toBe('')
        })
    })

    describe('prop validation', () => {
        it('accepts valid docs prop', () => {
            expect(page.props.docs).toBe(docs)
        })

        it('rejects invalid docs prop (non-object)', () => {
            const newPage = render(<TopLayoutBlog docs={123} />)
            expect(newPage.props(docs)).toBe(null)
        })

        it('rejects invalid docs prop (empty object)', () => {
            const newPage = render(<TopLayoutBlog docs={} />)
            expect(newPage.props.docs).toBe(null)
        })
    })

    describe('user interactions', () => {
        it('calls docs prop when clicked', async () => {
            const docsClickHandlerMock = jest.fn()
            page.getByRole('button').click()
            expect(docsClickHandlerMock).toHaveBeenCalledTimes(1)
        })

        it('calls docs prop when input changes', async () => {
            const inputChangeMock = jest.fn()
            fireEvent.change(page.getByPlaceholderText('Search docs'), { target: { value: 'Search' } })
            expect(inputChangeMock).toHaveBeenCalledTimes(1)
        })

        it('calls docs prop when form is submitted', async () => {
            const formSubmitMock = jest.fn()
            fireEvent.click(page.getByRole('button', { name: 'Search docs' }))
            expect(formSubmitMock).toHaveBeenCalledTimes(1)
        })
    })

    describe('side effects and state changes', () => {
        it('renders with the correct text after updating props', async () => {
            const updatedDocs = { newTitle: 'Updated title' }
            await waitFor(() => page.getByRole('heading').textContent, expect.to.equal(updatedDocs.newTitle))
            page.updateProps({ docs: updatedDocs })
        })

        it('applies styles when passed in a css string prop', async () => {
            const cssPropMock = { style: 'some CSS' }
            await waitFor(() => page.getByRole('heading').style.cssText, expect.to.equal(cssPropMock.style))
            page.updateProps({ docs: { style: cssPropMock.style } })
        })
    })

    it('renders a snapshot', async () => {
        const newPage = render(<TopLayoutBlog docs={docs} />)
        await waitFor(() => expect(newPage.asFragment()).toMatchSnapshot())
    })
})