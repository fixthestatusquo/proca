import React, { useEffect } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { portals } from "../actionPage";

import Grid from "@material-ui/core/Grid";

const removeEmpty = dom => {
  if (!dom) return;
  const nodeIterator = document.createNodeIterator(
    dom,
    NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT,
    node => {
      if (node.nodeType === Node.COMMENT_NODE) return NodeFilter.FILTER_ACCEPT;
      const d = node.data.trim();
      if (d.length === 0) return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_REJECT;
    }
  );
  while (nodeIterator.nextNode()) {
    nodeIterator.referenceNode.remove();
  }
};

const TwoColumns = props => {
  const config = useCampaignConfig();
  const id = "proca-wrapper";
  const dom = props.dom;
  let width = Number.parseInt(props.width, 10) || 5;
  const leftContent = config.portal?.filter(d => d.column === "left");

  if (!(width <= 12 && width >= 1)) {
    console.log(
      `width needs to be between 1 and 12, defaulting to 5, was ${width}`
    );
    width = 5;
  }

  if (props.width === 0) width = false;

  useEffect(() => {
    const content = document.getElementById(id);
    content && content.appendChild(dom.cloneNode(true));
  }, [dom]);

  if (leftContent && leftContent.length > 0) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12 - width} id={id}>
          {leftContent.map((c, i) => {
            const Component = portals[c.component];
            return <Component {...c} key={i} />;
          })}
        </Grid>
        <Grid item xs={12} sm={width}>
          {props.children}
        </Grid>
      </Grid>
    );
  }
  removeEmpty(dom);
  if (!dom || dom.childNodes.length === 0 || props.hidden)
    return <>{props.children}</>;

  if (
    dom.childNodes.length < 2 &&
    (dom.firstElementChild?.innerHTML?.length < 25 ||
      dom.childNodes[0].length < 25)
  ) {
    // there isn't any "real" content, no need to set columns
    return <>{props.children}</>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12 - width} id={id} />
      <Grid item xs={12} sm={width}>
        {props.children}
      </Grid>
    </Grid>
  );
};

export default TwoColumns;
