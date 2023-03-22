import { useState, useEffect, useRef } from 'react';
import { AxiosInstance, AxiosResponse } from 'axios';
import { axiosToken } from '../../../api/axios';

type BlockButtonProps =
{
	userIdToBlock: number
}

const BlockButton = (props: BlockButtonProps) =>
{
	const [blocked, setBlocked] = useState<boolean>(false);
	const axiosInstance = useRef<AxiosInstance | null>(null);

	const updateBlockStatus = async () =>
	{
		axiosInstance.current = await axiosToken()
		const userBlockedResponse = await axiosInstance.current.get('/users/blocked/' + props.userIdToBlock);
		if (userBlockedResponse.data.blockedByYou.length)
			setBlocked(true);
		else
			setBlocked(false);
	}

	useEffect(() =>
	{
		updateBlockStatus();
	}, [])

	const handleBlock = async () =>
	{
		try
		{
			axiosInstance.current = await axiosToken()
			if (!blocked)
				axiosInstance.current = await axiosInstance.current.patch('/users/block/' + props.userIdToBlock);
			else
				axiosInstance.current = await axiosInstance.current.patch('/users/unblock/' + props.userIdToBlock);
			await updateBlockStatus();
		}
		catch (error: any)
		{
			console.log('error (while blocking user)', error);
		}
	}
	return (<button onClick={handleBlock}>{blocked ? 'unblock' : 'block'} </button>);
}

export default BlockButton;
