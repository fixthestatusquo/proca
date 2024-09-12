import React, { useState } from "react";
import Comment from "@components/wall/Comment";
import Picture from "@components/wall/Picture";
import ProgressCounter from "@components/ProgressCounter";
import useData from "@hooks/useData";
import { Paper, AppBar, Tabs, Tab, Box } from "@material-ui/core";
import CommentIcon from "@material-ui/icons/Comment";
import ImageIcon from "@material-ui/icons/Image";
import { useCampaignConfig } from "@hooks/useConfig"

const Wall = () => {
  const [value, setValue] = useState("comment");
  const [data] = useData();
  const country = data.country && data.country.slice(0, 2).toUpperCase();
  console.log(country, data);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const journey = useCampaignConfig().journey || [];

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
            {journey.includes("wall_Picture") && <Tab value="picture" label="Pictures" icon={<ImageIcon />} />}
            {journey.includes("wall_Comment") && <Tab value="comment" label="Comments" icon={<CommentIcon />} />}
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
