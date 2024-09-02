import React, { useEffect } from "react";
import TextField from "@components/TextField";
import Country from "@components/field/Country";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import { Button, SvgIcon } from "@material-ui/core";
import useData from "@hooks/useData";
import { addActionContact } from "@lib/server";
import { slugify } from "@lib/text";
import ProcaIcon from "@images/Proca";
import uuid from "@lib/uuid";

const GeneratePaper = (props) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const [data, setData] = useData();

  const onSubmit = async (data) => {
    data.privacy = "opt-in";
    if (data.other) {
      data.partner = slugify(data.other.toLowerCase(), "-");
    }
    data.email = `${data.partner}@paper.eci.invalid`;
    data.firstname = data.partner;
    data.lastname = data.country;
    const result = await addActionContact(
      "generatePDF",
      config.actionPage,
      data,
      config.test
    );

    if (result.errors) {
      let handled = false;
      if (result.errors.fields) {
        result.errors.fields.forEach((field) => {
          if (field.name in data) {
            setError(field.name, { type: "server", message: field.message });
            handled = true;
          } else if (field.name.toLowerCase() in data) {
            setError(field.name.toLowerCase(), {
              type: "server",
              message: field.message,
            });
            handled = true;
          }
        });
        if (!handled) {
          console.error(result.errors);
        }
      }
      return;
    }
    setData(data);
    uuid(result.contactRef); // set the global uuid as signature's fingerprint
    props.done &&
      props.done({
        errors: result.errors,
        uuid: uuid(),
        firstname: data.firstname,
        country: data.country,
        privacy: data.privacy,
      });
  };

  const form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: Object.assign({}, data),
  });

  const { watch, formState, handleSubmit, setError } = form;
  const partner = watch("partner");
  const country = watch("country");

  const extraLang = {
    BE: ["FR", "NL"],
    LU: ["FR", "DE"],
  };

  const lang = extraLang[country];

  useEffect(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    // todo: workaround until the feature is native react-form ?
    inputs.forEach((input) => {
      input.oninvalid = (e) => {
        setError(e.target.attributes.name.nodeValue, {
          type: e.type,
          message: e.target.validationMessage,
        });
      };
    });
  }, [setError]);

  return (
    <form
      id="proca-register"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
    >
      <TextField
        select
        name="partner"
        label="Partner"
        form={form}
        required
        SelectProps={{
          native: true,
        }}
      >
        <option key="" value="" />
        {Object.entries(config.component.paper.partners).map(([key, value]) => (
          <option key={key} value={key}>
            {value}
          </option>
        ))}
        <option key="N/A" value="N/A">
          None of the above
        </option>
      </TextField>
      {partner === "N/A" && (
        <TextField form={form} name="other" label="Group/Organisation name" />
      )}
      <Country form={form} required />
      {lang && (
        <TextField
          select
          name="extra_language"
          label="Language"
          form={form}
          required
          SelectProps={{
            native: true,
          }}
        >
          <option key="" value="" />
          {lang.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </TextField>
      )}

      <Button
        color="primary"
        variant="contained"
        type="submit"
        fullWidth
        size="large"
        disabled={formState.isSubmitting}
        endIcon={
          <SvgIcon>
            <ProcaIcon />
          </SvgIcon>
        }
      >
        {" "}
        {
          /* i18next-extract-disable-next-line */ props.buttonText ||
            t(config.component.register?.button || "register")
        }
      </Button>
    </form>
  );
};
export default GeneratePaper;
