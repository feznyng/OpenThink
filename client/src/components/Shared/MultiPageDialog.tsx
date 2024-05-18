import { DialogActions, DialogContent, DialogContentProps, DialogProps, DialogTitle } from '@material-ui/core'
import React, { ReactElement } from 'react'
import CancelButton from './CancelButton'
import Dialog from './Dialog'
import NavButton from './NavButton'
import Typography from './Typography'


interface MultiPageDialogProps {
    title?: string | ReactElement,
    pages: ReactElement[],
    completeButton: ReactElement,
    preservePageState?: boolean,
    contentProps?: DialogContentProps,
    leftActionItems?: ReactElement,
    onPageChange?: (index: number) => void,
    nextDisabled?: boolean
}

export default function MultiPageDialog({title, onPageChange, nextDisabled, completeButton, leftActionItems, contentProps, preservePageState, pages, ...props}: MultiPageDialogProps & DialogProps) {
    const {onClose} = props;
    const [state, setState] = React.useState({
        pageIndex: 0,
    })

    const nextPage = () => {
        const pageIndex = state.pageIndex + 1;
        onPageChange && onPageChange(pageIndex)
        setState({
            ...state,
            pageIndex
        })
    }

    const prevPage = () => {
        const pageIndex = state.pageIndex - 1;
        onPageChange && onPageChange(pageIndex)
        setState({
            ...state,
            pageIndex
        })
    }

    return (
        <Dialog
            {...props}
        >
            {
                title && 
                <DialogTitle>
                    {title}
                </DialogTitle>
            }
            
            <DialogContent
                {...contentProps}
            >
                {
                    preservePageState ? 
                    <div>
                        {
                            pages.map((page, i: number) => (
                                <div
                                    style={{display: state.pageIndex === i ? 'block' : 'none'}}
                                >
                                    {page}
                                </div>
                                
                            ))
                        }
                    </div>
                    :
                    <div>
                        {
                            pages
                            .filter((_, i) => state.pageIndex === i)
                            .map((page) => (
                                page
                            ))
                        }
                    </div>
                }
            </DialogContent>
            <DialogActions
                style={{position: 'relative'}}
            >
                <div style={{position: 'absolute', left: 25, top: 0, height: '100%', display: 'flex', alignItems: 'center'}}>
                    <div>
                        {leftActionItems}
                    </div>
                </div>
                <div style={{marginRight: 15}}>
                    {
                        state.pageIndex === 0 &&
                        <CancelButton
                            onClick={(e: any) => onClose && onClose(e, 'escapeKeyDown')}
                            style={{marginRight: 10}}
                        />
                    }
                    {
                        state.pageIndex > 0 && 
                        <NavButton
                            back
                            onClick={prevPage}
                            style={{marginRight: 10}}
                        />
                    }
                    {
                        state.pageIndex < pages.length - 1 && 
                        <NavButton
                            onClick={nextPage}
                            disabled={nextDisabled}
                        />
                    }
                    {
                        state.pageIndex === pages.length - 1 && completeButton
                    }
                </div>
            </DialogActions>
        </Dialog>
    )
}
