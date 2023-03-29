import Canvas from '../home/components/Canvas';
import Headers from "../../components/Headers";
import Sidebar from "../../components/Sidebar";

const Challenge = () =>
{
	return (
	<>
      <Headers />
        <Sidebar />
		<div style={{marginTop: 110}}>
			<Canvas/>
		</div>
	</>
	);
}

export default Challenge;
