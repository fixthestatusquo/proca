import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-component";
import { useSupabase } from "@lib/supabase";
import ProgressCounter from "@components/ProgressCounter";

const WallOfMeme = (props) => {
  const supabase = useSupabase();
  const [memes, setMemes] = useState([]);
  useEffect(() => {
    (async () => {
      let { data, error } = await supabase
        .from("meme")
        .select("hash,image,top_text,bottom_text,lang")
        .order("id", { ascending: false })
        .eq("enabled", true);

      if (error) {
        console.error(error);
        return;
      }
      setMemes(data);
    })();
  }, []);

  return (
    <>
      <ProgressCounter />
      <Masonry>
        {memes.map((d) => (
          <>
            <img
              key={d.hash}
              src={
                "https://vurrrokassxubbxlvufw.supabase.co/storage/v1/object/public/together4forests/meme/" +
                d.hash +
                ".jpeg"
              }
              alt={d.top + " " + d.bottom}
            />
          </>
        ))}
      </Masonry>
    </>
  );
};

export default WallOfMeme;
