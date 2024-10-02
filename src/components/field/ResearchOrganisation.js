import React, { useState, useCallback } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { debounce, makeStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@components/TextField";

const useStyles = makeStyles((theme) => ({
 root: {
    '& .proca-MuiInputBase-root': {
      paddingTop: "0!important",
    },
  },
}));

const AffiliationInput = ({ form }) => {
  const classes = useStyles();
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async (query) => {
    if (query.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.ror.org/organizations?query=${encodeURIComponent(query)}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const organizations = data.items.map((item) => ({
          name: item.name,
          id: item.id,
          country: item.country?.country_code,
        }));

        setOptions(organizations);
      } catch (error) {
        console.error("Error fetching data from ROR API:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setOptions([]);
    }
  };

  // Debounce the fetch function
  const debouncedFetchOptions = useCallback(debounce(fetchOptions, 300), []);

  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);
    if (reason === "input") debouncedFetchOptions(newInputValue);
    if (reason === "reset") {
      const institution = options.find (d => d.name === newInputValue);
      console.log(newInputValue,institution);
    }
  };

  return (
    <Autocomplete
      id="affiliation-input"
      open={open}
      loading={loading}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      options={options}
      getOptionLabel={(option) => option.name}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      openOnFocus = {true}
      classes={{root:classes.root}}
      noOptionsText={inputValue.length > 2 ? "No organisation found" : "Type to search your organisation"}
      loadingText={"Searching " + inputValue + "..."}
      autoSelect
      autoHighlight
      renderInput={(params) => (
        <TextField
          name="affiliation"
          required
          form={form}
          {...params}
          label="Affiliation"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default AffiliationInput;
