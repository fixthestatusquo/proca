import React from 'react';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

const generateClassName = createGenerateClassName({
  productionPrefix: 'Proca',
  seed:'proca',
});

export default function ProcaStyle(props) {
  return (
    <StylesProvider generateClassName={generateClassName}>{props.children}</StylesProvider>
  );
}
