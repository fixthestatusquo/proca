import React from "react";
import { ListItemSecondaryAction, Checkbox } from "@material-ui/core";

export const toggleSelection = (key, setSelection) => {
  setSelection((prev) => {
    const selection = [...prev];
    const index = selection.indexOf(key);
    //      select(index === -1);
    if (index > -1) {
      selection.splice(index, 1);
    } else {
      selection.push(key);
    }
    return selection;
  });
};
const Selectable = (props) => {
  const key = props.profile.procaid;
  const selected = props.selection && props.selection.indexOf(key) !== -1;
  //const [selected, select] = useState (props.selection && props.selection.indexOf(key) !== -1);
  if (!props.selection) return null;
  return (
    <ListItemSecondaryAction>
      <Checkbox
        edge="end"
        onChange={() => (event) => {
          event.stopPropagation();
          toggleSelection(key, props.setSelection);
        }}
        checked={selected}
      />
    </ListItemSecondaryAction>
  );
};

export default Selectable;
