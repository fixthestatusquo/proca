import { useTranslation } from "react-i18next";

const T = (props) => {
  const {t} = useTranslation();
  return t(props.message);
}

export default T;
