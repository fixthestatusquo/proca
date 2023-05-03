import { useState } from "react";
import Comment from "@components/CommentWall";
import Picture from "@components/PictureWall";
import ProgressCounter from "@components/ProgressCounter";
import { Paper, AppBar, Tabs, Tab, Box } from "@material-ui/core";
import CommentIcon from "@material-ui/icons/Comment";
import ImageIcon from "@material-ui/icons/Image";

const Wall = (props) => {
  const [value, setValue] = useState("comment");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <ProgressCounter />

      <Paper square>
        <AppBar position="static" color="default">
          <Tabs
            variant="fullWidth"
            value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleChange}
          >
            <Tab value="picture" label="Pictures" icon={<ImageIcon />} />
            <Tab value="comment" label="Comments" icon={<CommentIcon />} />
          </Tabs>
        </AppBar>
        <Box p={1}>
          {value === "picture" && <Picture />}
          {value === "comment" && <Comment />}
        </Box>
      </Paper>
    </>
  );
};

export default Wall;
