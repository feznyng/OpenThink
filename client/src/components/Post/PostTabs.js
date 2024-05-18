import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import PostCreator from './PostCreatorOld'
import PostSpace from './PostSpace'
import Discussion from './Discussion/Discussion';
import {getPostByID} from '../../actions/postActions'
import store from '../../Store'
import LinearProgress from '@material-ui/core/LinearProgress';
import {Card} from '@material-ui/core';
import {useDispatch} from 'react-redux';
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}


export default function PostTabs(props) {
  const { relations, onChangeListener, parent, parentType, post, tabIndex, openCreator, loading, visualization, onPostClicked, selecting} = props;
  const dispatch = useDispatch();
  const [value, setValue] = React.useState(0);
  const [passedPost, setPost] = React.useState(post);
  const [open, setOpen] = React.useState(false);
  const myRef = React.useRef();
  const executeScroll = () => {
    const yOffset = -70; 
    const element = myRef.current;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({top: y, behavior: 'smooth'});
  }

 

  React.useEffect(() => {
    setValue(0);
  }, []);

  React.useEffect(() => {
    setValue(tabIndex);
  }, [tabIndex]);

  React.useEffect(() => {
    setOpen(false);
  }, [openCreator])

  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const thisUser = store.getState().userActions.userInfo;
  const projectUser = thisUser ? parent.users.find(u => u.user_id === thisUser.user_id) : null



  const handleGraphInteraction = (e, t) => {
    if (e === 'create') {
      setOpen(true);
    }
  }

  const escFunction = React.useCallback((event) => {
    if(event.keyCode === 32 && event.ctrlKey) {
      setOpen(true);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [])
  return (
    <div>
        {loading && <LinearProgress style={{marginTop: '10px'}} variant={'indeterminate'} />}

      <TabPanel value={value} index={0}>
      {
          ((parent.type === 'Public') || (projectUser && (
          (parent.type === 'Private' && projectUser && projectUser.accepted && (projectUser.type !== 'Viewer' && projectUser.type !== 'Follower'))
          ||
          (parent.type === 'Public View' && projectUser)))) && 
          <Card ref={myRef} style={{marginTop: '10px', marginBottom: '10px'}}>
            <PostCreator 
              onClose={() => setOpen(false)}
              opened={open} 
              parent={parent} 
              location={'Post'} 
              relations={relations} 
              post={post} 
              inParent 
              updateParent={onChangeListener}
              onOpenEditor={executeScroll}
            />
         </Card>   
        }
        <PostSpace  
          onPostClicked={onChangeListener} 
          passedPosts={relations}
          parentType={parentType}
          parentPost={post}
          id={parent ? parent.project_id ? parent.project_id : parent.space_id : undefined} 
          parent={parent}
          inPost
          selecting={visualization || selecting}
          onGraphInteract={handleGraphInteraction}
          parentPost={post} 
          updateParent={onChangeListener}
          onPostClicked={onPostClicked}
        />
      </TabPanel>
    </div>
  );
}