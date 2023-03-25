import Rooms from "./containers/Rooms";
import Headers from "src/components/Headers";
import Sidebar from "src/components/Sidebar";

const Chat = () => {
	return (
	<>
  			<Headers/>
  			<Sidebar/>
		<div id="chat">
			<Rooms/>
		</div>
	</>
  );
};

export default Chat;
