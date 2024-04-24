import React from "react";
import {
  StylesProvider,
  createGenerateClassName,
  createTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import { makeStyles, createStyles } from "@material-ui/core";
//import CssBaseline from '@material-ui/core/ScopedCssBaseline';
//import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import { useLayout } from "@hooks/useLayout";

const generateClassName = createGenerateClassName({
  disableGlobal: false,
  productionPrefix: "Proca",
  seed: "proca",
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

const useStyles = makeStyles(() =>
  createStyles({
    "@global": {
      ".proca-text": {
        display: "none",
      },
    },
  }),
);

const GlobalStyles = () => {
  useStyles();
  return null;
};
//<ScopedCssBaseline>
export default function ProcaStyle(props) {
  const layout = useLayout();
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: { main: layout.primaryColor },
          secondary: { main: layout.secondaryColor },
          type: layout.theme,
        },
        typography: {
          fontFamily: "unset!important",
          htmlFontSize: parseInt(
            window
              .getComputedStyle(document.getElementsByTagName("html")[0], null)
              .getPropertyValue("font-size"),
          ), // get the actual font size
          //    fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif`,
          //    fontSize: 14,
        },
        overrides: {
          MuiSnackbar: {
            root: {
              zIndex: 30003,
            },
          },
          MuiContainer: {
            root: {
              fontFamily: "unset!important",
              paddingLeft: "0!important",
              paddingRight: "0!important",
              //              backgroundColor: layout.theme === "dark" ? "#303030" : "inherit",
            },
          },
          MuiButton: {
            root: { backgroundImage: "none!important" },
          },
          MuiIconButton: {
            root: { width: "auto!important", minWidth: "auto!important" },
          },
          MuiDialog: {
            root: { fontFamily: "unset!important" },
          },
          MuiFormControl: {
            root: { marginTop: "8px!important", marginBottom: "4px!important" },
          },
          MuiFilledInput: {
            root: {
              margin: "0px!important",
              "& input": {
                height: "1.1876em!important", //can't be on input otherwise the height of the comment multiline field can't expand
                width: "100%",
              },
              "& select": {
                height: "1.1876em!important",
              },
            },
            input: {
              paddingTop: "23px!important",
              paddingBottom: "10px!important",
            },
            inputMultiline: {},
            multiline: {
              paddingTop: "23px!important",
              paddingBottom: "6px!important",
              "& textarea": {
                minHeight: "23px!important",
                paddingTop: "0!important",
                paddingBottom: "0!important",
              },
            },
            marginDense: {},
          },
          MuiInputLabel: {
            root: {
              marginTop: 0,
            },
          },
          MuiInputBase: {
            input: {
              background: "unset!important",
              boxSizing: "initial!important",
              boxShadow: "unset!important",
              border: "unset!important",
              marginBottom: "0!important",
              // this is where magic happens
              //        '& *': { color: 'rgba(255, 255, 255, 0.7)' },
            },
          },
        },
      }),
    [layout],
  );
  // palette.background.default
  for (const d in theme.zIndex) {
    // force the widget on the top
    theme.zIndex[d] += 100000;
  }
  return (
    <StylesProvider generateClassName={generateClassName}>
      <GlobalStyles />
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </StylesProvider>
  );
}
