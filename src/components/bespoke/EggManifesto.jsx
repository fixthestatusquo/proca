import React from "react";
import TextField from "@components/TextField";
import Twitter from "@components/field/Twitter";
import Checkbox from "@components/field/Checkbox";
import { FormGroup, FormLabel, Box, Grid } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import Orchid from "@components/field/Orcid";

const EggManifesto = ({form}) => {
	const hasOrganisation = form.watch("has-organisation");
  
  const twitterUpdate = account => {
    console.log(account);
    if (account.name) {
      form.setValue("organisation", account.name);
    }
  }

  if (!hasOrganisation) {
    const names = ["organisation","twitter","picture"];
    const values = form.getValues(names);
    names.forEach ((name,i) => {
      if (values[i]) form.setValue(name,"");
    });
    
  }

	return (
		<Grid container alignItems="flex-start">
			<Grid item xs={12}>
         <Orchid />
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
								/>
							</>
						)}
					</Collapse>
				</Box>
			</Grid>
		</Grid>
	);
};

export default EggManifesto;
