import React from "react";
import {
  IconButton,
  Typography,
  Tooltip
} from "@material-ui/core";

import Select from './Select';
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

const Gender= ({data}) => {

  if (!(data.message_female || data.message_male)) return null;

return (<>
          <UnicodeButton icon="○" tooltip="no gender letter" />
        {data.message_female && <UnicodeButton icon="♀" gender="female" />}
        {data.message_male && <UnicodeButton icon="♂" gender="male" />}
</>);

return "aa";
}

export default Gender;
