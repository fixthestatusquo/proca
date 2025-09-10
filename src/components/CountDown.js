import React,{ useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import simplyCountdown from 'simplycountdown.js';
import {useComponentConfig} from "@hooks/useConfig.js";

const useStyles = makeStyles((theme) => ({
  countdownContainer: {
    padding: theme.spacing(1),
    textAlign: 'center',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(1),
  },
  countdown: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'nowrap',
     overflowX: 'auto',
      gap: theme.spacing(1),
    '& .section': {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: theme.spacing(1),
      padding: theme.spacing(1),
      minWidth: '90px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      }
    },
    '& .amount': {
      display: 'block',
      fontSize: '2.5rem',
      fontWeight: 700,
      color: 'white',
      lineHeight: 1,
      marginBottom: theme.spacing(0.5),
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    '& .word': {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    // Responsive design
    [theme.breakpoints.down('sm')]: {
      '& .section': {
        minWidth: '70px',
        padding: theme.spacing(1.5),
      },
      '& .amount': {
        fontSize: '2rem',
      },
      '& .word': {
        fontSize: '0.75rem',
      },
    },
    [theme.breakpoints.down('xs')]: {
      '& .countdown': {
        gap: theme.spacing(1),
      },
      '& .section': {
        minWidth: '60px',
        padding: theme.spacing(1),
      },
      '& .amount': {
        fontSize: '1.5rem',
      },
    }
  }
}));
const  Countdown = () => {
  const countdownRef = useRef(null);
  const classes = useStyles();
  const component = useComponentConfig();
  const date = new Date(component.countdown.date);


  useEffect(() => {
    const countdown = simplyCountdown(countdownRef.current, {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
countUp: true,
      plural: true,
      inline: false,
        words: { // Custom labels, with lambda for plurals
            days: { root: 'day', lambda: (root, n) => n > 1 ? root + 's' : root },
            hours: { root: 'hour', lambda: (root, n) => n > 1 ? root + 's' : root },
            minutes: { root: 'minute', lambda: (root, n) => n > 1 ? root + 's' : root },
            seconds: { root: 'second', lambda: (root, n) => n > 1 ? root + 's' : root }
        },
      inlineClass: 'countdown-inline',
      enableUtc: false,
      sectionClass: 'section',
      amountClass: 'amount',
      wordClass: 'word',
      zeroPad: false
    });

    // Cleanup
    return () => {
      if (countdown) {
        if (countdownRef.current) {
          countdownRef.current.innerHTML = '';
        }
      }
    };
  }, []);

  return (
    <div className={classes.countdownContainer}>
     <div className={classes.countdownWrapper}>
        <div ref={countdownRef} className={classes.countdown} />
      </div>
    </div>
  );
}

export default Countdown;
