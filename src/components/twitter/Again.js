import { Button } from "@material-ui/core";
import ReloadIcon from '@material-ui/icons/Cached';
import NextIcon from "@material-ui/icons/SkipNext";
const Again = props => {
  return (
    <>
    <p>Thank you!</p>
    <p> What would you like to do?</p>
    <Button
                variant="contained"
                fullWidth
                endIcon={
                  <ReloadIcon />
                }
                onClick={props.again}
    >Tweet another target!
    </Button>
    <div>or</div>
    <Button
                variant="contained"
                fullWidth
                onClick={props.done}
                endIcon={
                  <NextIcon />
                }
    >Keep me informed of the progress
    </Button>
    </>
  );
  //success
  //would you like to write another tweet to a new target?
  //[yes]/[no]
  //register
  //
}

export default Again;
