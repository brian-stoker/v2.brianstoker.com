import * as React from 'react';
import {Theme, useTheme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import Key from './Key';

export type KeyIconProps = {
  indexKey: number;
  height?: number;
  mode?: '' | 'light' | 'dark';
  sx?: SxProps<Theme>;
  width?: number;
  selected: number;
};



export default function KeyIcon(props: KeyIconProps) {
  const { height: heightProp, indexKey, width: widthProp, mode: modeProp, selected, ...other } = props;
  const theme = useTheme();
  return (
    <Key
      theme={theme}
      height={74}
      width={74}
      indexKey={indexKey}
      selected={selected}
      {...other}
    />
  );
}
