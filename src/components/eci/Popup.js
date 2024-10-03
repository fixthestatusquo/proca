import React, { useState } from "react";
import Dialog from "@components/Dialog";
import TTag from "@components/TTag";
import { useTranslation } from "react-i18next";

const EciPopup = () => {
  const { t } = useTranslation();
  const [popup, setPopup] = useState(false);
  const [title, setTitle] = useState(t("campaign:title"));

  const openPopup = event => {
    if (!event.target.href) return;
    event.preventDefault();
    switch (event.target.href.split("#")[1]) {
      case "privacy":
        setPopup(<TTag message="eci:privacy.info" />);
        setTitle(t("eci:privacy.title"));
        break;
      case "content":
        setTitle(t("campaign:title"));
        setPopup(
          <>
            <h3>{t("eci:common.head-title.home")}</h3>
            <TTag message="campaign:description" />
          </>
        );
        break;
      default:
        console.log(event.target.href);
    }
  };

  const handleClose = () => {
    setPopup(false);
  };

  return (
    <>
      <span
        onClick={openPopup}
        dangerouslySetInnerHTML={{
          __html: t("eci:form.privacy-statement", {
            url: "#privacy",
            urlRegister: "#content",
          }),
        }}
      />
      <Dialog dialog={popup !== false} close={handleClose} name={title}>
        {popup}
      </Dialog>
    </>
  );
};

export default EciPopup;
