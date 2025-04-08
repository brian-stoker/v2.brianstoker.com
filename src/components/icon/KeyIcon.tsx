import * as React from 'react';
import { useTheme, styled, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';
import Key from './Key';

export type KeyIconProps = {
  indexKey: number;
  height?: number;
  mode?: '' | 'light' | 'dark';
  sx?: SxProps<Theme>;
  width?: number;
};



export default function KeyIcon(props: KeyIconProps) {
  const { height: heightProp, indexKey, width: widthProp, mode: modeProp, ...other } = props;
  const theme = useTheme();
  return (
    <Key
      theme={theme}
      height={74}
      width={74}
      indexKey={indexKey}
      {...other}
    />
  );
}
