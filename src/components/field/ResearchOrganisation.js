import React, { useState, useEffect, useCallback } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { debounce, makeStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@components/TextField";
import CountryFlag from "react-emoji-flag";
import Hidden from "@components/field/Hidden";

const useStyles = makeStyles(() => ({
  root: {
    "& .proca-MuiInputBase-root": {
      paddingTop: "0!important",
    },
  },
}));

const AffiliationInput = ({ form }) => {
  const classes = useStyles();
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState(form.getValues("organisation") || '');
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);

  useEffect ( () => {
     if (!form.getValues("organisation")) return;
     setInputValue ( form.getValues("organisation"));
     
  },[form.getValues("organisation")]);

  const fetchOptions = async query => {
    if (query.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.ror.org/organizations?query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const organizations = data.items.map(item => ({
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

  const handleInputChange = (_event, newInputValue, reason) => {
    setInputValue(newInputValue);
    if (reason === "input") debouncedFetchOptions(newInputValue);
    if (reason === "clear") {
      form.setValue("ror", undefined);
      form.setValue("organisation", undefined);
    }
    if (reason === "reset") {
      const institution = options.find(d => d.name === newInputValue);
      if (!institution) {
        console.error("didn't find organisation", newInputValue);
        return;
      }
      form.setValue("ror", institution.id);
      form.setValue("country", institution.country);
      form.setValue("organisation", institution.name);
    }
  };

  return (
    <>
      <Hidden name="ror" form={form} />
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
        getOptionLabel={option => option.name}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        openOnFocus={true}
        classes={{ root: classes.root }}
        noOptionsText={
          inputValue.length > 2
            ? "No organisation found"
            : "Type to search your organisation"
        }
        loadingText={"Searching " + inputValue + "..."}
        autoSelect
        autoHighlight
        renderOption={option => (
          <>
            <CountryFlag countryCode={option.country} /> &nbsp; {option.name}
          </>
        )}
        renderInput={params => (
          <TextField
            name="organisation"
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
    </>
  );
};

export default AffiliationInput;
