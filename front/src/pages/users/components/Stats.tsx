import { useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { AxiosInstance, AxiosResponse } from "axios";
import { axiosToken } from "../../../api/axios";
import StatsData from "../../../interfaces/StatsData";
import "../styles/Stats.css";

const Stats = () => {
  const {userId} = useParams();
  
const [victory, setVictory] = useState(0);
const [defeat, setDefeat] = useState(0);
const [xp, setXp] = useState(0);
const [level, setLevel] = useState(0);
const axiosInstance = useRef<AxiosInstance | null>(null);
useEffect(() => {

    const initStats = async () => {
      try
      {
        axiosInstance.current = await axiosToken();
        let stats: AxiosResponse = await axiosInstance.current.get('/stats/' + userId);
        let statsData: StatsData = stats.data

        setVictory(statsData.victory);
        setDefeat(statsData.defeat);
        setXp(statsData.xp);
        setLevel(statsData.level);
      }
      catch (error: any)
      {
        console.log("error (init stats) : ", error);
      }
    }
    initStats();

}, [userId]);
return (
<div>
  <div id="stats">
    <table>
    <thead>
      <tr>
        <th colSpan={2} id="statsTitle">Stats</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>Victories</th>
        <td>{victory}</td>
      </tr>
      <tr>
        <th>Defeats</th>
        <td>{defeat}</td>
      </tr>
      <tr>
        <th scope="row">Level</th>
        <td>{level}</td>
      </tr>
      <tr>
        <th>Xp</th>
        <td>{xp}</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>
);
}

export default Stats;