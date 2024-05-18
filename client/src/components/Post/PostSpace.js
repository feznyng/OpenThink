import { Button, IconButton, Divider, Dialog, DialogTitle, DialogContent, Card, CardHeader, CardContent, Paper, Menu } from '@material-ui/core';
import Sort  from '@material-ui/icons/Sort';
import React, {useEffect} from 'react'
import PostCard from './PostCardOld';
import FilterListIcon from '@material-ui/icons/FilterList';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import FormControl from '@material-ui/core/FormControl';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ListIcon from '@material-ui/icons/List';
import InfiniteScroll from 'react-infinite-scroll-component';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography'
import {withWidth} from '@material-ui/core';
import {Close, Fullscreen, FullscreenExit} from '@material-ui/icons';
import store from '../../Store';
import { FullScreen, useFullScreenHandle } from "react-full-screen";


const types = [
  'Information',
  'Idea',
  'Action Item',
  'Topic',
  'Question',
  'Event',
  'Concern',
  'Poll',
  'Media',
  'Link'
];

const sorts = [
  'New',
  'Subposts',
  'Comments',
  'Votes',
]

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  },
  getContentAnchorEl: null
};


function PostSpace(props) {
    const {parent, passedPosts, updateParent, disableVisual, relations, inPost, parentType, selecting, onPostClicked, onGraphInteract, readonly, parentPost} = props;
    let parentPosts = [];
    parentPosts = JSON.parse(JSON.stringify(passedPosts));
    const [posts, setPosts] = React.useState([]);
    const [order, setOrder] = React.useState(true);
    const [openFilters, setOpenFilters] = React.useState(false);
    const [openSorts, setOpenSorts] = React.useState(false);
    const [sort, setSort] = React.useState(sorts[0]);
    const [filters, setFilters] = React.useState(types);
    const [loading, setLoading] = React.useState(false);
    const [allPosts, setallPosts] = React.useState(inPost);
    const [state, setState] = React.useState({
      anchorEl: null
    })

    const handle = useFullScreenHandle();
    const [num, setNum] = React.useState(20);
    const [visualState, setVisualState] = React.useState({
      visual: false,
      fullscreen: false,
    });

    useEffect(() => {
      if (parentPosts.length === passedPosts.length) {
        setLoading(true);
        setPosts(
          inPost ? 
          parentPosts.sort((p1, p2) => new Date(p2.created_at) - new Date(p1.created_at))
          :
          parentPosts.sort((p1, p2) => new Date(p2.created_at) - new Date(p1.created_at)).filter(e => (!e.parentcount || e.parentcount === 0))
        );
        setNum(10);
      }
      setallPosts(inPost);
      
    }, [passedPosts, parent]);

    useEffect(() => {
      setLoading(false);
    }, [posts]);


    useEffect(() => { // set up socket.io event handlers
    }, [])

    const handleCloseFilters = () => {
      setOpenFilters(false);
    };

    const handleOpenFilters = () => {
      setOpenFilters(true);
    };

    const handleChangeFilters = (event) => {
      setLoading(true);
      setPosts(
        parentPosts.filter(e => event.target.value.indexOf(e.type) > -1)
      )
      setFilters(event.target.value);
    };

    const handleChange = (value) => {
      setLoading(true);
      switch (value) {
        case 'New':
          parentPosts.sort((p1, p2) => new Date(p2.created_at) - new Date(p1.created_at));
          break;
        case 'Subposts':
          parentPosts.sort((p2, p1) => (p1.relationcount ? p1.relationcount : 0) - (p2.relationcount ? p2.relationcount : 0))
          break;
        case 'Comments':  
          parentPosts.sort((p2, p1) => (p1.commentscount ? p1.commentscount : 0) - (p2.commentscount ? p2.commentscount : 0))
          break;
        case 'Votes':
          parentPosts.sort((p2, p1) => (p1.upvote ? p1.upvote : 0) - (p2.upvote ? p2.upvote : 0))
          break;
        default: 
          parentPosts.sort((p2, p1) => p1.created_at - p2.created_at)
          break;
      }
      if (!allPosts) {
        setPosts(
          parentPosts.filter(e => filters.indexOf(e.type) > -1 && (!e.parentcount || e.parentcount === 0))
        );
      } else {
        setPosts(
          parentPosts.filter(e => filters.indexOf(e.type) > -1)
        );
      }
      

      setSort(value);
      setState({
        ...state,
        anchorEl: null
      })
    };
  
    const handleClose = () => {
      setState({
        ...state,
        anchorEl: null
      })
    };
  
    const handleOpen = (e) => {
      setState({
        ...state,
        anchorEl: e.currentTarget
      })
    };
    
    return (
        <div style={{paddingBottom: '100px', position: 'relative', paddingBottom: 20}}>
          <div style={{marginLeft: 5, marginRight: 5}}>
            <div>
                <Button onClick={handleOpen} style={{textTransform: 'none', paddingLeft: 20}} startIcon={<Sort/>}>
                  {(props.width === 'xs' || props.width === 'xs') ? '': 'Sort'}
                </Button>
                <Menu
                  anchorEl={state.anchorEl}
                  open={!!state.anchorEl}
                  onClose={handleClose}
                >
                    {
                      sorts.map(s => <MenuItem value={s} onClick={() => handleChange(s)} key={s}>{s}</MenuItem>)
                    }
                </Menu>
                <FormControl>
                <Button onClick={handleOpenFilters} style={{textTransform: 'none'}} startIcon={<FilterListIcon/> }>
                  {(props.width === 'xs' || props.width === 'xs') ? '': 'Filter'}
                </Button>
                  <Select
                    open={openFilters}
                    onClose={handleCloseFilters}
                    onOpen={handleOpenFilters}
                    value={filters}
                    onChange={handleChangeFilters}
                    style={{visibility: 'hidden', width: 0, height: 0}}
                    multiple
                  >
                    {types.map(type => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={filters.indexOf(type) > -1} />
                        <ListItemText primary={type} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <div style={{float: 'right'}}>
                  {
                    !visualState.visual &&
                    !disableVisual && parent &&
                    <Button onClick={() => setVisualState({...visualState, visual: true})} style={{textTransform: 'none', paddingRight: 20}} startIcon={<BubbleChartIcon/>}>
                      {(props.width === 'xs' || props.width === 'xs') ? '': 'Visualize'}
                    </Button>
                  }
                </div>
                
              </div>
          </div>
            {
              !props.inDashboard && !visualState.visual && !props.selecting && 
              <div>
                {
                  posts.filter(p => p.pinned && (props.inPost || p.parentcount === 0)).map((p, i) => {
                    return (
                      <div style={{margin: 15}}  key={i} >
                        <PostCard onPostClicked={onPostClicked ? onPostClicked : () => {}} focused={selecting} width={props.width} inDashboard={props.inDashboard} readonly={readonly} parent={parent} inParent post={p} relation={(relations && i < relations.length) ? relations[i] : undefined} parentPost={parentPost}/>
                      </div>
                    ) 
                  })
                }
              </div>
            }

          {!loading && !visualState.visual &&
          <InfiniteScroll
            dataLength={num} //This is important field to render the next data
            next={() => setNum(num + 20)}
            hasMore={num < passedPosts.length}
            loader={<CircularProgress/>}
            scrollableTarget="scrollableDiv"
          >
          {
            (!props.inDashboard && !props.linked && !visualState.visual && !props.selecting && !props.parentPost) ?
            posts.filter(p => !p.pinned && !p.original_deleted && !p.deleted && !p.hidden).slice(0, num).map((p, i) => {
              return (
                <div style={{margin: 15}}  key={i}  onClick={() => {if (selecting) onPostClicked(p)}}>
                  <PostCard 
                    width={props.width}
                    onPostClicked={onPostClicked ? onPostClicked : () => {}} 
                    selecting={selecting} 
                    inDashboard={props.inDashboard} 
                    parent={parent} 
                    inParent 
                    focused={selecting}
                    post={p}
                    parentPost={parentPost}
                    relation={(relations && i < relations.length) ? relations[i] : undefined}
                    updateParent={updateParent}
                  />
                </div>
              ) 
            })

            :

            posts.slice(0, num).map((p, i) => {
              return (
                <div style={{margin: 5}}  key={i} >
                  <PostCard 
                    width={props.width}
                    selecting={selecting} 
                    inDashboard={props.inDashboard} 
                    linked={props.linked} 
                    readonly={readonly} 
                    parent={parent} 
                    inParent 
                    focused={selecting}
                    post={p} 
                    relation={(relations && i < relations.length) ? relations[i] : undefined} 
                    onPostClicked={onPostClicked ? onPostClicked : () => {}}
                    parentPost={parentPost} 
                    isParentOwner={parentPost && store.getState().userActions.userInfo && store.getState().userActions.userInfo.user_id === parentPost.post_owner_id} 
                    updateParent={updateParent}
                  />
                </div>
              ) 
            })
          }

          </InfiniteScroll>     
        }  
        {
          visualState.visual &&
            <Dialog open={true} onClose={() => setVisualState({...visualState, fullscreen: false, visual: false})} fullScreen
            maxWidth={'lg'}
            >
            <DialogTitle>
              <Typography variant="h5" >
              Visualizing {parent ? parent.name : ''} {parentPost ? `/ ${parentPost.title}` : ''}

              </Typography>
              <div style={{float: 'right', marginTop: '-40px'}}>
                  <IconButton  onClick={() => {setVisualState({...visualState, fullscreen: true}); handle.enter()}}>
                    <Fullscreen/>
                  </IconButton>
                
              
              <IconButton  onClick={() => setVisualState({...visualState, visual: false})}>
                <Close/>
              </IconButton>
              </div>
              
            </DialogTitle>
            <div style={{overflow: 'hidden', marginTop: '-20px'}}>
            <FullScreen handle={handle} onChange={(e) => {
              setVisualState({...visualState, fullscreen: e})
             
            }}>
              <Divider style={{color: 'black', height: 3}}/>
              <Paper style={{minHeight: '1000px'}}>
                  Coming Soon
              </Paper>
            </FullScreen>

            </div>
          </Dialog>
            }
            
            
        
            
        </div>
    )
}


export default withWidth()(PostSpace);