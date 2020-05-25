import React from 'react';
import { StylesProvider, createGenerateClassName,withStyles } from '@material-ui/core/styles';

const generateClassName = createGenerateClassName({
  disableGlobal: false,
  productionPrefix: 'Proca',
  seed:'proca',
});

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

export default function ProcaStyle(props) {
  return (
    <StylesProvider generateClassName={generateClassName}><GlobalCss />{props.children}</StylesProvider>
  );
}
