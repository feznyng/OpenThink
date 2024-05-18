import { Done } from '@material-ui/icons';
import React, { CSSProperties } from 'react';
import Button, {ButtonProps} from '../Shared/Button';
import { completeColor } from '../../constants';

interface CompleteButtonBaseProps {
    onClick: () => void,
    completed: boolean,
}

export default function CompleteButtonBase({onClick, completed, ...props}: Partial<ButtonProps> & CompleteButtonBaseProps) {
  return (
    <Button
      {...props}
      startIcon={<Done/>}
      size="small"
      disableElevation
      style={{...props.style, backgroundColor: completed ? completeColor : undefined, color: completed ? 'white' : undefined}}
      variant={completed ? 'contained' : 'outlined'}
      onClick={onClick}
    >
        {completed ? 'Completed' : 'Complete'}
    </Button>
  )
}