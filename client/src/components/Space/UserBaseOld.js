import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import Button from '@material-ui/core/Button';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import UserCard from '../User/UserCard';
import store from '../../Store';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function UserBase(props) {
  const {parent, managing, userTypes, onChange, displayStatus} = props;
  const isCreator = Boolean(store.getState().userActions.userInfo && parent.users.find(u => (u.user_id === store.getState().userActions.userInfo.user_id && u.type === 'Creator')));
  const [state, setState] = React.useState({
    leadNum: 5,
    contibNum: 5,
    viewerNum: 5,
    followNum: 5,
    leads: [],
    contributors: [],
    followers: [],
  });
  const classes = useStyles();
  React.useEffect(() => {
    setState({
      leadNum: 5,
      contibNum: 5,
      viewerNum: 5,
      followNum: 5,
      leads: parent.users.filter(e => (e.type === 'Lead' || e.type === 'Creator' || e.type === 'Moderator') && e.accepted),
      contributors: parent.users.filter(e => (e.type === 'Contributor' || e.type === 'Member') && e.accepted),
      followers: parent.users.filter(e => e.type === 'Follower' && e.accepted),
    });
  }, [parent.users]);


  return (
    <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 15, paddingBottom: 20}}>
      <div style={{width: (props.width === 'xs' || props.width === 'sm') ? '' : 800}}>
        <Accordion defaultExpanded>
          <AccordionSummary
          >
            <Typography className={classes.heading}>Moderators</Typography>
          </AccordionSummary>
          <AccordionDetails >
            <div style={{width: '100%'}}>
              {
                  [...state.leads].splice(0, state.leadNum).map((u, i) => 
                    <div style={{marginBottom: 5}}>
                        <UserCard displayStatus={displayStatus} key={i} user={u} onChange={onChange} managing={managing && isCreator} userTypes={userTypes} parent={parent} />
                    </div>
                  )
              }
              {
                state.leadNum < state.leads.length &&
                <Button style={{borderRadius: '25px', marginTop: '10px'}} onClick={() => setState({...state, leadNum: state.leadNum + 5})}>
                  See More <ExpandMoreIcon/>
                </Button>
              }
              
            </div>
              
          </AccordionDetails>
        </Accordion>

        {
          state.contributors.length > 0 &&
          <Accordion defaultExpanded>
          <AccordionSummary
              
              aria-controls="panel3a-content"
              id="panel3a-header"
          >
              <Typography className={classes.heading}>Members</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <div style={{width: '100%'}}>

              {
                  [...state.contributors].splice(0, state.contibNum).map(u => 
                    <div style={{marginBottom: 5}}>
                      <UserCard displayStatus={displayStatus} key={u.user_id} user={u} onChange={onChange} managing={managing} userTypes={userTypes} parent={parent} style={{width: '100%'}}/>
                    </div>
                  )
              }
              {
                state.contibNum < state.contributors.length &&
                <Button style={{borderRadius: '25px', marginTop: '10px'}} onClick={() => setState({...state, contibNum: state.contibNum + 5})}>
                  See More <ExpandMoreIcon/>
                </Button>
              }
                        </div>

          </AccordionDetails>
          </Accordion>
        }
        
        {
            state.followers.length > 0 &&
            <Accordion defaultExpanded>
              <AccordionSummary
              
              aria-controls="panel3a-content"
              id="panel3a-header"
              >
              <Typography className={classes.heading}>Followers</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <div style={{width: '100%'}}>

              {
                  [...state.followers].splice(0, state.followNum).map(u => 
                    <div style={{marginBottom: 5}}>
                      <UserCard displayStatus={displayStatus} key={u.user_id} user={u} onChange={onChange} managing={managing} parent={parent} userTypes={userTypes} style={{width: '100%'}}/>
                    </div>
                  )
              }
              {
                state.followNum < state.followers.length &&
                <Button style={{borderRadius: '25px', marginTop: '10px'}} onClick={() => setState({...state, followNum: state.followNum + 5})}>
                  See More <ExpandMoreIcon/>
                </Button> 
              }
                        </div>

          </AccordionDetails>
          </Accordion>
        }
        
      </div>
    </div>
  );
}