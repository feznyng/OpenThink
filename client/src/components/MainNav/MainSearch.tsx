import { CardActions, ClickAwayListener, Divider, IconButton, InputAdornment, Popover, Popper } from '@material-ui/core'
import { Search } from '@material-ui/icons'
import React, { ChangeEvent, CSSProperties, Fragment, KeyboardEvent, Suspense, useState } from 'react'
import { useAppSelector } from '../../Store'
import { fetchQuery } from '../../utils/graphqlutils'
import { Anchor } from '../Post/PostContentEditor'
import Button from '../Shared/Button'
import TextField from '../Shared/TextField'
import graphql from 'babel-plugin-relay/macro';
import AutosearchResults from '../MainNav/AutosearchResults'
import { CircularProgress } from '@mui/material'
import { useHistory } from 'react-router'
import Searchbar from '../Search/Searchbar'

const popoverWidth = 450

interface MainSearchProps {
    style?: CSSProperties
}

interface MainSearchState {
    query: string,
    anchorEl: Anchor,
}

export default function MainSearch({...props}: MainSearchProps) {
    const [state, setState] = useState<MainSearchState>({
        query: '',
        anchorEl: null,
    })
    const history = useHistory()

    const mobile = useAppSelector(state => state.uiActions.mobile)

    if (mobile) {
        return (
            <div {...props}>
                <IconButton>
                    <Search/>
                </IconButton>
            </div>
        )
    }

    return (
        <div {...props}>
            <Searchbar
                onQueryChange={(e: any) =>  {
                    setState({
                        ...state,
                        query: e.target.value,
                        anchorEl: e.currentTarget
                    })
                }}
                onClick={(e) => setState({
                    ...state,
                    anchorEl: e.currentTarget
                })}
                onSearch={() => history.push(`/search/all?query=${state.query}`)}
                results={
                    <AutosearchResults
                        query={state.query}
                        closeResults={() => setState({...state, anchorEl: null})}
                    />
                }
                anchorEl={state.anchorEl}
            />
        </div>
    )
}
