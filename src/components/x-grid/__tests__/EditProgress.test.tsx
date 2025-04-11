import '@testing-library/jest-dom';
import React from 'react';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import EditProgress from './EditProgress';
import {debounce} from '@mui/material/utils';
import {alpha} from '@mui/material/styles';
import Slider, {SliderValueLabelProps} from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';

describe('EditProgress', () => {
  let apiRef;
  const props = {
    id: '1',
    value: '0.5',
    field: 'field',
  };

  beforeEach(() => {
    apiRef = jest.fn();
    useGridApiContext.mockImplementation(() => apiRef);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(createComponent(props)).toMatchSnapshot();
  });

  it('renders value label correctly', () => {
    const component = createComponent(props);

    expect(component).toHaveStyleRule('MuiSlider-thumb');
    expect(component).toHaveStyleRule('MuiSlider-track');
    expect(component).toHaveStyleRule('MuiSlider-rail');

    expect(component.querySelector('.MuiSlider-valueLabel')).not.toBeNull();
  });

  it('updates cell value correctly', () => {
    const component = createComponent(props);
    const updateCellEditPropsSpy = jest.fn();

    component.updateCellEditProps = updateCellEditPropsSpy;
    props.value = '1';

    component.handleChange(null, null);

    expect(updateCellEditPropsSpy).toHaveBeenCalledTimes(1);
    expect(updateCellEditPropsSpy).toHaveBeenCalledWith('1');
  });

  it('calls debounced function on input change', () => {
    const component = createComponent(props);
    const handleChangeSpy = jest.fn();
    props.value = '0.5';

    component.handleChange = handleChangeSpy;
    component.debounceUpdateCellEditProps = debounce(component.updateCellEditProps, 60);

    document.body.dispatchEvent(new Event('input'));

    expect(handleChangeSpy).toHaveBeenCalledTimes(1);
    expect(handleChangeSpy).toHaveBeenCalledWith(null, '0.5');
  });

  it('updates state correctly when value changes', () => {
    const component = createComponent(props);
    const setValueStateSpy = jest.fn();

    props.value = '1';

    component.setValueState = setValueStateSpy;

    expect(setValueStateSpy).toHaveBeenCalledTimes(1);
    expect(setValueStateSpy).toHaveBeenCalledWith(1);
  });

  it('calls handleRef when element is given', () => {
    const component = createComponent(props);
    const handleRefSpy = jest.fn();

    props.field = 'field';
    document.body.appendChild(component);

    component.handleRef({});

    expect(handleRefSpy).toHaveBeenCalledTimes(1);
    expect(handleRefSpy).toHaveBeenCalledWith(document.body);
  });

  it('does not call handleRef when element is null', () => {
    const component = createComponent(props);
    const handleRefSpy = jest.fn();

    props.field = 'field';
    document.body.appendChild(component);

    component.handleRef(null);

    expect(handleRefSpy).not.toHaveBeenCalled();
  });

  it('calls updateCellEditProps when value changes', () => {
    const component = createComponent(props);
    const updateCellEditPropsSpy = jest.fn();

    props.value = '1';

    component.updateCellEditProps = updateCellEditPropsSpy;

    expect(updateCellEditPropsSpy).toHaveBeenCalledTimes(1);
    expect(updateCellEditPropsSpy).toHaveBeenCalledWith('1');
  });

  it('does not call updateCellEditProps when value is the same', () => {
    const component = createComponent(props);
    const updateCellEditPropsSpy = jest.fn();

    props.value = '0.5';

    component.updateCellEditProps = updateCellEditPropsSpy;

    expect(updateCellEditPropsSpy).toHaveBeenCalledTimes(1);
    expect(updateCellEditPropsSpy).toHaveBeenCalledWith('0.5');

    props.value = '0.5';

    expect(updateCellEditPropsSpy).not.toHaveBeenCalled();
  });
});

function createComponent(props: GridRenderEditCellParams) {
  return <EditProgress {...props} />;
}