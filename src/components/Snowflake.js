
import { useEffect } from "react";
import useData from "@hooks/useData";
import _ from "lodash";
import { useTranslation } from "react-i18next";

// to do or test
// when locale missing, fallback to default
// when text missing...
// if subject missing...
// if body missing...
// what's happening when chaging text

const Snowflake = (props) => {
  const { t } = useTranslation();
  const [, setData] = useData();

  useEffect(() => {
    const randomize = () => {
      const subjects = t("campaign:letter:subject") || "";
      let subject = _.sample(subjects.split("- ").filter(m => m.length > 0));
      let letter = [];
      let i = 1;
      while (t(`campaign:letter:part-${i}`, "end") !== "end") {
        let message = t(`campaign:letter:part-${i}`);
        letter.push(_.sample(message.split("- ").filter(m => m.length > 0)));
        i += 1;
      }
      return { subject: subject, message: letter.join('\n\n') };
    };

    const { subject, message } = randomize();
    setData("message", message);
    setData("subject", subject);
  }, [setData, t]);
  return null;
}

export default Snowflake;