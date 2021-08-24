// Datentypen für die Implementierung	
class Queue
{
    constructor()
    {
        this.items = [];
    }
                  
	enqueue(element)
	{	
		// adding element to the queue
		this.items.push(element);
	}

	dequeue()
	{
		if(this.isEmpty())
			return false;
		return this.items.shift();
	}

	isEmpty()
	{
		return this.items.length == 0;
	}
}

class SessionID
{
	constructor()
	{
		this.idQ = new Queue;
		for(let i=0; i<1000;i++){
				this.idQ.enqueue(i);
		}
	}
	
	getID(){
		return this.idQ.dequeue();	
	}	

	setID(id){
		this.idQ.enqueue(id);	
	}	
		
}


class Session
{
	constructor(sessionID, masterID, nickname, time, rounds, number, playercount)
	{
		this.sessionID = sessionID;
		this.players = [[masterID,nickname]];
		this.masterID = masterID;
		this.nickname = nickname;
		this.timeLimit = time;
		this.rounds = rounds;
		this.nbrQstRnd = number;
		this.playercount = playercount;
	}	
	
	addPlayer(nickname, playerID)
	{
		this.players.push([nickname, playerID]);
	}	
	 
	swapMaster(ID)
	{
		this.masterID = ID;
	}	

	slotOpen()
	{
		return this.players.length == this.playercount;
	}	



}

var mqtt = require("mqtt");

// cache für laufende Spiele: Positionen: Spieler --> Quizz Master --> Lobby voll
var cache = require('memory-cache');

// ids die für die laufenden Spiele vergeben werden und zur Kommunikation der mit den Clients dür jede Session genutzt werden.
var IDs = new SessionID();

// Queue für alle wartenden Spieler
var waitingRoom = [];
var timeOut = 300000;

var connectOptions = {
	host: "localhost",
	port: 8883,
	protocol: "mqtts",
};

function onMessage(topic, message) {
	var mode = topic.split("/")[1];
	switch(mode){
		case "LookingForGame":		
			JoinGame(message);	
			break;
		case "CreatingGame":
			CreateGame(message);
			break;
		
	}	
}



(async function main() {
	console.log("Go");
	client = mqtt.connect(connectOptions)
	.on("connect", function() {
		console.log("connected");
		client.on('message', onMessage);
		client.subscribe("ibsProjektQuizzApp/JoinGame");
		client.subscribe("ibsProjektQuizzApp/CreatingGame");
		}
	)
	
})();




function JoinGame(message){
	var msg = JSON.parse(message);
	var id = msg.id;
	if(waitingRoom.length==0){
		let res = {
			"id":msg.id,
			"nickname":msg.nickname,
			"time":msg.timeLimit,
			"rounds":msg.rounds,
			"number":msg.nbrQstRnd,
			"playercount":msg.playercount,
			"sessionID":"-"
		}
	} else {
		waitingRoom[0].addPlayer(msg.id, msg.nickname);	
		
	
	
	client.publish(ibsProjektQuizzApp/newSession/msg.id, JSON.stringify(res));
}


function CreatingGame(message){
	var msg = JSON.parse(message);
	let id  = IDs.getID
	if(id=="false"){
		res = {
			"id":msg.id,
			"nickname":msg.nickname,
			"time":msg.timeLimit,
			"rounds":msg.rounds,
			"number":msg.nbrQstRnd,
			"playercount":msg.playercount,
			"sessionID":"-"
		}	
	} else {
		let session = new Session(id, msg.id, msg.nickname, time, rounds, number, playercount);
		session.addPlayer(msg.nickname, msg.id);
		waitingRoom.push(session);
		res = {
			"id":msg.id,
			"nickname":msg.nickname,
			"time":msg.timeLimit,
			"rounds":msg.rounds,
			"number":msg.nbrQstRnd,
			"playercount":msg.playercount,
			"sessionID":id
		}	
	}	
	client.publish(ibsProjektQuizzApp/newSession/msg.id, JSON.stringify(res));
}	
	
