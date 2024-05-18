import { Share, ShareOutlined } from '@material-ui/icons';
import React, { MouseEvent } from 'react';
import Button, { ButtonProps } from '../Shared/Button';

interface SubEntryButtonProps {
    numSubEntries: number | undefined,
    numSubEntriesCompleted?: number | undefined
    openSubEntries: (e: MouseEvent) => void,
}

export default function SubEntryButton({numSubEntries, openSubEntries, numSubEntriesCompleted, ...props}: SubEntryButtonProps & ButtonProps) {
  return (
    <Button
        {...props}
        size="small"
        onClick={openSubEntries}
        startIcon={<ShareOutlined fontSize="small" style={{transform: 'rotate(90deg)'}}/>}
        style={{marginLeft: 5, color: 'grey', ...props.style}}
    >
        {(numSubEntriesCompleted || numSubEntriesCompleted === 0) ? `${numSubEntriesCompleted} /` : ''} {numSubEntries ? numSubEntries : 0}
    </Button>
  )
}
