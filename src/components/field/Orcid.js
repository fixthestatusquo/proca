import Hidden from "@components/field/Hidden";
import { useCampaignConfig } from "@hooks/useConfig";
import OrcidIcon from "@images/OrcidLogo";
import { decode } from "@lib/jwt";
import { Button, SvgIcon } from "@material-ui/core";
import React, { useEffect, useState } from "react";
const Orcid = ({ form }) => {
  const config = useCampaignConfig();
  const [user, setUser] = useState(undefined);
  const clientId = config.component?.orcid?.clientId;
  const urlHash = window.location.hash.substring(1); // Remove the leading #

  useEffect(async () => {

    const userInfo = async () => {
      const params = new URLSearchParams(urlHash);
      const accessToken = params.get("access_token");
      if (!accessToken) return undefined;
      const jwt = decode(params.get('id_token'));
      if (jwt.sub) {
        form.setValue("firstname", jwt.given_name);
        form.setValue("lastname", jwt.family_name);
        form.setValue("orcid", jwt.sub);
      }

      try {
//        const response = await fetch("https://orcid.org/oauth/userinfo", {
          const response = await fetch("https://xy.proca.app/orcid/"+jwt.sub, {
          method: "GET",
          headers: {
//            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        form.setValue("firstname", data.firstname);
        form.setValue("lastname", data.lastname);
        form.setValue("orcid", data.orcid);
        form.setValue("organisation", data.organisation);
        form.setValue("ror", data.ror);
        form.setValue("country", data.country);
        window.location.hash = '';
        return data;
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const user = await userInfo();
    if (user) setUser(user);
  }, [setUser, urlHash]);

  if (!clientId) return "missing config.component.orcid.clientId";

  const logIn = () => {
    const redirect = encodeURIComponent(window.location.href.split("#")[0]);
    window.location = `https://orcid.org/oauth/authorize?client_id=${clientId}&response_type=token&scope=openid&redirect_uri=${redirect}`;
  };

  return (
    <>
      <Hidden name="orcid" form={form} />
      <Button
        variant="contained"
        fullWidth
        style={{ backgroundColor: "#447405", color: "#fff" }}
        onClick={logIn}
        startIcon={
          <SvgIcon>
            <OrcidIcon />
          </SvgIcon>
        }
      >
        {user?.orcid ? user.orcid : "Connect your ORCID ID"}
      </Button>
    </>
  );
};

export default Orcid;
