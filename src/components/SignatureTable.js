import React, { useEffect, useState } from "react";
import { getLatest } from "@lib/server.js";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Avatar from "@mui/material/Avatar";

const useStyles = makeStyles((theme) =>
  createStyles({
    table: {
      borderCollapse: "separate",
      borderSpacing: "15px 5px",
      "& h3": { fontSize: "1.2em", margin: "0 0 5px 0" },
    },
    root: {
      display: "grid",
      gridGap: theme.spacing(1),
      gridTemplateColumns: "repeat(auto-fit, 73px)",
      "& > *": {
        margin: theme.spacing(1),
      },
    },
    trlogo: { width: 80 },
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
      c = await getLatest(actionPage, "openletter");
      if (!isCancelled) setList(c);
    })();
    return () => {
      isCancelled = true;
    };
  }, [actionPage]);

  return (
    <>
      <table className={classes.table} id="datatable">
        <tbody>
          {list
            .filter((d) => d.organisation)
            .sort((a, b) =>
              a.organisation.toLowerCase() > b.organisation.toLowerCase()
                ? 1
                : -1
            )
            .map((k) => (
              <tr key={k.twitter}>
                <td className={classes.trlogo}>
                  <Avatar variant="rounded" className={classes.large}>
                    <img
                      src={k.picture?.replace("_normal", "_bigger")}
                      alt={k.organisation}
                      title={
                        k.organisation + (k.comment ? "\n" + k.comment : "")
                      }
                    />
                  </Avatar>
                </td>
                <td>
                  <h3>
                    <a
                      href={
                        k.url ||
                        (k.twitter ? "https://twitter.com/" + k.twitter : "#")
                      }
                    >
                      {k.organisation}
                    </a>
                  </h3>
                  {k.comment}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

export default ListSignature;
