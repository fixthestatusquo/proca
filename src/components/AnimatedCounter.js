import React, { useEffect, useRef } from 'react'
//import useCount from "@hooks/useCount.js";
import { CountUp }from 'countup.js';
import {useComponentConfig} from "@hooks/useConfig.js";

function getThousandsSeparator(locale = navigator.language) {
  const numberFormat = new Intl.NumberFormat(locale);
  const parts = numberFormat.formatToParts(1234567);
  const groupPart = parts.find(part => part.type === 'group');
  return groupPart ? groupPart.value :  "'";
}

export default function Counter(props) {
  const component = useComponentConfig();  
  const countupRef = useRef(null);
  const step = component.counter.step || 1;
  const from = new Date(component.counter.start);  
  const counter =(now = new Date()) =>  Math.floor((now - from) / 1000 * step);
  const goal = useRef(counter());
  let countUpAnim;
 console.log (counter);
  useEffect(() => {
    initCountUp();
  }, []);

  async function initCountUp() {
    countUpAnim = new CountUp(countupRef.current, goal.current,{enableScrollSpy:true, duration:2 });
    if (!countUpAnim.error) {
      countUpAnim.start(()=>{goal.current = counter();countUpAnim.update(goal.current )});
    } else {
      console.error(countUpAnim.error);
    }
  }
  
//  const count = useCount(props.actionPage) || props.count;
  return <div ref={countupRef}>100</div>;
}
