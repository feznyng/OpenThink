import Breadcrumbs from '../Shared/Breadcrumbs/Breadcrumbs';
import {Typography, withWidth, Card, useMediaQuery} from '@material-ui/core'
import {Link} from 'react-router-dom';
import { useSelector } from "react-redux";
import { withRouter } from 'react-router-dom';
import PostPreview from './PostPreviewOld'
import SpaceIcon from '../Space/SpaceIconOld';

function PostNavMenu(props) {
    const {id, parentType, dark, style} = props;
    const {
        postStack,
        spaceStack,
        menuHeight
    } = useSelector(state => ({...state.orgActions, ...state.postActions, ...state.uiActions}))

    const matches = useMediaQuery('(min-width:700px)');

    return (
        <div style={{width: '100%', ...style}}>
            <Breadcrumbs>
                {
                    spaceStack.map((s, i) => (
                            <Link 
                                style={{color: 'black'}} 
                                key={JSON.stringify(s)} 
                                to={{pathname: `/${s.space_id ? 'space': 'project'}/${s.space_id ? s.space_id : s.project_id}`, state: {clear: false, push: false}}}
                            >
                                <span style={{display: 'flex', alignItems: 'center'}}>
                                    <SpaceIcon
                                        organization={s}
                                        size={40}
                                    />
                                    <Typography
                                        variant="h6"
                                        style={{fontWeight: 'bold', marginLeft: 10}}
                                    >
                                        {s.name}
                                    </Typography>
                                </span>
                            </Link>
                        )
                    )
                }
                {
                    
                    postStack.map((p, i) => (
                            <div style={{marginBottom: -5}}>
                                <Link to={`/${parentType}/${id}/post/${p.post_id}`} key={p.post_id}>
                                    <Typography style={{textDecoration: 'none', color: 'black'}}>
                                        <PostPreview p={p} size={50}/>
                                    </Typography>
                                </Link>
                            </div>
                        )
                    )
                    
                }
            </Breadcrumbs>
        </div>
    )
}

export default withWidth()(withRouter(PostNavMenu));