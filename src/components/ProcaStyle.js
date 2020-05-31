import React from 'react';
import { StylesProvider, createGenerateClassName, createMuiTheme,ThemeProvider } from '@material-ui/core/styles';

const generateClassName = createGenerateClassName({
  disableGlobal: false,
  productionPrefix: 'Proca',
  seed:'proca',
});
/*
const GlobalCss = withStyles({
  // @global is handled by jss-plugin-global.
  '@global': {
    // You should target [class*="MuiButton-root"] instead if you nest themes.
    '.proca-MuiInputBase-input': {
      background:'unset!important',
      border:'unset!important',
    },
  },
})(() => null);
*/

const theme = createMuiTheme({
  typography: {
    fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif`,
    fontSize: 14,
  },
  overrides: {
    MuiContainer: {
      root: {
        fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif`
      }
    },
    MuiDialog: {
      root: {
        fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif`,
      }
    },
    MuiFilledInput: {
      multiline: {
        paddingTop: '23px!important',
        paddingBottom: '6px!important',
      },
      marginDense: {
        background:'pink'
      }
    },
    MuiInputBase: {
      input: {
        background: 'unset!important',
        border: 'unset!important',
        // this is where magic happens
//        '& *': { color: 'rgba(255, 255, 255, 0.7)' },
      },
    },
  },
});

for (const d in theme.zIndex) {
  theme.zIndex[d] += 10000;
}

export default function ProcaStyle(props) {
  return (
    <StylesProvider generateClassName={generateClassName}><ThemeProvider theme={theme}>{props.children}</ThemeProvider></StylesProvider>
  );
}
