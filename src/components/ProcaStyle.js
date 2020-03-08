import React from 'react';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

const generateClassName = createGenerateClassName({
  disableGlobal: false,
  productionPrefix: 'Proca',
  seed:'proca',
});

export default function ProcaStyle(props) {
  return (
    <StylesProvider generateClassName={generateClassName}>{props.children}</StylesProvider>
  );
}
