import { User, PenaltyType } from 'ft_transcendence';

export interface Penalty
{
	id: number;
	date: string;
	author: User;
	target: User;
	type: PenaltyType;
	durationInMin: number;
}

const oneSecondInMs = 1000;
const oneMinuteInMs = oneSecondInMs * 60;
const oneHourInMs = oneMinuteInMs * 60;
const oneDayInMs = oneHourInMs * 24;

export const formatRemainTime = (penalty: Penalty[]) =>
{
	const penaltyTimeInMin = penalty[0].durationInMin;
	const startPenaltyTime = new Date(penalty[0].date);
	const endPenaltyTime = new Date(startPenaltyTime.getTime() + penaltyTimeInMin * 60000)
	const currentTime = new Date(Date.now());
	const msToEnd  = endPenaltyTime.getTime() - currentTime.getTime();

	if (msToEnd < oneMinuteInMs)
	{
		return (Math.floor(msToEnd / oneSecondInMs) + ' second'
		+ ((Math.floor(msToEnd / oneSecondInMs) > 1) ? 's' : '') + ' left');
	}
	else if (msToEnd < oneHourInMs)
	{
		return (Math.floor(msToEnd / oneMinuteInMs) + ' minute'
		+ ((Math.floor(msToEnd / oneMinuteInMs) > 1) ? 's' : '') + ' left');
	}
	else if (msToEnd < oneDayInMs)
	{
		return (Math.floor(msToEnd / oneHourInMs) + ' hour'
		+ ((Math.floor(msToEnd / oneHourInMs) > 1) ? 's' : '') + ' left');
	}
	else
	{
		return (Math.floor(msToEnd / oneDayInMs) + ' day'
		+ ((Math.floor(msToEnd / oneDayInMs) > 1) ? 's' : '') + ' left');
	}
}

export const isPenaltyFinished = (penalty: Penalty[]) =>
{
	const penaltyTimeInMin = penalty[0].durationInMin;
	const startPenaltyTime = new Date(penalty[0].date);
	const endPenaltyTime = new Date(startPenaltyTime.getTime() + penaltyTimeInMin * 60000)
	const currentTime = new Date(Date.now());
	const msToEnd  = endPenaltyTime.getTime() - currentTime.getTime();

	if (msToEnd <= 0)
		return (true);
	return (false);
}
