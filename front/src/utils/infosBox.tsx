import alertStyle from '../styles/alertBox.module.css';
import { confirmAlert } from 'react-confirm-alert';

export const printInfosBox = (infos: string) =>
{
	confirmAlert({
		customUI: ({ onClose }) =>
		{
			return (
				<div id={alertStyle.boxContainer} onClick={() => onClose()} style={{ width: 400 }}>
					<h2>{infos}</h2>
					<div id={alertStyle.alertBoxBtn}>
						<p>Click to continue</p>
					</div>
				</div>
			);
		},
		keyCodeForClose: [8, 32, 13]
	});
}
