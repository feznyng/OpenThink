import React, { Suspense, lazy, useState, useEffect } from 'react';
import { getOrganizations } from '../../actions/orgActions'
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { useSelector } from "react-redux";
import {Card, Dialog, DialogTitle, DialogContent, IconButton, Button, CardContent, Typography, Divider} from '@material-ui/core';
import {Close, Add} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import SpaceCard from './Card/SpaceCardOld';
import withWidth from '@material-ui/core/withWidth';
import store from '../../Store';
import SpaceListCard from './Card/SpaceListCard';
import { useHistory, useParams } from 'react-router';

const SpaceCreator = lazy(() => import('./SpaceCreatorOld'));

const useStyles = makeStyles(() => ({
    root: {

      width: '100%',
      border: 'dashed'
    },
  }));

function SpaceList(props) {
    const {spaces, onCreate, parent, list, passedCols, root, readonly, opened, onClick, project, spaceCardProps, width} = props;
    const classes = useStyles();
    const [organizations, setOrganizations] = useState(spaces);
    const [open, setOpen] = useState(false);
    const orgState = useSelector(state => state.orgActions)
    const thisUser = store.getState().userActions.userInfo;
    const history = useHistory();
    const params = useParams();
    
    const {
      currSpace
    } = useSelector(state => state.orgActions)

    const sidebarOpen = useSelector(state => state.nav.sidebarOpen)

    useEffect(() => {
      setOpen(opened);
    }, [opened]);

    useEffect(() => {
        setOrganizations(spaces);
    }, [spaces]);

    let cols = 3;

    if (passedCols)
      cols = passedCols
    else if (window.innerWidth < 1200 || sidebarOpen)
      cols = 2;
    if ((width === 'xs' || width === 'sm')&& window.innerWidth < 550)
      cols = 1;

    return (
        <div onClick={onClick ? onClick : () => {}} style={{padding: 10}}>
          {
            list ? 
            <div style={{marginTop: '10px'}}>
              { 
                !readonly && 
                <Button 
                  style={{height: 50, marginBottom: 10, borderRadius: '30px', textTransform: 'none'}} 
                  variant="outlined" 
                  onClick={() => setOpen(true)}
                  fullWidth
                >
                    Create {project ? 'Projects' : (root ? 'Group' : 'Subgroup')}
                </Button>
              }
              {spaces.length === 0 && <Typography style={{textAlign: 'center'}}>No {project ? 'Projects' : (root ? 'Groups' : 'Subgroups')}</Typography>} 
              {
                spaces.map(s => (
                  <SpaceListCard group={s}/>
                ))
              }
            </div>
            :
            <div>
              <div>
                <GridList style={{height: '100%'}} cellHeight={'auto'} cols={cols} >
                  {
                    organizations.filter(o => {
                      if ((o.type === 'Private' && !o.users.find(u => thisUser && u.user_id === thisUser.user_id))) {
                        return false;
                      }
                      return true;
                    }).map(o => (
                      <GridListTile key={o._id} cols={1}>
                        <div style={{padding: 15, height: '100%'}}>
                          <SpaceCard root={root} parent organization={o} {...spaceCardProps} style={{width: '100%', height: '100%'}}></SpaceCard>
                        </div>
                      </GridListTile>
                    ))
                  }
                </GridList>
              </div>
            </div>
          }
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
          >
            <DialogTitle>
              Create {project ? 'Projects' : (root ? 'Group' : 'Subgroup')}
              <div>
                <IconButton style={{position: 'absolute', top: 5, right: 10}} onClick={() => setOpen(false)}> 
                  <Close/>
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent>
              <SpaceCreator
                project={project}
                parent={currSpace}
                onFinish={(space) => history.push(`/space/${space.space_id}`)}
              />
            </DialogContent>
           
          </Dialog>
        </div>
    )
}



export default withWidth()(SpaceList);