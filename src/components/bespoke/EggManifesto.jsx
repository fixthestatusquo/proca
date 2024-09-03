import React from "react";
import TextField from "@components/TextField";
import Twitter from "@components/field/Twitter";
import Checkbox from "@components/field/Checkbox";
import {
	FormGroup,
	FormLabel,
	Box,
	Grid,
} from "@material-ui/core";

const EggManifesto = (props) => {
	const hasOrganisation = props.form.watch("has-organisation");

	return (
		<Grid container alignItems="flex-start">
			<Grid item xs={12}>
				<Box
					border={hasOrganisation ? 1 : 0}
					borderRadius={4}
					paddingX={1}
					paddingBottom={1}
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
							form={props.form}
						/>
					</FormLabel>
					<FormGroup>
						{hasOrganisation && (
							<>
								<Twitter form={props.form} />
								<TextField
									label="The name of the institution"
									form={props.form}
									name="Twitter-name"
								/>
							</>
						)}
					</FormGroup>
				</Box>
			</Grid>
		</Grid>
	);
};

export default EggManifesto;
