import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import "../styles/Popup.css";

const Popup = ({
  apparent,
  title,
  content,
  handleTrue,
  handleFalse,
}: {
  apparent: boolean;
  title: string;
  content: string;
  handleTrue: any;
  handleFalse: any;
}) => {
  return (
    <Dialog
      open={apparent}
      onClose={handleFalse}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleFalse}>No</Button>
        <Button onClick={handleTrue}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
    // <p className={apparent ? "" : "hiden"}>hello</p>
  );
};

export default Popup;
