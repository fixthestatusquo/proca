import React, { useState } from "react";

import { Button } from "@material-ui/core";
//import { useTranslation } from "react-i18next";
import Dialog from '../Dialog';

export default function Details (props) {
  const [open, setOpen] =useState(false);
//  const { t } = useTranslation();
  const button = React.useRef(null);
// lots of weirdness to prevent the portal to re-instance. TODO: fix
  const handleClick= (e) => {
    setOpen(true);
  };
  React.useEffect(()=>{
    if (button.current) 
      button.current.onclick =handleClick;
     
  });

    //<Dialog open={open}>More</Dialog>
  return <>
    {open && <Dialog>aaa</Dialog>}
    <Button ref={button}>More</Button>
  </>;
};
