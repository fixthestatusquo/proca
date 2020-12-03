import React, { useState } from "react";
import Dialog from "../Dialog";
import { useTranslation } from "react-i18next";

const EciPopup = (props) => {
  const [popup, setPopup] = useState(false);
  const { t } = useTranslation();

  const openPopup = (event) => {
    event.preventDefault();
    //setPopup(event.target.href.split('#')[1]);
    switch (event.target.href.split("#")[1]) {
      case "privacy":
        setPopup(t("eci:privacy.info"));
        break;
      case "content":
        setPopup(
          <>
            <h3>{t("campaign:title")}</h3>
            <div>{t("campaign:description")}</div>
          </>
        );
        break;
      default:
        console.log("");
    }
  };

  const handleClose = () => {
    setPopup(false);
  };

  const content = t("eci:privacy.info");
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
      <Dialog
        dialog={popup !== false}
        close={handleClose}
        name={t("eci:common.head-title.home")}
      >
        {popup}
      </Dialog>
    </>
  );
};

export default EciPopup;
