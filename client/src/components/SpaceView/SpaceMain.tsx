import { Divider, useMediaQuery } from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Search } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay';
import { useHistory } from 'react-router';
import { pluralize } from '../../utils/textprocessing';
import BannerImage from '../Shared/BannerImage';
import SpaceIcon from '../Space/SpaceIcon';
import VisibilityIcon from '../Space/VisibilityIcon';
import SpaceHeader from './SpaceHeader';
import SpaceMainActions from './SpaceMainActions';
import SpaceNav from './SpaceNav';

interface SpaceMainProps {
    space: any,
    user: any
}

interface SpaceMainState {
  anchorEl: null | Element,
  descLength: number
}

export default function SpaceMain({space, user}: SpaceMainProps) {
  const {currUser, numUsers, type, name, spaceId, ...data} = useFragment(
    graphql`
      fragment SpaceMainFragment on Space {
        ...SpaceMainActionsFragment
        ...SpaceHeaderFragment
        ...VisibilityIconFragment
        currUser {
          accepted
          request
          type
        }
        type
        spaceId
        name
        numUsers
      }
    `,
    space
  )

  const me = useFragment(
    graphql`
      fragment SpaceMainFragment_me on User {
        productivityView
      }
    `,
    user
  )

  const matches = useMediaQuery('(min-width:600px)');  
  const history = useHistory();

  return (
    <div style={{position: 'relative'}}>
      <SpaceHeader
        space={data}
      />
      <CardContent style={{marginTop: 30}}>
        <Typography variant="h4" style={{fontWeight: 'bold'}}>
          {name}
        </Typography>
        
        <div style={{position: 'relative', marginTop: 15}}>
          <div style={{height: 30}}>
            <div style={{position: 'absolute', left: 0}}>                    
              <span style={{display: 'flex', alignItems: 'center', marginRight: 100, cursor: 'pointer'}}>
                <VisibilityIcon
                  space={data}
                  onClick={() => history.push(`/space/${spaceId}/about`)}
                />
                <Typography style={{marginLeft: 5}} color="textSecondary" onClick={() => history.push(`/space/${spaceId}/about`)}> 
                  {type}
                </Typography>
                <Typography style={{marginLeft: 5}} color="textSecondary">
                  {` \u2022  `}
                </Typography>
                <Typography color="textSecondary" style={{marginLeft: 5}} onClick={() => history.push(`/space/${spaceId}/people`)}>
                  {`${numUsers} ${pluralize('member', numUsers)}`}
                </Typography>
              </span>
            </div>
          </div>
          <div style={{position: matches ? 'absolute' : undefined, right: 0, top: -20, marginTop: 5}}>
            <SpaceMainActions
              space={data}
            />
          </div>
        </div>
      </CardContent>
    </div>
  )
}


