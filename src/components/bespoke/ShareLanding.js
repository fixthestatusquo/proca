import React, { useState, useEffect, useRef } from "react";
import Dialog from "@components/Dialog";
import Url from "@lib/urlparser";

const ShareLanding = () => {
  const [displayed, setDisplayed] = useState(true);
  const body = useRef(null);
  const utm = Url.utm();
  console.log(utm);
  const landing = utm.source === "share";

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
      let url = "https://static.proca.app/gmo/sib.html";
      try {
        d = await fetch(url).catch((e) => {
          console.log("can't fetch");
        });
      } catch (e) {
        console.log("can't fetch");
      }
      if (!d) return;
      try {
        text = await d.text();
      } catch (e) {
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
      name="the message we sent to your friend..."
      maxWidth="xl"
    >
      <div ref={body} onClick={handleClick}></div>
    </Dialog>
  );
};

export default ShareLanding;
