import React, { Suspense } from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import SpaceMembers from '../Space/SpaceMembers';
import SearchLoader from '../Shared/SearchLoader';
import SpacePeopleSearchResults from '../Space/SpacePeopleSearchResults';
import RoundedTextField from '../Shared/RoundedTextField';
import { Checkbox, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';

interface InviteSpaceMembersProps {
    space: any,
    userIds: number[],
    onUserSelect?: (userId: number) => void,
    toggleAll?: () => void,
    allSpaceMembers?: boolean
}

export default function InviteSpaceMembers({space, allSpaceMembers, toggleAll, userIds, onUserSelect}: InviteSpaceMembersProps) {
    const {project, ...data} = useFragment(
        graphql`
            fragment InviteSpaceMembersFragment on Space {
                spaceId
                project
                ...SpaceMembersFragment
                ...SpacePeopleSearchResultsFragment
            }
        `,
        space ? space : null
    )

    const [state, setState] = React.useState({
        query: '',

    })
    
    return (
        <div>
            <RoundedTextField
                onChange={e => setState({...state, query: e.target.value})}
                placeholder="Search Members"
                size='small'
                fullWidth
                style={{marginBottom: 15}}
            />
            <ListItem
                button
                style={{paddingLeft: 1, paddingRight: 0}}
                onClick={toggleAll}
            >
                <ListItemAvatar>
                    <Checkbox
                        checked={!!allSpaceMembers}
                    />
                </ListItemAvatar>
                <ListItemText
                    style={{marginLeft: -15}}
                    primary={`Select all members of this ${project ? 'project' : 'group'}`}
                />
            </ListItem>
            {
                state.query.length === 0 ?
                <SpaceMembers
                    space={data}
                    listProps={{
                        selectedIds: userIds,
                        selectAll: !!allSpaceMembers,
                        listItemProps: {
                            onSelect: onUserSelect
                        }
                    }}
                />
                :
                <Suspense
                    fallback={<SearchLoader/>}
                >
                    <SpacePeopleSearchResults
                        space={data}
                        query={state.query}
                        onUserSelect={onUserSelect}
                        userIds={userIds}
                        selectAll={allSpaceMembers}
                    />
                </Suspense>
                
            }
        </div>
    )
}
