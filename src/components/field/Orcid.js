import React from "react";
import { Button, SvgIcon } from "@material-ui/core";
import OrcidIcon from "@images/OrcidLogo";
const Orcid = () => {

  const logIn = () => {
    alert ("NOT IMPLEMENTED YET");
  }

	return (
		<Button
			variant="contained"
			fullWidth
      style={{ backgroundColor: '#447405', color: '#fff' }}
      onClick= {logIn}
			startIcon={
				<SvgIcon>
					<OrcidIcon />
				</SvgIcon>
			}
		>
			Connect your ORCID ID
		</Button>
	);
};

export default Orcid;
