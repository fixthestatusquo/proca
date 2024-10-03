import React, { useLayoutEffect, useState } from "react";
import Alert from "@components/Alert";
import useData from "@hooks/useData";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";

function Component(props) {
  const data = useData();
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useLayoutEffect(() => {
    const dom = props.dom || ".proca-html";
    const replacer = v => {
      // replace tokens {fieldname} by config.data[fieldname] (if it exists)
      const k = v.slice(1, -1);
      return data[k] || v;
    };
    try {
      const template = document.querySelector(dom);
      if (template) {
        template.style.display = "none";
        document.getElementById("proca-html-root").innerHTML =
          template.innerHTML.replace(/(\{[^}]+\})/g, replacer);
      } else {
        setError(`missing template dom with class ${dom}`);
      }
    } catch (e) {
      setError(`missing template dom with class ${dom}`);
      console.log(e);
    }
    //    return () => {};
  }, [props.dom, data]);

  return error ? (
    <React.Fragment>
      <Alert severity="error" text={error} />
      <span role="img" aria-label="error">
        🐛
      </span>
    </React.Fragment>
  ) : (
    <div>
      <div id="proca-html-root">...</div>
      <Button
        endIcon={<SkipNextIcon />}
        fullWidth
        variant="contained"
        onClick={props.done}
        color="primary"
      >
        {t("Next")}
      </Button>
    </div>
  );
}

export default Component;
