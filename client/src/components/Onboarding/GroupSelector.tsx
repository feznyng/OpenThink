import React from 'react'
import { useHistory } from 'react-router';
import SpaceCreator from '../Space/SpaceCreator';
import SpaceList from '../Space/SpaceList';
import TextField from '../Shared/TextField';
import { GroupAdd } from '@material-ui/icons';
import Typography from '../Shared/Typography';
import Button from '../Shared/Button';
import GroupSelectorResults from './GroupSelectorResults';
import { Suspense } from 'react';
import Loader from '../Shared/Loader';
import MaxWidthWrapper from '../Shared/MaxWidthWrapper';


interface GroupSelectorProps {
    root: any
}

export default function GroupSelector({root}: GroupSelectorProps) {
    const [state, setState] = React.useState({
        loading: true,
        creatingGroup: false,
        query: ''
    });

    const history = useHistory();

    
    const searchSpaces = (query: string) => {
        setState({
            ...state,
            query
        })
    }

    return (
        <div style={{paddingTop: '1vw'}}>
            <MaxWidthWrapper width={1000}>
                <Typography variant="h4">
                    Join Groups
                </Typography>
                <Typography style={{marginTop: 20}}>Here are some groups based on your interests. You can also create a group.</Typography>
                <div style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search for a Group"
                        onChange={e => searchSpaces(e.target.value)}
                        style={{marginTop: 15, marginRight: 5, width: '100%'}}
                        size='small'
                    />
                    <Button
                        variant="contained" 
                        color="primary" 
                        onClick={() => setState({...state, creatingGroup: true})}
                        startIcon={<GroupAdd fontSize='large'/>}
                        style={{marginTop: 15, width: 150}}
                    >
                        Create
                    </Button>
                </div>
                <Suspense fallback={<Loader/>}>
                    <GroupSelectorResults
                        root={root}
                        query={state.query}
                        style={{marginTop: 20}}
                        creatingGroup={state.creatingGroup}
                        onClose={() => setState({...state, creatingGroup: false})}
                    />
                </Suspense>
            </MaxWidthWrapper>
        </div>
    )
}
