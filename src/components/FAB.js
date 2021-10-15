import React from "react";
import ReactDOM from "react-dom";

import { makeStyles } from "@material-ui/core/styles";

import { Fab, Slide, Badge } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import useCount from "../hooks/useCount.js";
import CreateIcon from "@material-ui/icons/Create";

const useStyles = makeStyles((theme) => ({
  fab: {
    margin: 0,
    top: "auto",
    right: 20,
    bottom: 20,
    left: "auto",
    position: "fixed",
    zIndex: theme.zIndex["tooltip"],
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

/*const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
*/
export default function FABAction(props) {
  //  const theme = useTheme();

  const { t } = useTranslation();

  let counter = useCount(props.actionPage);

  const handleClickOpen = () => {
    props.done();
  };

  const classes = useStyles();

  const createDom = (id) => {
    let el = document.getElementById(id);
    if (!el) {
      const el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
    return el;
  };

  let callToAction = t("Sign now!");
  let isDonate = false;

  const nextAction = props.journey[props.current + 2];
  if (nextAction.startsWith("donate")) {
    isDonate = true;
    callToAction = t("Donate now!");
  }

  const dom = createDom("proca-fab");

  return (
    dom &&
    ReactDOM.createPortal(
      <>
        <div className={classes.fab}>
            <Badge
              badgeContent={counter}
              max={9999999}
              color="secondary"
              overlap="circle"
            >
              <Fab
                color="primary"
                variant="extended"
                aria-label={callToAction}
                onClick={handleClickOpen}
              >
                {!isDonate && <CreateIcon />}
                {callToAction}&nbsp;
              </Fab>
            </Badge>
        </div>
      </>,
      dom
    )
  );
}
