import React, { useLayoutEffect, useRef } from 'react'
//import useCount from "@hooks/useCount.js";
import { CountUp }from 'countup.js';
import {useCampaignConfig} from "@hooks/useConfig.js";

function getThousandsSeparator(locale = navigator.language) {
  if (locale.substr(0,2) !== 'de') return '\u00A0';

  const numberFormat = new Intl.NumberFormat(locale);
  const parts = numberFormat.formatToParts(1234567);
  const groupPart = parts.find(part => part.type === 'group');
  return groupPart ? groupPart.value :  '\u202F';
}

export default function Counter(props) {
  const {component} = useCampaignConfig();  
  const countup = useRef(null);
  const countUpRef = useRef(null);
  const step = component.counter.step || 1;
  const from = new Date(component.counter.start);  
  const counter =(now = new Date()) =>  Math.floor((now - from) / 1000 * step);
  useLayoutEffect(() => {
    initCountUp();
    const interval = setInterval(() => {
      countUpRef.current.update(counter());
    }, 2000);
  }, []);

  async function initCountUp() {
    countUpRef.current = new CountUp(countup.current, counter(),{enableScrollSpy:true, duration:1.5,  useEasing: true, separator: getThousandsSeparator()});
    if (!countUpRef.current.error) {
      countUpRef.current.start();
    } else {
      console.error(countUpRef.current.error);
    }
  }
  
//  const count = useCount(props.actionPage) || props.count;
  return <span ref={countup}>100</span>;
}
