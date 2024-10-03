import { useEffect } from "react";
import useData from "@hooks/useData";
import { sample } from "@lib/array";
import { useTranslation } from "react-i18next";

const Snowflake = () => {
  // if translation is missing, nothing will be loaded
  const { t } = useTranslation();
  const [, setData] = useData();

  useEffect(() => {
    const randomize = () => {
      const subjects = t("letter:subject", "");
      const subject = sample(subjects.split("- ").filter(m => m.length > 0));
      const letter = [];
      let i = 1;
      while (t(`letter:part-${i}`, "%%end%%") !== "%%end%%") {
        const message = t(`letter:part-${i}`);
        letter.push(sample(message.split("- ").filter(m => m.length > 0)));
        i += 1;
      }
      return {
        subject: subject,
        message: letter.join("\n\n").replace("\n\n", ""),
      };
    };
    const { subject, message } = randomize();
    setData("message", message);
    setData("subject", subject);
  }, [setData, t]);
  return null;
};

export default Snowflake;
