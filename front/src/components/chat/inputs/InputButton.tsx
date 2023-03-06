import React from "react";
import styles from "./InputButton.module.css";

const InputButton = (props: InputButtonProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(event);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.sendInput}>
      <input name="messageInput" {...props?.inputProps} autoComplete="off" autoFocus/>
      <button {...props?.buttonProps} type="submit">{props.buttonText}</button>
    </form>
  );
};

interface InputButtonProps {
  inputProps?: object;
  buttonText: string;
  buttonProps?: object;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default InputButton;
