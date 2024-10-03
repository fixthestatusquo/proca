import Hidden from "@components/field/Hidden";
import { useCampaignConfig } from "@hooks/useConfig";
import OrcidIcon from "@images/OrcidLogo";
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
      try {
        const response = await fetch("https://orcid.org/oauth/userinfo", {
          //    const response = await fetch("https://pub.orcid.org/v3.0/0009-0004-9319-0313/record", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 403) {
          // expired token
          logIn();
        }
        console.log(accessToken);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        form.setValue("firstname", data.given_name);
        form.setValue("lastname", data.family_name);
        form.setValue("orcid", data.sub);
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

  user && console.log(user);

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
        {user?.sub ? user.sub : "Connect your ORCID ID"}
      </Button>
    </>
  );
};

export default Orcid;
