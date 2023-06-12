import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-component";
import { useSupabase } from "@lib/supabase";
import ProgressCounter from "@components/ProgressCounter";
import { TextField, MenuItem } from "@mui/material";

export const localeName = {
  cs: "čeština",
  sv: "svenska",
  lv: "latviešu",
  hr: "hrvatski",
  es: "español",
  en_GB: "British English",
  it: "italiano",
  ar: "العربية",
  hu: "magyar",
  el: "Ελληνικά",
  fr_CA: "français canadien",
  ga: "Gaeilge",
  sl: "slovenščina",
  fi: "suomi",
  da: "dansk",
  sk: "slovenčina",
  mt: "Malti",
  ca: "català",
  fr: "français",
  lt: "lietuvių",
  de: "Deutsch",
  ru: "русский",
  bg: "български",
  en: "English",
  et: "eesti",
  ro: "română",
  pl: "polski",
  hi: "हिन्दी",
  pt: "português",
  he: "עברית",
  sr: "српски",
  ce: "нохчийн",
  nl: "Nederlands",
};

const WallOfMeme = () => {
  const supabase = useSupabase();
  const [memes, setMemes] = useState([]);
  const [language, setLanguage] = useState("?");
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    (async () => {
      let { data, error } = await supabase
        .from("meme_languages")
        .select("lang,total")
        .order("total", { ascending: false });
      if (error) {
        console.error(error);
        return;
      }
      setLanguages(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      let query = supabase
        .from("meme")
        .select("hash,image,top_text,bottom_text,lang")
        .order("id", { ascending: false })
        .eq("enabled", true);

      if (language && language !== "?") {
        query = query.eq("lang", language);
      }
      let { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }
      setMemes(data);
    })();
  }, [language]);

  const LanguageSelect = () => (
    <TextField
      id="language"
      select
      variant="filled"
      label="Language"
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
    >
      <MenuItem key="?" value="?">
        Choose your language
      </MenuItem>
      {languages.map((option) => (
        <MenuItem key={option.lang} value={option.lang}>
          {localeName[option.lang]}
        </MenuItem>
      ))}
    </TextField>
  );
  return (
    <>
      <ProgressCounter />
      <LanguageSelect options={languages} />
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
