import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Card, CardContent, CardMedia, Typography, Button, Paper, Chip} from '@material-ui/core';
import OrganizationIcon from '../SpaceIconOld'
import { useLocation, useHistory } from "react-router-dom";
import { getImage } from '../../../actions/S3Actions';
import { AccessTime, LocationCity, LocationOn, People, Subject } from '@material-ui/icons';
import JoinButton from '../JoinButtonOld';
import store from '../../../Store';
import BannerImage from '../../Shared/BannerImageOld';
import { primaryColor } from '../../../App';

export default function SpaceCard (props) {
  const {organization, root, onClick, preview, showDescription} = props;
  const [state, setState] = React.useState({
    hover: false,
    bannerpic: 'https://placeimg.com/1000/300/nature'
  });
  const location = useLocation();
  const history = useHistory();
  const description = organization.description;
  let clickAction = onClick;
  if (!clickAction) {
    clickAction = () => history.push({pathname: `/space/${organization.space_id}`, state: {from: location.pathname, clear: root ? root : false, push: true}})
  }
  
  return (
    <div style={{height: '100%'}}>
        <Card 
          style={{
            width: 275,
            textDecoration: 'none',
            position: 'relative',
            cursor: 'pointer',
            ...props.style, 
          }}
          onClick={clickAction}
        >
              <div style={{position: 'relative'}}>
                <BannerImage
                  object={{bannerpic: organization.bannerpic, defaultBanner: organization.default_banner}}
                  style={{height: 150, width: '100%', objectFit: 'cover'}}
                />
                {
                  /*
                    <div style={{position: 'absolute', top: 0, right: 0, padding: 5, paddingRight: 15, backgroundColor: primaryColor, display: 'flex', alignItems: 'center', borderEndStartRadius: 10}}>
                      <AccessTime style={{color: 'white', marginRight: 5, fontSize: 15}}/>
                      <Typography style={{color: 'white', fontSize: 12}}>
                        Updated 3 hours ago
                      </Typography>
                    </div>
                  */
                }
              
              </div>
                
            <CardContent style={{textAlign: 'left', marginBottom: 10, marginTop: -10}}>
              <Typography gutterBottom variant="h6"component="h2">
                {organization.name}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" style={{marginTop: -10, fontWeight: 'normal', marginBottom: 10}}>
                {`${organization.space_user_number} member${organization.space_user_number > 1 ? 's' : ''} ${organization.address ? `\u2022 ${organization.address}` : ''}`}
              </Typography>
              {
                showDescription && 
                <div style={{height: 70}}>
                  <Typography variant="p" style={{fontWeight: 'normal'}}>
                    {`${description.substring(0, 75)}${description.length > 75 ? '...' : ''}`}
                  </Typography>
                </div>
              }
            
            </CardContent>
            <div style={{height: 42}}/>
            {
              !preview && 
              <div style={{position: 'absolute', height: 42, bottom: 10, width: '100%', display: 'flex', justifyContent: 'center'}}>
                <div style={{width: 200}} onClick={(e) => {e.preventDefault(); e.stopPropagation()}}>
                  <JoinButton
                    organization={organization}
                    currUser={store.getState().userActions.userInfo}
                    preview
                    showType
                  />
                </div>
              </div>
            }
        </Card>
    </div>
    

  );
}