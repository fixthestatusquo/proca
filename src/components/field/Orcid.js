import React from "react";
import { Button, SvgIcon } from "@material-ui/core";
import OrcidIcon from "@images/OrcidLogo";
const Orcid = () => {
	return (
		<Button
			variant="contained"
			fullWidth
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
