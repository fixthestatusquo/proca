import { useEffect } from "react";
import Message from "@components/field/AITextField";
import MultiSelectCheckbox from "@components/field/MultiSelect";
import TextField from "@components/field/TextField";
import { useComponentConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const CustomMessage = ({ form, getTargets }) => {
  const { t } = useTranslation();
  const component = useComponentConfig();
  const targets = getTargets();
  const addFooter = text => {
    //it's called from the registration
    const footer = t("campaign:footer");
    return `${text}\n${footer}`;
  };

  // Highlighted-Line: Secretly inject your beforeSubmit function into RHF's field registry
  useEffect(() => {
    if (form.control?._fields?.message) {
      form.control._fields.message.beforeSubmit = currentValue =>
        addFooter(currentValue);
    }
  }, [form.control]);

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
