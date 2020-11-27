import React from 'react';
import ReactDOM from 'react-dom';
import Widget from '../Widget';

it('renders without crashing', () => {
  const div = document.createElement('div');
  document.body.append(div)
  div.id="container"
  ReactDOM.render(<Widget selector='#container' journey={['Register']}/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
