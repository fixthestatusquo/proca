import React,{useLayoutEffect,useState} from 'react';
import Alert from './Alert';
import useConfig from '../hooks/useConfig';

function Component (props) {
  const config=useConfig().config;
  console.log(config);
  const [error,setError] = useState(null);

  useLayoutEffect(() => {
    const dom = props.dom || '.proca-html';
    const replacer=(v) => { // replace tokens {fieldname} by config.data[fieldname] (if it exists)
      const k=v.slice(1,-1);
      return config.data[k] || v
    };
    try {
      let template = document.querySelector(dom);
      template.style.display = "none";
      document.getElementById('proca-html-root').innerHTML= template.innerHTML.replace(/(\{[^}]+\})/g,replacer);
//      document.getElementById('proca-html-root').innerHTML= template.innerHTML;
    } catch (e) {
      setError("missing template dom with class "+dom);
      console.log(e);
    }
//    return () => {};
  },[props.dom,config.data]);

  return error 
    ? <React.Fragment><Alert severity='error' text={error} /><span role="img" aria-label="error">🐛</span></React.Fragment>
    : <div id='proca-html-root'>...</div>;

}

export default Component;
