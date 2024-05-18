import React from 'react';
import SpaceIcon from '../Space/SpaceIcon';
import { space } from '../../types/space';
import graphql from 'babel-plugin-relay/macro';
import { fetchQuery } from '../../utils/graphqlutils';
import Typography from '../Shared/Typography';
import SelectorInput, { SelectorInputProps } from '../Shared/SelectorInput';
import { ItemSelectorProps } from '../../types/elements';

interface SpaceSelectorState {
    spaces: space[],
    loading?: boolean,
    baseSpaces: space[],
    focused: boolean,
    inputValue: string
}

export default function SpaceSelector({limit, value, onChange, disabled, variant, ...props}: ItemSelectorProps) {
    const [state, setState] = React.useState<SpaceSelectorState>({
        spaces: [],
        baseSpaces: [],
        inputValue: '',
        focused: false
    })


    React.useEffect(() => {
        fetchQuery(
            graphql`
                query SpaceSelectorInitialQuery {
                    spaces(first: 100) {
                        edges {
                            node {
                                spaceId
                                name
                                ...SpaceIconFragment
                            }
                        }
                        pageInfo {
                            hasNextPage
                        }
                    }

                    me {
                        firstname
                    }
                }
            `,
            {}
        ).subscribe({
            next: (data: any) => {
                const {edges} = data.spaces;
                setState({
                    ...state,
                    spaces: edges.map((e: {node: any}) => e.node),
                    baseSpaces: edges.map((e: {node: any}) => e.node),
                })
            },
            error: (error: any) => console.log(error)
        })
    }, [])

    const searchSpaces = (name: string) => {
        if (name.length === 0) {
            setState({
                ...state,
                spaces: state.baseSpaces,
            })
        } else {
            setState({
                ...state,
                loading: true
            })
            fetchQuery(
                graphql`
                    query SpaceSelectorSearchQuery($query: String!) {
                        searchSpaces: spaces(first: 100, filters: {query: $query}) {
                            edges {
                                node {
                                    spaceId
                                    name
                                    ...SpaceIconFragment
                                }
                            }
                        }
                    }
                `,
                {
                    query: name
                }
            ).subscribe({
                next: (data: any) => {
                    setState({
                        ...state,
                        spaces: data.searchSpaces.edges.map((e: any) => e.node),
                        loading: false,
                    })
                },
                error: (error: any) => console.log(error)
            })
        }
    }

    return (
        <SelectorInput
            {...props}
            size='small'
            id={"space-autocomplete"}
            options={state.spaces.filter(space => !value.find(s => s.spaceId === space.spaceId))}
            limit={limit}
            disabled={disabled}
            getOptionLabel={(option) => option.name}
            value={value}
            fullWidth
            placeholder={props.placeholder ? props.placeholder : "Post to"}
            renderOption={space => (
                <div style={{display: 'flex', alignItems: 'center', marginBottom: 2}}>
                    <SpaceIcon space={space} size={32}/>
                    <Typography style={{marginLeft: 5}}>{space.name}</Typography>
                </div>
            )}
            getChipProps={(space) => ({
                icon: <SpaceIcon space={space} size={32}/>
            })}
            onChange={onChange}
            searchOptions={searchSpaces}
            textFieldProps={{
                variant,
            }}
            min={1}
        />
    )
}