import React, { useEffect } from "react";

import Grid from "@material-ui/core/Grid";

const TwoColumns = (props) => {
  const id = "proca-wrapper";
  const dom = props.dom;
  let width = parseInt(props.width, 10) || 5;

  if (!(width <= 12 && width >= 1)) {
    console.log(
      "width needs to be between 1 and 12, defaulting to 5, was " + width
    );
    width = 5;
  }

  if (props.width === 0) width = false;

  useEffect(() => {
    const content = document.getElementById(id);
    content && content.appendChild(dom.cloneNode(true));
  }, [dom]);

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
      <Grid item xs={12} sm={12 - width} id={id}></Grid>
      <Grid item xs={12} sm={width}>
        {props.children}
      </Grid>
    </Grid>
  );
};

export default TwoColumns;
