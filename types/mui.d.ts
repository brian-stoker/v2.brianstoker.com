import { Theme as MuiTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme extends MuiTheme {
    vars?: {
      palette: {
        primary: {
          mainChannel: string;
          [key: string]: any;
        };
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
} 