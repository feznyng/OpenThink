import React from 'react';
import { tag } from '../../types/tag';
import graphql from 'babel-plugin-relay/macro';
import { fetchQuery } from '../../utils/graphqlutils';
import Typography from '../Shared/Typography';
import SelectorInput, { SelectorInputProps } from '../Shared/SelectorInput';
import { ItemSelectorProps } from '../../types/elements';
import { Link } from '@material-ui/core';

interface TagSelectorState {
    tags: string[],
    loading?: boolean,
    baseTags: string[],
    focused: boolean,
    inputValue: string,
    query: string
}

export default function TagSelector({limit, value, onChange, disabled, variant, ...props}: ItemSelectorProps) {
    const [state, setState] = React.useState<TagSelectorState>({
        tags: [],
        baseTags: [],
        inputValue: '',
        focused: false,
        query: ''
    })


    React.useEffect(() => {
        fetchQuery(
            graphql`
                query TagSelectorInitialQuery {
                    tags(first: 100) {
                        edges {
                            node
                        }
                        pageInfo {
                            hasNextPage
                        }
                    }
                }
            `,
            {}
        ).subscribe({
            next: (data: any) => {
                const {edges} = data.tags;
                setState({
                    ...state,
                    tags: edges.map((e: {node: any}) => e.node),
                    baseTags: edges.map((e: {node: any}) => e.node),
                })
            },
            error: (error: any) => console.log(error)
        })
    }, [])

    const searchTags = (query: string) => {
        // make a note of space at the end
        const hasSpace = query.charAt(query.length - 1) === ' '
        // sanitize query remove non-alphanumerics (dashes, symbols, spaces)
        query = sanitizeQuery(query)
        
        // if space at end and sanitized.length is greater than 1 add it to the the post's tags by invoking onChange and clear query
        if (hasSpace && query.length > 0 && !value.includes(query)) {
            onChange([...value, query])
            setState({
                ...state,
                query: ''
            })
            return
        }

        if (query.length === 0) {
            setState({
                ...state,
                tags: state.baseTags,
                query
            })
        } else {
            setState({
                ...state,
                loading: true
            })
            fetchQuery(
                graphql`
                    query TagSelectorSearchQuery($query: String!) {
                        searchTags(first: 100, query: $query) {
                            edges {
                                node
                            }
                        }
                    }
                `,
                {
                    query
                }
            ).subscribe({
                next: (data: any) => {
                    setState({
                        ...state,
                        tags: data.searchTags.edges.map((e: any) => e.node),
                        query,
                        loading: false,
                    })
                },
                error: (error: any) => console.log(error)
            })
        }
    }

    const sanitizeQuery = (query: string) => {
        const regex = /[^A-Za-z0-9]/g
        return query.replace(regex, "")
    }

    
    return (
        <SelectorInput
            {...props}
            id={"tag-autocomplete"}
            options={state.tags.filter(tag => !value.includes(tag))}
            limit={limit}
            disabled={disabled}
            getOptionLabel={(option) => option}
            value={value}
            freeSolo
            autoHighlight
            fullWidth
            placeholder={props.placeholder ? props.placeholder : "Attach tags"}
            renderOption={tag => (
                <span style={{display: 'flex', alignItems: 'center', marginBottom: 2}}>
                    <Link style={{marginLeft: 5}}># {tag}</Link>
                </span>
            )}
            renderTags={tags => tags.map((tag: string) => (
                <span style={{display: 'flex', alignItems: 'center', marginBottom: 2}}>
                    <Link style={{marginLeft: 5}}># {tag}</Link>
                </span>
            ))}
            getChipProps={(tag) => ({
                icon: <Typography>#</Typography>
            })}
            onChange={onChange}
            searchOptions={searchTags}
            textFieldProps={{
                variant,
            }}
            queryValue={state.query}
        />
    )
}