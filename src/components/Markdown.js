import React, { useLayoutEffect, useState } from "react";
import Alert from "@components/Alert";
import useData from "@hooks/useData";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";
import { Markdown } from "@components/TTag";

const MarkdownPage = (props) => {
  const data = useData();
  const [error, setError] = useState(null);
  const config = useCampaignConfig();
  const { t } = useTranslation();

  const title = config.component.markdown?.title || "title";
  const text = config.component.markdown?.text || "text";
  const next = config.component.markdown?.next || "Next";

  return (
    <div>
      <div id="proca-html-root">
        <h3>
          <Markdown text={title} />
        </h3>
        <div>
          <Markdown text={text} />
        </div>
      </div>
      <Button
        endIcon={<SkipNextIcon />}
        fullWidth
        variant="contained"
        onClick={props.done}
        color="primary"
      >
        {t(next)}
      </Button>
    </div>
  );
};

export default MarkdownPage;
