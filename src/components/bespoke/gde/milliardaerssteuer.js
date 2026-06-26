import Message from "@components/field/AITextField";
import MultiSelectCheckbox from "@components/field/MultiSelect";
import TextField from "@components/field/TextField";
import { useComponentConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const CustomMessage = ({ form, getTargets }) => {
  const { t } = useTranslation();
  const component = useComponentConfig();
  const targets = getTargets();
  return (
    <>
      <MultiSelectCheckbox
        name="topics"
        label={t("campaign:topics")}
        form={form}
        maxChoices={3}
        options={component.topics}
      />
      <TextField
        form={form}
        name="subject"
        required={true}
        label={t("Subject")}
      />
      <Message
        form={form}
        required={true}
        name="message"
        fields={["topics", "firstname"]}
        recipient={targets?.[0]?.salutation}
        label={t("Your message")}
      />
    </>
  );
};

export default CustomMessage;
