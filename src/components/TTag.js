import React from "react";
import { Trans, useTranslation } from "react-i18next";
import _snarkdown from "snarkdown";

const snarkdown = (md) => {
  const htmls = md
    .split(/(?:\r?\n){2,}/)
    .map((l) =>
      [" ", "\t", "#", "-", "*"].some((ch) => l.startsWith(ch))
        ? _snarkdown(l)
        : `<p>${_snarkdown(l)}</p>`
    );

  return htmls.join("\n\n");
};

const TTag = (props) => {
  const { t, i18n } = useTranslation();
  //const tbr = (key) => t(key).replace(/\n- /g, "<li>").replace(/\n/g, "<br>");
  if (!i18n.exists(props.message)) return null;
  const tbr = (key) => snarkdown(t(key));
  if (props.dangerouslySet === true) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: snarkdown(t(props.message, props)),
        }}
      ></div>
    );
  }
  return <Trans t={tbr} i18nKey={props.message}></Trans>;
  //return /* i18next-extract-disable-line */ t(props.message);
};

export default TTag;
