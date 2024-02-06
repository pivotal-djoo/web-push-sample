import { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
      contrastText: '#555555',
    },
    secondary: {
      main: '#aaaaaa',
      contrastText: '#555555',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#555555',
          '&.Mui-selected': {
            backgroundColor: '#ffffff',
            color: '#555555',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
            color: '#555555',
          },
        },
      },
    },
  },
});
