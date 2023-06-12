import React, { useState } from "react";
import Comment from "@components/CommentWall";
import Picture from "@components/PictureWall";
import ProgressCounter from "@components/ProgressCounter";
import useData from "@hooks/useData";
import { Paper, AppBar, Tabs, Tab, Box } from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import ImageIcon from "@mui/icons-material/Image";

const Wall = () => {
  const [value, setValue] = useState("comment");
  const [data] = useData();
  const country = data.country && data.country.slice(0, 2).toUpperCase();
  console.log(country, data);
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
          {value === "picture" && <Picture country={country} />}
          {value === "comment" && <Comment country={country} />}
        </Box>
      </Paper>
    </>
  );
};

export default Wall;
