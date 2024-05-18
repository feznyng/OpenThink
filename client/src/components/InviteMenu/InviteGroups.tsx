import React from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import SpaceList from '../Space/SpaceList';
import { toggleArrayElement } from '../../utils/arrayutils';
import Typography from '../Shared/Typography';
import RoundedTextField from '../Shared/RoundedTextField';

interface InviteGroupsProps {
    space: any,
    user: any,
    groupIds: number[],
    onGroupSelect: (groupId: number) => void,
}

export default function InviteGroups({space, user, groupIds, onGroupSelect}: InviteGroupsProps) {
    const {spaces} = useFragment(
        graphql`
            fragment InviteGroupsFragment_user on User {
                spaces(first: 10) {
                    ...SpaceListFragment
                }
            }
        `,
        user
    )

    const [state, setState] = React.useState({
        query: ''
    })

    return (
        <div>
            <RoundedTextField
                onChange={e => setState({...state, query: e.target.value})}
                fullWidth
                style={{marginBottom: 15}}
                size="small"
                placeholder="Search Groups"
            />
            {
                state.query.length === 0 ? 
                <div>
                    
                    <Typography
                        variant="subtitle2"
                    >
                        Suggested Groups
                    </Typography>
                    <SpaceList
                        spaces={spaces}
                        spaceListItemProps={{
                            onSelect: onGroupSelect
                        }}
                        selectedSpaceIds={groupIds}
                    />
                </div>
                :
                <div>

                </div>
            }
            
        </div>
    )
}
