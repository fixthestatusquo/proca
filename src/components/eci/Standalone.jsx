import React from "react";

import { useIsMobile } from "@hooks/useLayout";
import Grid from "@mui/material/Grid";

import Support from './Support';
import More from './More';
import TTag from '../TTag';

const Standalone = (props) => {
  let isMobile = useIsMobile();
  const width = isMobile ? 12 : 7;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12 - width}>
    <TTag message="campaign:description" />
    <More />
    </Grid>
      <Grid item xs={12} sm={width}>
  <Support {...props} />
      </Grid>
    </Grid>
  );
};

export default Standalone;
