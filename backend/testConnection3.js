var mqtt = require("mqtt");
var topicJoinGame = "ibsProjektQuizzApp/JoinGame";
var topicNewGame = "ibsProjektQuizzApp/NewGame";

var connectOptions = {
	host: "localhost",
	port: 1883,
	protocol: "mqtt",
}

var msg1 = {
	"player":"cd", 
	"time":3,
	"rounds":3, 
	"number":3
}	


function onMessage(topic, message) {
	console.log(JSON.parse(message));	
}


(async function main() {
	console.log("Go");
	client = mqtt.connect(connectOptions)
	.on("connect", function() {
		console.log("connected");
		client.on('message', onMessage);
		client.publish(topicJoinGame + "/" + msg1.player, JSON.stringify(msg1));	
		client.subscribe(topicNewGame + "/" + msg1.player);		
		console.log(msg1);
		}
	)
	
})();