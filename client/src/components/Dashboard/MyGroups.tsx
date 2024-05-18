import { Card, Typography } from "@material-ui/core";
import { useHistory } from "react-router";
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { MyGroupsFragment$key } from "./__generated__/MyGroupsFragment.graphql";
import SpaceList from "../Space/SpaceList";
import Button from "../Shared/Button";
import Link from "../Shared/Link";


interface MyGroupsProps {
    style?: React.CSSProperties,
    me: any
}

const MyGroups = ({me, style}: MyGroupsProps) => {
    const data = useFragment<MyGroupsFragment$key>(
        graphql`
            fragment MyGroupsFragment on User {
                spaces(first: 6, sortBy: "Active", filters: {project: false}) {
                    edges {
                        node {
                            spaceId
                        }
                    }
                    ...SpaceListFragment
                }
                darkMode
            }
        `,
        me
    )

    const history = useHistory();
    return (
        <div style={{...style}}>
            <div style={{paddingBottom: 15, textAlign: 'left', ...style}}>
                <div style={{paddingLeft: 15, paddingTop: 15, paddingBottom: 10}}>
                <Link
                    style={{marginBottom: 10, cursor: 'pointer'}} 
                    to={'/spaces/my-groups'}
                    typographyProps={{variant: 'h6'}}
                    defaultStyle
                >
                    My Groups
                </Link>
                </div>
                {
                    data?.spaces?.edges?.length === 0 && 
                    <Typography style={{padding: 15}}>
                        You're not a part of any groups.
                    </Typography>
                }
                {
                    data?.spaces && 
                    <div style={{marginTop: 10}}>
                        <SpaceList
                            spaces={data?.spaces}
                            spaceListItemProps={{
                                hideJoin: true
                            }}
                            maxLength={5}
                        />
                    </div>
                }
               
            </div>
            {
                (data?.spaces?.edges?.length && data.spaces.edges.length > 5) ?
                <Button onClick={() => history.push('/spaces/my-groups')} fullWidth>
                    See All
                </Button>
                :
                <span/>
            }
        </div>
    )
}

export default MyGroups