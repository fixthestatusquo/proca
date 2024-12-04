import React from "react";
import { Grid } from "@material-ui/core";

import {
  IconButton,
  Typography,
  Tooltip
} from "@material-ui/core";

import Select from './Select';

const Gender = ({form, compact, classField}) => {
  const genders = {"male": "♂","female":"♀"};
  const width = () => !compact ? 2 : 12;

  return (<Grid item xs={width()} sm={width()} className={classField}>
  <Select name="gender" label="⚧" select="key" form={form} options={genders} />
  </Grid>);
}

//TO REMOVE
const _Gender= ({data, setValue}) => {

  const UnicodeButton = ({ icon, tooltip = "", gender = "" }) => (
    <Tooltip title={tooltip}>
      <IconButton
        size="small"
        onClick={() => setValue("message", gender ? data[`message_${gender}`] : data.message)}
      >
        <Typography variant="h4"> {icon}</Typography>
      </IconButton>
    </Tooltip>
  );

  if (!(data.message_female || data.message_male)) return null;

return (<>
          <UnicodeButton icon="○" tooltip="no gender letter" />
        {data.message_female && <UnicodeButton icon="♀" gender="female" />}
        {data.message_male && <UnicodeButton icon="♂" gender="male" />}
</>);

return "aa";
}

export default Gender;
