import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import TopLayoutCareers from '../components/TopLayoutCareers'
import * as pageProps from './pages/careers/full-stack-engineer.md?muiMarkdown'

describe('Page Component', () => {
  const Page = () => <TopLayoutCareers {...pageProps} />

  beforeEach(() => {
    jest.clearMocks()
  })

  it('renders without crashing', async () => {
    const { container } = render(<Page />)
    expect(container).toBeInTheDocument()
  })

  describe('conditional rendering', () => {
    it('renders when props are valid', async () => {
      const props = pageProps
      const { container } = render(<Page {...props} />)
      await waitFor(() => container)
      expect(container).toBeInTheDocument()
    })

    it('does not render when props are invalid', async () => {
      const props = { ...pageProps, invalidProp: 'invalidValue' }
      const { container } = render(<Page {...props} />)
      expect(container).not.toBeInTheDocument()
    })
  })

  describe('prop validation', () => {
    it('allows valid props to pass through', async () => {
      const props = pageProps
      const { container } = render(<Page {...props} />)
      await waitFor(() => container)
      expect(container).toBeInTheDocument()
    })

    it('prevents invalid props from passing through', async () => {
      const invalidProp = 'invalidValue'
      const props = { ...pageProps, invalidProp }
      const { container } = render(<Page {...props} />)
      expect(container).not.toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('responds to clicks on the component', async () => {
      const onClickMock = jest.fn()
      const props = pageProps
      props.onClick = onClickMock
      const { getByText } = render(<Page {...props} />)
      const element = getByText(/clickable/i)
      fireEvent.click(element)
      expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('responds to input changes on the component', async () => {
      const onChangeMock = jest.fn()
      const props = pageProps
      props.onChange = onChangeMock
      const { getByText } = render(<Page {...props} />)
      const element = getByText(/inputField/i)
      fireEvent.change(element, { target: { value: 'newValue' } })
      expect(onChangeMock).toHaveBeenCalledTimes(1)
    })

    it('responds to form submissions on the component', async () => {
      const onSubmitMock = jest.fn()
      const props = pageProps
      props.onSubmit = onSubmitMock
      const { getByText, getByPlaceholderText } = render(<Page {...props} />)
      const element = getByText(/submit Button/i)
      fireEvent.submit(getByPlaceholderText('form'))
      expect(onSubmitMock).toHaveBeenCalledTimes(1)
    })
  })

  it('does not cause any side effects', async () => {
    const sideEffectMock = jest.fn()
    const props = pageProps
    props.sideEffect = sideEffectMock
    const { container } = render(<Page {...props} />)
    await waitFor(() => container)
    expect(sideEffectMock).not.toHaveBeenCalled()
  })
})