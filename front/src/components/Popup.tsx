import React from "react";
import "../styles/Popup.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Button,
  Modal,
  ModalTitle,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "react-bootstrap/";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    <Modal show={apparent}>
      <ModalHeader>
        <ModalTitle>
          <FontAwesomeIcon
            className="svg-definecolor"
            icon={faTriangleExclamation}
          />
          {title}
          <FontAwesomeIcon
            className="svg-definecolor"
            icon={faTriangleExclamation}
          />
        </ModalTitle>
      </ModalHeader>
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button onClick={handleTrue}>Yes</Button>
        <Button className="btn-no" onClick={handleFalse}>
          No
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default Popup;
