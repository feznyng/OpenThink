import React from 'react'
import { TabOptionProps } from './TabOption'
import Measure from 'react-measure';
import { Badge, Button, Fade, IconButton } from '@material-ui/core';
import Typography from './Typography';
import { primaryColor } from '../../theme';
import { Variant } from '@material-ui/core/styles/createTypography';
import { Add } from '@material-ui/icons';

export interface TabObject {
    title: string,
    value: string,
    default?: boolean,
    badgeContent?: number
}

export interface GeneralTabsProps {
    tabs: TabObject[],
    onClick: (link: string, e: React.MouseEvent) => void,
    selected: string,
    center?: boolean,
    color?: string,
    style?: React.CSSProperties,
    tabProps?: Partial<TabOptionProps>,
    size?: 'small' | 'medium',
    onAdd?: () => void
}

interface GeneralTabsState {
    width: number | undefined,
    height: number | undefined;
    maxIndex: number;
    moreVisible: boolean;
    anchorEl: Element | null;
}

export default function GeneralTabs(props: GeneralTabsProps) {
    const {
        tabs,
        onClick,
        selected,
        center,
        color,
        style,
        tabProps,
        size,
        onAdd
    } = props;

    const [state, setState] = React.useState<GeneralTabsState>({
        width: 0,
        height: 0,
        maxIndex: tabs.length,
        moreVisible: false,
        anchorEl: null
    })

    const getTabWidth = (fullWidth: number) => {
        let maxIndex = -1;
        const tabMoreElement = document.getElementById('tab-option-more');
        let width = tabMoreElement?.offsetWidth ? tabMoreElement?.offsetWidth : 0;
        tabs.forEach((t, i) => {
            const tabElement = document.getElementById(`tab-item-${i}`);
            if ((fullWidth ? fullWidth : 0) <= width) {
            } else {
                maxIndex++;
            }
            width += tabElement?.offsetWidth ? tabElement?.offsetWidth : 0;
        });

        setState({
            ...state,
            maxIndex,
            moreVisible: maxIndex < (tabs.length - 1)
        })
    }

    let tabHeight = 55;
    let indicatorHeight = 5;
    let typographyVariant: Variant;
    if (size === 'small' || tabProps?.variant === 'small') {
        tabHeight = 30;
        indicatorHeight = 1;
        typographyVariant = 'subtitle2'
    }

    return (
        <Measure
            bounds
            onResize={contentRect => {
                getTabWidth(contentRect.bounds?.width ? contentRect.bounds?.width : 0);
            }}
        >
        {
            ({ measureRef }) => (
                <div style={{...style, width: '100%', display: 'flex', position: 'relative', justifyContent: center ? 'center' : ''}} ref={measureRef}>
                    {
                        tabs.map(({title, value, badgeContent}, i) => {
                            const more = state.moreVisible && (i === state.maxIndex - 1)
                            const selectedTab = more ? Boolean(tabs.slice(i, tabs.length).find(t => t.value === selected)) : (selected === value)
                            return (
                                <span id={`tab-item-${i}`} >
                                    <Button 
                                        onClick={(event) => more ? setState({...state, anchorEl: event.currentTarget}) : onClick(value, event)} 
                                        style={{color: (selectedTab ? (color ? color : primaryColor) : ''), height: tabHeight, textDecoration: 'none', textTransform: 'none', marginRight: 10, position: 'relative', ...style, padding: 0}} 
                                    >
                                        <Badge badgeContent={badgeContent} color="error">
                                            <Typography
                                                variant={typographyVariant}
                                            >
                                                {title} 
                                            </Typography>
                                        </Badge>
                                        {
                                            selectedTab &&
                                            <Fade in={true} timeout={300}>
                                                <div style={{width: '100%', borderStartStartRadius: 25, borderStartEndRadius: 25, position: 'absolute', left: 0, bottom: 0, backgroundColor: (color ? color : primaryColor), height: indicatorHeight}}/>
                                            </Fade>
                                        }
                                    </Button>
                                </span>
                            
                            )
                        })
                    }
                    {
                        onAdd && 
                        <IconButton
                            size="small"
                            style={{height: tabHeight, textDecoration: 'none', textTransform: 'none', position: 'relative', ...style}}
                        >
                            <Add fontSize='small'/>
                        </IconButton>
                    }
                    
                </div>
            )
        }
        </Measure>
        
    )
}
