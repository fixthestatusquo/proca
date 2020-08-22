import {useEffect} from 'react';

const Component = (props) => {

  const click = props.done || props.click;
  const selector = props.watchSelector
  useEffect (()=> {
    const d = document.querySelectorAll(selector);
    d.forEach( (e) => {
      console.log(e);
      e.onclick = (event) => {
        event.preventDefault();
        click (e);
      }
    });

  },[click,selector]);

  return null;

};

Component.defaultProps = {
  watchSelector: "[href='#proca_dialog'],.proca-button",
  click: (e) => (alert("default action, needs to overwrite"))
}

export default Component;
