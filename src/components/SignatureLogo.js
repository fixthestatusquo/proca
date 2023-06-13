import React, { useEffect, useState } from "react";
import { getLatest } from "@lib/server.js";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Avatar from "@mui/material/Avatar";

const useStyles = makeStyles((theme) =>
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
      backgroundColor: "transparent",
      width: 73,
      height: 73,
      "& img": {
        maxWidth: 73,
        maxHeight: 73,
      },
    },
  })
);

const ListSignature = () => {
  const [list, setList] = useState([]);
  const classes = useStyles();

  const actionPage = 80;
  useEffect(() => {
    let isCancelled = false;
    let c = null;
    (async function () {
      c = await getLatest(actionPage, "openletter", isCancelled);
      if (!isCancelled) {
        setList(c);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [actionPage]);

  const GridList = (props) => {
    return <div className={classes.root}>{props.children}</div>;
  };

  return (
    <GridList cellHeight="73" cols="5">
      {list
        .filter((k) => k.organisation)
        .sort((a, b) => +a.followers_count < +b.followers_count)
        .map((k) => {
          return (
            <Avatar key={k.twitter} variant="rounded" className={classes.large}>
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
          );
        })}
    </GridList>
  );
};

export default ListSignature;
