import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

export function SimpleDialog(props: any) {
    const { onClose, selectedValue, open, type} = props;
  
    const handleClose = () => {
      onClose(selectedValue);
    };
  
    const handleListItemClick = (value: string) => {
        onClose(value);
    };
  
    return (
      <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Set {type} image</DialogTitle>
        <Button onClick={() => handleListItemClick('remove')}>Remove Image</Button>
        <Button onClick={() => handleListItemClick('change')}>Change Image</Button>
        <Button onClick={() => handleListItemClick('close')}>Close</Button>
      </Dialog>
    );
}