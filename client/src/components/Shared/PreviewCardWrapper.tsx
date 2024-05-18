import { makeStyles, Menu, Popover, PopoverProps } from '@material-ui/core';
import React, { CSSProperties, Suspense } from 'react'


const useStyles = makeStyles(theme => ({
    popover: {
      pointerEvents: "none"
    },
    popoverContent: {
      pointerEvents: "auto"
    }
}));

let openDelay: any;
let closeDelay: any;

export interface PreviewCardWrapperProps {
    children: React.ReactElement | React.ReactElement[],
    variant?: 'hover' | 'click',
    previewCard: React.ReactElement,
    fallback: React.ReactElement,
    disabled?: boolean,
    delay?: number,
    onClose?: (onClose: () => void) => void,
    style?: CSSProperties
}

export default function PreviewCardWrapper({children, onClose, delay, previewCard, style, variant, fallback, disabled, ...props}: Partial<PopoverProps> & PreviewCardWrapperProps) {
    const classes = useStyles();
    const popoverAnchor = React.useRef();
    const [state, setState] = React.useState<{
        hover: boolean,
        previewAnchor: null | Element,
        anchorDelay?: null | ReturnType<typeof setTimeout>
        hideDelay?: null | ReturnType<typeof setTimeout>
    }>({
        hover: false,
        previewAnchor: null
    })

    delay = delay ? delay : 500

    const type = variant ? variant : 'hover';

    const [showPreview, setShowPreview] = React.useState(false);
    const onMouseEnter = (e: React.MouseEvent) => {
        openDelay = setTimeout(() => {
            setShowPreview(true);
        }, delay)
        clearTimeout(closeDelay)
        setState({...state, hover: true, previewAnchor: e.currentTarget});
    }

    const onMouseLeave = () => {
        closeDelay = setTimeout(() => {
            setShowPreview(false);
        }, delay)

        clearTimeout(openDelay)
        setState({...state, hover: true, previewAnchor: null, anchorDelay: null});
    }

    const onClick = (e: React.MouseEvent) => {
        setShowPreview(true);
        setState({
            ...state,
            previewAnchor: e.currentTarget
        });
    }

    React.useEffect(() => {
        onClose && onClose(onMouseLeave)
    }, [])

    if (type === 'hover') {
        return (
            <div style={style}>
                <span
                    ref={popoverAnchor as any}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {children}
                </span>
                {
                    !disabled && 
                    <Popover
                        className={classes.popover}
                        classes={{
                            paper: classes.popoverContent,
                        }}
                        anchorEl={popoverAnchor.current}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        {...props}
                        open={!!state.previewAnchor && showPreview}
                        PaperProps={{onMouseEnter, onMouseLeave}}
                    >
                        <Suspense
                            fallback={fallback}
                        >
                            {previewCard}
                        </Suspense>
                    </Popover>
                }
            </div>
        )
    } else {
        return (
            (
                <div
                    style={{position: 'relative'}}
                >
                    <div
                        onClick={(e) => onClick(e)}
                    >
                        {children}
                    </div>
                    {
                        !disabled && 
                        <Menu
                            open={!!state.previewAnchor}
                            anchorEl={state.previewAnchor}
                            onClose={() => setState({...state, previewAnchor: null})}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <Suspense
                                fallback={<div/>}
                            >
                                {previewCard}
                            </Suspense>
                        </Menu>
                    }
                    
                </div>
            )
        )
    }

    
}
