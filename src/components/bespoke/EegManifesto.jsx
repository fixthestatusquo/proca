import React from "react";
import TextField from "@components/TextField";
import Twitter from "@components/field/Twitter";
import Checkbox from "@components/field/Checkbox";
import { FormLabel, Box, Grid } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import Orcid from "@components/field/Orcid";
import Affiliation from "@components/field/ResearchOrganisation";
import { Alert, AlertTitle } from '@material-ui/lab';

const EggManifesto = ({form}) => {
	const hasOrganisation = form.watch("has-organisation");
  const twitterUpdate = account => {
    if (account.name) {
      form.setValue("organisation", account.name);
    }
  }

    if (!hasOrganisation) {
      const names = [ "organisation", "twitter", "picture"];
      const values = form.getValues(names);
      names.forEach((name, i) => {
        if (values[i]) form.setValue(name, "");
      });
    }

	return (
    <Grid container alignItems="flex-start">
			<Grid item xs={12}>
         <Orcid form={form}/>
         <Affiliation form={form} />
      </Grid>
			<Grid item xs={12}>
				<Box
					border={hasOrganisation ? 1 : 0}
					borderRadius={4}
					paddingX={1}
					paddingBottom={hasOrganisation ? 1 : 0}
					marginTop={0}
					component="fieldset"
				>
					<FormLabel
						component="legend"
						style={{ paddingLeft: 8, width: "auto" }}
					>
						<Checkbox
							name="has-organisation"
							label="Signing as an institution"
							form={form}
						/>
					</FormLabel>
					<Collapse in={hasOrganisation}>
						{hasOrganisation && (
							<>
								<Twitter form={form} onBlur = {twitterUpdate}/>
								<TextField
									label="Organisation"
									form={form}
                  name="organisation"
                  onChange={form.setValue("organisation")}
								/>
							</>
						)}
					</Collapse>
				</Box>
          {hasOrganisation && (<Alert  severity="info" style={{marginTop:8}}><AlertTitle>Your details will not be displayed</AlertTitle>We need them to approve your institution's signature</Alert>)}
			</Grid>
		</Grid>
	);
};

export default EggManifesto;
