import React from 'react';
import { StylesProvider, createGenerateClassName, createMuiTheme,ThemeProvider } from '@material-ui/core/styles';
//import CssBaseline from '@material-ui/core/ScopedCssBaseline';
//import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import {useLayout} from  "../hooks/useConfig";

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

    //<ScopedCssBaseline>
export default function ProcaStyle(props) {
  const layout = useLayout();
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          primary:{main: layout.primaryColor},
          secondary:{main: layout.secondaryColor},
          type:layout.theme
        },
        typography: {
          fontFamily: 'unset!important',
          htmlFontSize: parseInt(window.getComputedStyle(document.getElementsByTagName('html')[0], null).getPropertyValue('font-size')), // get the actual font size
      //    fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif`,
      //    fontSize: 14,
        },
        overrides: {
          MuiContainer: {
            root: {
              fontFamily: 'unset!important',paddingLeft:'0!important',paddingRight:'0!important',
              backgroundColor: (layout.theme === 'dark'? '#303030': 'inherit'),
            }
          },
          MuiIconButton: {
            root: {width: 'auto!important', minWidth:'auto!important'}
          },
          MuiDialog: {
            root: {fontFamily: 'unset!important',}
          },
          MuiFilledInput: {
            multiline: {
              paddingTop: '23px!important',
              paddingBottom: '6px!important',
            },
            marginDense: {
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
      }),
    [layout],
  );
  // palette.background.default
  for (const d in theme.zIndex) { // force the widget on the top
    theme.zIndex[d] += 100000;
  }

  return (
    <StylesProvider generateClassName={generateClassName}>
    <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </StylesProvider>
  );
}
