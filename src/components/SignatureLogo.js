import React, { useEffect, useState } from "react";
import { getLatest } from "../lib/server.js";
//import {GridList,GridListTile}from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "grid",
      gridGap: theme.spacing(1),
      gridTemplateColumns: "repeat(auto-fit, 73px)",
      "& > *": {
        margin: theme.spacing(1),
      },
    },
    large: {
      width: 73,
      height: 73,
    },
  })
);
const ListSignature = (props) => {
  const [list, setList] = useState([]);
  const classes = useStyles();

  const actionPage = 80;
  useEffect(() => {
    let isCancelled = false;
    let c = null;
    (async function () {
      c = await getLatest(actionPage, "openletter");
      if (!isCancelled) setList(c);
    })();
    return () => {
      isCancelled = true;
    };
  }, [actionPage]);

  const tweet = (screen_name) => {
    const url = "https://twitter.com/" + screen_name;
    window.open(
      url,
      "tweet-" + screen_name,
      "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=550"
    );
  };
  const visit = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  const GridList = (props) => {
    return <div className={classes.root}>{props.children}</div>;
  };

  const GridListTile = (props) => {
    return <div>{props.children}</div>;
  };
  return (
    <GridList cellHeight="73" cols="5">
      {list
        .filter((k) => k.organisation)
        .sort((a, b) => +a.followers_count < +b.followers_count)
        .map((k) => (
          <GridListTile
            alignItems="flex-start"
            divider={false}
            key={k.id}
            button={true}
            onClick={() => visit(k.url)}
          >
            <Avatar variant="rounded" className={classes.large}>
              <a
                href={
                  k.url ||
                  (k.twitter ? "https://twitter.com/" + k.twitter : "#")
                }
              >
                <img
                  src={k.picture?.replace("_normal", "_bigger")}
                  alt={k.organisation}
                  title={k.organisation + (k.comment ? "\n" + k.comment : "")}
                />
              </a>
            </Avatar>
          </GridListTile>
        ))}
    </GridList>
  );
};

export default ListSignature;
