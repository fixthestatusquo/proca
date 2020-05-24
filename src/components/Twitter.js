import React,{useState,useEffect,Fragment} from 'react';

import TwitterList from './TwitterList';
import Dialog from './Dialog';
import Register from './Register';

const Component = (props) => {
  const [profiles, setProfiles] = useState([]);
  const [dialog, viewDialog] = useState(false);
 
    useEffect(() => {
      const fetchData = async (url) => {
        await fetch(url)
          .then(res => {
            if (!res.ok)
              throw res.error();
            return res.json()})
        .then(d => {
          setProfiles(d);
        }).catch((error)=> {
          console.log(error);
        });
      };

      if (props.targets.twitter_url) 
        fetchData (props.targets.twitter_url);

    },[props.targets.twitter_url]);


  const handleDone = (d) => {
    console.log("closed");
    viewDialog(true);
  }
//    <TwitterText text={actionText} handleChange={handleChange} label="Your message to them"/>

  return (
    <Fragment>
    <Dialog dialog={dialog} actionPage={props.actionPage} content={Register} name="Let's keep in touch"/>
    <TwitterList profiles={profiles} actionPage={props.actionPage} actionUrl={props.actionUrl} actionText={props.actionText} done={handleDone}/>
    </Fragment>
  );

}

Component.defaultProps = {
  actionText: ".{@} you should check that!"
}
export default Component;
