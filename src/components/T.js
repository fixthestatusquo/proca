import { useTranslation } from "react-i18next";

const T = props => {
  const { t } = useTranslation();
  return /* i18next-extract-disable-line */ t(props.message);
};

export default T;
