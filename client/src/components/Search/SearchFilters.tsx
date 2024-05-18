import { Chip } from '@material-ui/core'
import React from 'react'

export type SearchTypeFilter = 'posts' | 'people' | 'groups' | 'projects' | 'all'

const typeFilters = ['All', 'Posts', 'People', 'Groups', 'Projects']

interface SearchResultsProps {
    onFilterChange: (filter: SearchTypeFilter) => void,
    selectedType: undefined | SearchTypeFilter
}

export default function SearchFilters({onFilterChange, selectedType}: SearchResultsProps) {

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            {
                typeFilters.map(type => {
                    const selected = selectedType === type.toLowerCase()
                    return (
                        <Chip
                            onClick={() => selected ? onFilterChange('all') : onFilterChange(type.toLowerCase() as SearchTypeFilter)}
                            variant={selected ? 'default' : 'outlined'}
                            color={selected ? 'primary' : 'default'}
                            label={type}
                            style={{marginRight: 10}}
                        />
                    )
                })
            }
        </div>
    )
}
