import { Chip } from '@material-ui/core'
import React from 'react'
import { ItemSelectorProps } from '../../types/elements'
import SelectorInput from './SelectorInput'
import graphql from 'babel-plugin-relay/macro';
import { fetchQuery } from '../../utils/graphqlutils';
import Typography from './Typography';

interface CauseSelector {
    causes: string[],
    loading?: boolean,
    baseCauses: string[],
    focused: boolean,
    inputValue: string
}

export default function CauseSelector({showSuggestions, limit, value, onChange, variant, disabled, ...props}: ItemSelectorProps) {
    const [state, setState] = React.useState<CauseSelector>({
        causes: [],
        baseCauses: [],
        inputValue: '',
        focused: false
    })

    React.useEffect(() => {
        fetchQuery(
            graphql`
                query CauseSelectorInitialQuery {
                    causes(first: 20) {
                        edges {
                            node
                        }
                    }
                }
            `,
            {}
        ).subscribe({
            next: (data: any) => {
                const causes = data?.causes?.edges?.map((e: any) => e.node);
                setState({
                    ...state,
                    baseCauses: causes ? causes : [],
                    causes: causes ? causes : []
                })
            },
            error: (error: any) => console.log(error)
        })
    }, [])

    const searchCauses = (query: string) => {
        
    }

    return (
        <SelectorInput
            {...props}
            value={value}
            onChange={onChange}
            options={state.causes.filter(cause => !value.find(val => val === cause))}
            getOptionLabel={(val) => val}
            freeSolo
            renderOption={(value) => (
                <Typography>
                    {value}
                </Typography>
            )}
            variant={(variant ? variant : 'outlined' as any)}
            searchOptions={searchCauses}
            placeholder="Search for causes..."
        />
    )
}
