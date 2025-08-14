import React, { useState } from 'react';
import { 
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip
} from '@material-ui/core';
import { FileCopy as CopyIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useLayout } from "@hooks/useLayout";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  copyButton: {
    transition: 'color 0.3s',
    '&.copied': {
      color: theme.palette.success.main,
    },
  },
}));

const ShareLink = ({url, onCopy}) => {
  const classes = useStyles();
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  const layout = useLayout();
  const currentUrl = url || window.location?.href;

  const handleCopy = () => {
    
    // Modern clipboard API with fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).catch(() => {
        useFallbackCopy();
      });
    } else {
      useFallbackCopy();
    }
    
    setCopied(true);
    onCopy && onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const useFallbackCopy = () => {
    const tempInput = document.createElement('input');
    tempInput.value = currentUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  };

  return (
              <Tooltip title={copied ? t("Copied!") : t("Copy to clipboard")}>
      <TextField
        label={t("Shareable link")}
                  className={`${classes.copyButton} ${copied ? 'copied' : ''}`}
        fullWidth
        value={currentUrl}
            variant={layout.variant}
            margin={layout.margin}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
                <IconButton 
                  onClick={handleCopy} 
                  edge="end"
                  className={`${classes.copyButton} ${copied ? 'copied' : ''}`}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
            </InputAdornment>
          ),
        }}
      />
              </Tooltip>
  );
};

export default ShareLink;
