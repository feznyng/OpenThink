import React, { CSSProperties, Fragment } from 'react'
import { useHistory, useLocation, useParams } from 'react-router';
import {queryString} from '../utils/urlutils';
import MaxWidthWrapper from '../components/Shared/MaxWidthWrapper'
import { Card, CardContent } from '@material-ui/core';
import Sticky from 'react-sticky-el';
import SearchFilters, { SearchTypeFilter } from '../components/Search/SearchFilters';
import PostSearchResults from '../components/Search/PostSearchResults';
import { usePreloadedQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import SpaceSearchResults from '../components/Search/SpaceSearchResults';
import UserSearchResults from '../components/Search/UserSearchResults';
import { SearchQuery } from './__generated__/SearchQuery.graphql';

export interface SearchResultsProps {
    searchResults: any,
    shortened?: boolean,
    onFilterChange: (filter: SearchTypeFilter) => void
    style?: CSSProperties
}

interface SearchProps {
    queryRef: any
}

export default function Search({queryRef}: SearchProps) {
    const searchResults = usePreloadedQuery<SearchQuery>(
        graphql`
            query SearchQuery(
                $query: String!, 
                $spaceId: Int,
                $groupCursor: String, 
                $groupCount: Int!, 
                $projectCount: Int!, 
                $projectCursor: String, 
                $userCount: Int!, 
                $userCursor: String, 
                $postCount: Int!, 
                $postCursor: String,
                $reactionCount: Int!, 
                $reactionCursor: String,
                $tagCount: Int!,
                $tagCursor: String
            ) {
                ...SpaceSearchResultsFragment
                ...UserSearchResultsFragment
                ...PostSearchResultsFragment
            }
        `,
        queryRef
    )

    const { search } = useLocation()
    const { type } = useParams<any>()
    const history = useHistory()
    const all = type === 'all'
    const onFilterChange = (filter: SearchTypeFilter) => {
        history.push(`/search/${filter}/${search}`)
    }

    return (
        <div style={{width: '100%'}}>
            <Card style={{width: '100%', padding: 10, borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                <MaxWidthWrapper width={600}>
                    <SearchFilters
                        onFilterChange={onFilterChange}
                        selectedType={type}
                    />
                </MaxWidthWrapper>
            </Card>
            <MaxWidthWrapper width={600} style={{marginTop: 15, paddingBottom: 20}}>
                <Fragment>
                    {
                        (all || type === 'groups') &&
                        <SpaceSearchResults
                            searchResults={searchResults}
                            shortened={type !== 'groups'}
                            onFilterChange={onFilterChange}
                            variant="Group"
                        />
                    }
                    {
                        (all || type === 'projects') &&
                        <SpaceSearchResults
                            searchResults={searchResults}
                            shortened={type !== 'projects'}
                            onFilterChange={onFilterChange}
                            variant="Project"
                            style={{marginTop: type === 'projects' ? 0 : 15}}
                        />
                    }
                    {
                        (all || type === 'people') &&
                        <UserSearchResults
                            searchResults={searchResults}
                            shortened={type !== 'people'}
                            onFilterChange={onFilterChange}
                            style={{marginTop: type === 'people' ? 0 : 15}}
                        />
                    }
                    {
                        (all || type === 'posts') &&
                        <PostSearchResults
                            searchResults={searchResults}
                            shortened={type !== 'posts'}
                            onFilterChange={onFilterChange}
                            style={{marginTop: type === 'posts' ? 0 : 15}}
                        />
                    }
                </Fragment>
            </MaxWidthWrapper>
        </div>
    )
}