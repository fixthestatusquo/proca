import React from "react";
import { Trans,  useTranslation } from "react-i18next";
import _snarkdown from "snarkdown";
import { makeStyles } from "@material-ui/core/styles";

export const snarkdown = md => {
  const htmls = md
    .split(/(?:\r?\n){2,}/)
    .map(l =>
      [" ", "\t", "#", "-", "*"].some(ch => l.startsWith(ch))
        ? _snarkdown(l)
        : `<p>${_snarkdown(l)}</p>`
    );
  return htmls.join("\n\n");
};

// markdown overrides the title color, this is how we fix it
const useStyles = makeStyles((theme) => ({
  markdown: {
    color: theme.palette.primary.contrastText,
    "& h1, & h2, & h3, & h4, & h5, & h6, & p, & strong, & em": {
      color: "inherit !important",
    },
  },
}));

export const Markdown = (props) => {
  const { t } = useTranslation();
  const tbr = (key) => snarkdown(t(key, props));
  const classes = useStyles();

  return (
    <div className={classes.markdown}>
      <Trans t={tbr} i18nKey={props.text} />
    </div>
  );
};

const TTag = props => {
  const { t, i18n } = useTranslation();
  //const tbr = (key) => t(key).replace(/\n- /g, "<li>").replace(/\n/g, "<br>");
  if (!i18n.exists(props.message)) return null;
  if (props.dangerouslySet === true) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: snarkdown(t(props.message, props)),
        }}
      />
    );
  }

// Extract React components from props
  const components = {};
  const values = {};
  Object.keys(props).forEach(key => {
    if (key === 'message') return;
    if (React.isValidElement(props[key])) {
      components[key] = props[key];
    } else {
      values[key] = props[key];
    }
  });
  return <Markdown text={props.message} {...props} />;
  //return <Trans t={tbr} i18nKey={props.message}></Trans>;
  //return /* i18next-extract-disable-line */ t(props.message);
};

export default TTag;
