import { CardActions, ClickAwayListener, Divider, IconButton, InputAdornment, Paper, Popover, Popper } from '@material-ui/core'
import { Search } from '@material-ui/icons'
import React, { ChangeEvent, CSSProperties, Fragment, KeyboardEvent, ReactElement, Suspense, useRef, useState } from 'react'
import { useAppSelector } from '../../Store'
import { fetchQuery } from '../../utils/graphqlutils'
import { Anchor } from '../Post/PostContentEditor'
import Button from '../Shared/Button'
import TextField from '../Shared/TextField'
import graphql from 'babel-plugin-relay/macro';
import AutosearchResults from '../MainNav/AutosearchResults'
import { CircularProgress } from '@mui/material'
import { useHistory } from 'react-router'

const popoverWidth = 450

interface SearchbarProps {
    style?: CSSProperties,
    results: ReactElement,
    onSearch: () => void,
    onQueryChange: (e: ChangeEvent) => void,
    anchorEl: Anchor,
    onClick: (e: any) => void
}

export default function Searchbar({results, onSearch, anchorEl, onQueryChange, onClick, ...props}: SearchbarProps) { 
    const [away, setAway] = useState(true)

    const mobile = useAppSelector(state => state.uiActions.mobile)
    const ref = useRef<HTMLInputElement>()

    const closeResults = () => setAway(true)

    const searchQuery = () => {
        closeResults()
        onSearch()
    }

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
            <TextField
                placeholder="Search"
                size="small"
                InputProps={{
                    startAdornment: <Search style={{paddingRight: 5}}/>,
                    style: {borderRadius: 25}
                }}
                style={{width: away ? 150 : 300}}
                onFocus={() => {
                    setAway(false)
                }}
                onBlur={() => {
                    setAway(true)
                }}
                onChange={onQueryChange}
                onKeyPress={({key}) => key === 'Enter' && searchQuery()}
                onClick={onClick}
                ref={ref as any}
            />
            <Popper
                open={!!anchorEl && !away}
                anchorEl={anchorEl}
                onMouseDown={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    setTimeout(() => {
                        ref.current?.blur()
                    }, 100)
                }}
            >
                <Paper>
                    <div style={{width: popoverWidth, height: 500, overflow: 'auto'}}>
                        <Suspense
                            fallback={(
                                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                                    <CircularProgress/>
                                </div>
                            )}
                        >
                            {results}
                        </Suspense>
                        
                    </div>
                    <CardActions style={{padding: 0}}>
                        <Button
                            fullWidth
                            onClick={searchQuery}
                            style={{borderRadius: 0}}
                        >
                            See all
                        </Button>
                    </CardActions>
                </Paper>
            </Popper>
        </div>
    )
}
