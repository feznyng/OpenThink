import React, { CSSProperties } from 'react'
import { useHistory, useLocation } from 'react-router'
import { queryString } from '../../utils/urlutils'
import CauseSelector from '../Shared/CauseSelector'
import SpaceAccessSelect from '../Space/SpaceAccessSelect'

interface SpaceFiltersProps {
    style?: CSSProperties
}

export default function SpaceFilters({style}: SpaceFiltersProps) {
    const { search } = useLocation()
    const params = queryString.parse(search)
    const causes = params?.causes ? JSON.parse(params.causes as string) : []
    const access = params?.access ? params.access as any : 'Open'
    const history = useHistory()

    const onCausesChange = (causes: string[]) => {
        history.replace(history.location.pathname + `?causes=${JSON.stringify(causes)}`)
    }

    const onAccessChange = () => {

    }

    return (
        <div style={style}>
            
        </div>
    )
}
