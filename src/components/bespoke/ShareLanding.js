import React, { useState, useEffect, useRef } from "react";
import Dialog from "@components/Dialog";
import Url from "@lib/urlparser";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const ShareLanding = () => {
  const [displayed, setDisplayed] = useState(true);
  const body = useRef(null);
  const utm = Url.utm();
  const landing = utm.source === "share";
  const config = useCampaignConfig();
  const { t } = useTranslation();

  const handleClick = (event) => {
    event.preventDefault();
    setDisplayed(false);
    const firstname = document.getElementsByName("firstname");
    if (firstname.length === 1) {
      setTimeout(() => {
        firstname[0].focus();
      }, 500);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (!landing) return;

    (async function () {
      let text = null;
      let d = null;
      let url = config.component.landing?.url;
      if (!url) alert("missing config.component.landing.url param");
      try {
        d = await fetch(url).catch(() => {
          console.log("can't fetch");
        });
      } catch {
        console.log("can't fetch");
      }
      if (!d) return;
      try {
        text = await d.text();
      } catch {
        console.log("can't fetch");
        return;
      }
      if (!isCancelled) {
        var parser = new DOMParser();

        const doc = parser.parseFromString(text, "text/html");

        body.current.appendChild(doc.querySelector("body"));
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [body, landing]);

  if (!landing) return null;

  return (
    <Dialog
      dialog={displayed}
      close={() => setDisplayed(false)}
      name={t("campaign:landing.title")}
      maxWidth="xl"
    >
      <div ref={body} onClick={handleClick}></div>
    </Dialog>
  );
};

export default ShareLanding;
