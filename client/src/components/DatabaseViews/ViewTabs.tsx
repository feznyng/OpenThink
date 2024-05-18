import React, { useState } from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment, usePaginationFragment } from 'react-relay';
import { ViewTabsFragment$key } from './__generated__/ViewTabsFragment.graphql';
import GeneralTabs, { GeneralTabsProps } from '../Shared/GeneralTabs';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core';
import { Edit, Link, Settings } from '@material-ui/icons';

const tabOptions = [
    {
        name: 'Rename',
        icon: <Edit/>
    },
    {
        name: 'Edit view',
        icon: <Settings/>
    },
    {
        name: 'Copy link to view',
        icon: <Link/>
    },
]

interface ViewTabsProps {
    database: any,
    currView: string | null,
    changeView: (viewId: string) => void,
    onMenu?: (option: string) => void,
    tabProps?: Partial<GeneralTabsProps>
}

export default function ViewTabs({database, currView, onMenu, changeView, tabProps}: ViewTabsProps) {
    const { views } = useFragment<ViewTabsFragment$key>(
        graphql`
            fragment ViewTabsFragment on HasViews {
                views(first: 500) {
                    edges {
                        node {
                            name
                            viewId
                        }
                    }
                }
            }
        `,
        database
    )

    const tabs = views?.edges ? views.edges.map(edge => ({
        title: edge?.node?.name!!,
        value: edge?.node?.viewId!!.toString()!!,
    })) : []

    const [anchorEl, setAnchorEl] = useState<null | Element>()

    const openSettings = (e: React.MouseEvent) => {
        setAnchorEl(e.currentTarget)
    }

    return (
        <div>
            <GeneralTabs
                {...tabProps}
                tabs={tabs}
                onClick={(link, e) => currView === link ? (onMenu && openSettings(e)) : changeView(link)}
                selected={currView ? currView : ''}
                size={'small'}
                style={{marginTop: -1}}
            />
            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
            >
                {
                    tabOptions.map(({icon, name}) => (
                        <MenuItem
                            onClick={() => {
                                setAnchorEl(null)
                                onMenu && onMenu(name)
                            }}
                        >
                            <ListItemIcon>
                                {icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={name}
                            />
                        </MenuItem>
                    ))
                }
            </Menu>
        </div>
    )
}
