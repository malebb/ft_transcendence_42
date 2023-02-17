import { AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosToken } from '../api/axios';

type NeutralUser = {
  id: number
  createdAt: Date
  id42: string | null
  username: string
  profilePicture: string | undefined
}

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NeutralUser[]>([]);
  const [errMsg, setErrMsg] = useState('');

  const getUserProfile = async (): Promise<NeutralUser[]> => {
    try{
        const response: AxiosResponse = await (await axiosToken()).get('/users/get-all-user');
        return response.data;
    }
    catch(err:any){
        console.log('error getme');
        if (!err?.response)
        {
          setErrMsg('No Server Response');
        }else if (err.response?.status === 403)
        {
          setErrMsg('Invalid Credentials');
        }else{
          setErrMsg('Unauthorized');
        }
        return ([] as NeutralUser[]);
    }
  }

  const handleInputChange = async (event: any) => {
    const value = event.target.value;
    setQuery(value);
  
    const filteredData = (await getUserProfile()).filter((item) => {
        return value && item.username.toLowerCase().startsWith(value.toLowerCase());
    });

    setResults(filteredData);
  };

  return (
    <div>
      <div>
        <input type="text" value={query} onChange={handleInputChange} />
      </div>
      <div>
        <ul>
          {results.map((item) => (
            <li key={item.id}><Link to={'/user/' + item.id}>{item.username}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SearchBar