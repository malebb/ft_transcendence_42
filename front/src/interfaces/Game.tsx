import { ReceiptTwoTone } from '@mui/icons-material';
import { User } from 'ft_transcendence';

export default interface Game
{
	id: number;
	gameId: string;
	leftPlayer: User;
	rightPlayer: User;
}