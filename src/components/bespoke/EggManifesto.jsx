import React, { useEffect } from "react";
import TextField from "@components/TextField";
import Twitter from "@components/field/Twitter";
import Checkbox from "@components/field/Checkbox";
import { FormLabel, Box, Grid } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";

const EggManifesto = ({form}) => {
	const hasOrganisation = form.watch("has-organisation");
  const twitterUpdate = account => {
    console.log(account);
    if (account.name) {
      form.setValue("organisation", account.name);
    }
  }

  useEffect(() => {
    if (!hasOrganisation) {
      const names = ["comment", "email", "organisation", "twitter", "picture"];
      const values = form.getValues(names);
      names.forEach((name, i) => {
        if (values[i]) form.setValue(name, "");
      });
    }
  }, [hasOrganisation, form.getValues()])

	return (
    <Grid container alignItems="flex-start">
       {/* <Grid item xs={12}>
                <TextField
                  label="ORCHID ID"
                  form={form}
                  name="orchid-id"
        />
        </Grid> */}
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
			</Grid>
		</Grid>
	);
};

export default EggManifesto;
