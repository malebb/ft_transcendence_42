import { useState, useEffect, useRef } from 'react';
import { AxiosInstance, AxiosResponse } from 'axios';
import { axiosToken } from '../../../api/axios';

type BlockButtonProps =
{
	userIdToBlock: number
}

const BlockButton = (props: BlockButtonProps) =>
{
	const [blockValue, setBlockValue] = useState('block');
	const axiosInstance = useRef<AxiosInstance | null>(null);

	useEffect(() =>
	{
	}, [])

	const handleBlock = async () =>
	{
		try
		{
			axiosInstance.current = await axiosToken()
			axiosInstance.current = await axiosInstance.current.patch('/users/block/' + props.userIdToBlock);
		}
		catch (error: any)
		{
			console.log('error (while blocking user)', error);
		}
	}
	return (<button onClick={handleBlock}>{blockValue}</button>);
}

export default BlockButton;
