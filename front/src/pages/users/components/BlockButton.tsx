import { useState, useEffect, useRef } from 'react';
import { AxiosInstance, AxiosResponse } from 'axios';
import { axiosToken } from '../../../api/axios';
import '../../../styles/BlockButton.css';

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
		if (userBlockedResponse.data.length)
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
	return (<button style={{backgroundColor: blocked ? "#c07622" : "#BE3A3A"}} onClick={handleBlock} className="btn">{blocked ? 'Unblock' : 'Block'} </button>);
}

export default BlockButton;
