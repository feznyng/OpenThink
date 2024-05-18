import { Button, Typography } from '@material-ui/core'
import React from 'react'
import SpaceCard from '../Space/SpaceCard';
import { useHistory } from 'react-router';
import { useLazyLoadQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import SpaceList from '../Space/SpaceList';

export default function FeaturedOrganizations() {

    const featuredSpaceIds = JSON.parse(process.env.REACT_APP_FEATURED_ORGANIZATION_IDS).map(val => val.toString())

    const { spaces } = useLazyLoadQuery(
        graphql`
            query FeaturedOrganizationsQuery($featuredSpaceIds: [String!]!) {
                spaces(first: 10, spaceIds: $featuredSpaceIds) {
                    edges {
                        node {
                            spaceId
                        }
                    }
                    ...SpaceListFragment
                }
            }
        `,
        {featuredSpaceIds}
    )

    console.log(spaces)

    const history = useHistory();

    return (
        <div style={{marginLeft: 20, marginRight: 20, textAlign: 'center'}}>
            <Typography
                variant="h3"
                style={{fontWeight: 'bold'}}
            >
                Featured Organizations
            </Typography>
            <div
                style={{marginTop: '5vh', marginBottom: '5vh', display: 'flex', justifyContent: 'center'}}
            >
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <div style={{maxWidth: 700, textAlign: 'center'}}>
                    <Typography
                        variant="h4"
                        style={{fontWeight: 'bold'}}
                    >
                        Do you have an organization you'd like to have on Openthink? 
                    </Typography>
                    <div
                        style={{marginTop: 20, marginBottom: 20}}
                    >
                        <Typography
                            variant="body2"
                            style={{fontSize: 20}}
                        >
                            We help organizations across the world connect with volunteers and get organized with our project management and collaboration tools.
                        </Typography>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            disableElevation
                            size="large"
                            style={{borderRadius: 20, textTransform: 'none'}}
                            onClick={() => {history.push('/organizations'); window.scrollTo(0, 0)}}
                        >
                            Find out More
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
