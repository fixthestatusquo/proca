import React from 'react';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

const generateClassName = createGenerateClassName({
  disableGlobal: false,
  productionPrefix: 'Proca',
  seed:'proca',
});

export default function ProcaStyle(props) {
  console.log("procaStyle");
  return (
    <StylesProvider generateClassName={generateClassName}>{props.children}</StylesProvider>
  );
}
