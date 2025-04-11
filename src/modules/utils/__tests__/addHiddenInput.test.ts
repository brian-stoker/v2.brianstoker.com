import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect' // for expect.extend
import userEvent from '@testing-library/user-event'

interface Props {
  form: HTMLFormElement
  name: string
  value: string
}

const AddHiddenInput = (props: Props) => {
  const [hiddenInput, setHiddenInput] = React.useState<string>( '')

  return (
    <div>
      {props.value && (
        <input type="text" onChange={(e) => setHiddenInput(e.target.value)} />
      )}
      <button onClick={() => props.addHiddenInput(props.form, props.name, hiddenInput)}>Add</button>
      <p>{hiddenInput}</p>
    </div>
  )
}

describe('AddHiddenInput', () => {
  beforeEach(() => {
    const form = document.createElement('form')
    document.body.appendChild(form)
  })

  afterEach(() => {
    document.body.removeChild(document.querySelector('.test-form') as HTMLFormElement)
  })

  it('renders without crashing', async () => {
    render(<AddHiddenInput value="test" addHiddenInput={() => {}} form={document.createElement('form')} />)
    expect(document.querySelector('.test-input')).toBeInTheDocument()
    expect(document.querySelector('.test-button')).toBeInTheDocument()
    expect(document.querySelector('.test-output')).toBeInTheDocument()
  })

  it('renders text input when props.value is present', async () => {
    render(<AddHiddenInput value="test" addHiddenInput={() => {}} form={document.createElement('form')} />)
    const testInput = document.querySelector('.test-input')
    userEvent.type(testInput, 'type')
    expect(document.querySelector('.test-output')).toBeInTheDocument()
  })

  it('calls addHiddenInput function on button click', async () => {
    const mockAddHiddenInput = jest.fn()
    render(<AddHiddenInput value="test" addHiddenInput={mockAddHiddenInput} form={document.createElement('form')} />)
    const testButton = document.querySelector('.test-button')
    userEvent.click(testButton)
    expect(mockAddHiddenInput).toHaveBeenCalledTimes(1)
  })

  it('calls addHiddenInput function with correct props when clicked', async () => {
    const mockAddHiddenInput = jest.fn()
    render(<AddHiddenInput value="test" addHiddenInput={mockAddHiddenInput} form={document.createElement('form')} />)
    const testButton = document.querySelector('.test-button')
    userEvent.click(testButton)
    expect(mockAddHiddenInput).toHaveBeenCalledTimes(1)
    expect(mockAddHiddenInput).toHaveBeenCalledWith(document.querySelector('#test-form') as HTMLFormElement, 'test', '')
  })

  it('sets hidden input when button is clicked and form has value', async () => {
    const mockAddHiddenInput = jest.fn()
    render(<AddHiddenInput value="test" addHiddenInput={mockAddHiddenInput} form={document.createElement('form')} />)
    document.querySelector('#test-form') as HTMLFormElement?.value = 'test'
    const testButton = document.querySelector('.test-button')
    userEvent.click(testButton)
    expect(document.querySelector('.test-output')).toBeInTheDocument()
  })

  it('does not set hidden input when button is clicked and form has no value', async () => {
    const mockAddHiddenInput = jest.fn()
    render(<AddHiddenInput value="" addHiddenInput={mockAddHiddenInput} form={document.createElement('form')} />)
    document.querySelector('#test-form') as HTMLFormElement?.value = ''
    const testButton = document.querySelector('.test-button')
    userEvent.click(testButton)
    expect(document.querySelector('.test-output')).not.toBeInTheDocument()
  })

  it('renders output when input has value', async () => {
    render(<AddHiddenInput value="test" addHiddenInput={() => {}} form={document.createElement('form')} />)
    const testOutput = document.querySelector('.test-output')
    expect(testOutput).toBeInTheDocument()
  })

  it('does not render output when input has no value', async () => {
    render(<AddHiddenInput value="" addHiddenInput={() => {}} form={document.createElement('form')} />)
    const testOutput = document.querySelector('.test-output')
    expect(testOutput).not.toBeInTheDocument()
  })
})