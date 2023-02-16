import React, { useRef } from 'react';

import styles from "./InputButton.module.css"

const InputButton = (props:InputButtonProps) => {

	const inputRef = useRef<any>();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		props.onSubmit(event);
		inputRef.current.value = "";
	}

	return (
		<form onSubmit={handleSubmit} className={styles.sendInput}>
			<input
				{...props?.inputProps}
				ref={inputRef}
			/>
			<button {...props?.buttonProps}>{props.buttonText}</button>
		</form>
	)
}

interface InputButtonProps {
	inputProps?: object;
	buttonText: string;
	buttonProps?: object;
	// onSubmit(event: React.FormEvent<HTMLFormElement>): void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

}

export default InputButton;