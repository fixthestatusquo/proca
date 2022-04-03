import React, { useEffect } from "react";
import TextField from "@components/TextField";
import Country from "@components/Country";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import { Button,SvgIcon } from "@material-ui/core";
import useData from "@hooks/useData";
import { addActionContact } from "@lib/server.js";
import { ReactComponent as ProcaIcon } from "../../images/Proca.svg";
import uuid from "@lib/uuid.js";


const GeneratePaper = (props) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const [data, setData] = useData();

  const onSubmit = async (data) => {
    data.privacy = "opt-in";
    data.email = data.country + "@paper.eci";
    data.firstname = data.partner;
    const result = await addActionContact("generatePDF",
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
        privacy: data.privacy
      });
  }


  const form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: Object.assign({},data)
  });

  const { formState, handleSubmit, setError } = form;
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
                  form={form}
                  name="partner"
                 required
                  label="Partner Widget Name"
                />
                <Country form={form} required />
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
                {props.buttonText ||
                  t(config.component.register?.button || "register")}
              </Button>
    </form>
  );
};
export default GeneratePaper
