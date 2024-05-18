import React from 'react';
import SpaceIcon from '../Space/SpaceIcon';
import { space } from '../../types/space';
import graphql from 'babel-plugin-relay/macro';
import { fetchQuery } from '../../utils/graphqlutils';
import Typography from '../Shared/Typography';
import SelectorInput, { SelectorInputProps } from '../Shared/SelectorInput';
import { ItemSelectorProps } from '../../types/elements';
import { SkillSelectorInitialQuery, SkillSelectorInitialQuery$data } from './__generated__/SkillSelectorInitialQuery.graphql';

interface SkillSelectorState {
    skills: string[],
    loading?: boolean,
    baseSkills: string[],
    focused: boolean,
    inputValue: string,
    customSkill: string
}

export default function SkillSelector({limit, value, onChange, disabled, variant, ...props}: ItemSelectorProps) {
    const [state, setState] = React.useState<SkillSelectorState>({
        skills: [],
        baseSkills: [],
        inputValue: '',
        focused: false,
        customSkill: ''
    })


    React.useEffect(() => {
        fetchQuery(
            graphql`
                query SkillSelectorInitialQuery {
                    skills(first: 100) {
                        edges {
                            node
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
                const {edges} = data.skills;
                setState({
                    ...state,
                    skills: edges.map((e: {node: any}) => e.node),
                    baseSkills: edges.map((e: {node: any}) => e.node),
                })
            },
            error: (error: any) => console.log(error)
        })
    }, [])

    const searchSpaces = (name: string) => {
        if (name.length === 0) {
            setState({
                ...state,
                skills: state.baseSkills,
                customSkill: name
            })
        } else {
            setState({
                ...state,
                loading: true,
                customSkill: name
            })
            fetchQuery(
                graphql`
                    query SkillSelectorSearchQuery($query: String!) {
                        searchSkills: skills(first: 100, query: $query) {
                            edges {
                                node
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
                        skills: data.searchSkills.edges.map((e: any) => e.node),
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
            options={state.skills.filter(skill => !value.find(s => s === skill))}
            limit={limit}
            disabled={disabled}
            freeSolo
            getOptionLabel={(option) => option}
            value={value}
            fullWidth
            placeholder={props.placeholder ? props.placeholder : "Search for skills or add your own"}
            renderOption={skill => (
                <Typography style={{marginLeft: 5}}>{skill}</Typography>
            )}
            onChange={onChange}
            searchOptions={searchSpaces}
            textFieldProps={{
                variant,
            }}
        />
    )
}