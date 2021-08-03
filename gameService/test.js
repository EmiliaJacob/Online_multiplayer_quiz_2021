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
	
	hasLength()
	{
		return this.items.length;	
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
	constructor(sessionID, players, playerAnswers, time, rounds, number)
	{
		this.sessionID = sessionID;
		this.players = players;
		this.playerAnswers = playerAnswers;
		this.timeLimit = time;
		this.rounds = rounds;
		this.nbrQstRnd = number;
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

class Matchmaking
{
	constructor()
	{
		this.playerQ = new Queue();
	}
	
	addPlayer(id)
	{
		this.id = id;	
		this.playerQ.enqueue(id);
		if(this.playerQ.hasLength()>=3){
			return [this.playerQ.dequeue(), this.playerQ.dequeue(), this.playerQ.dequeue()];				
		}
		return null;
			
	}	
		
	
}	


class sessionHandler
{
	constructor(cache)
	{		
		this.cache = require("memory-cache");
		this.IDs = new SessionID();
	}	
	
	createNewGame(players, time, rounds, number);
	{
		var sID = this.IDs.getID();	
		var playerAnswers = [];
		let session = new Session(sID , players, playerAnswers, time, rounds, number); 
		cache.put(sID, session);
		return session;
	}

	deleteGame(id)
	{
		return this.cache.del(id);
	}

	getSession(id)
	{	
		return this.cache.get(id);
	}	
	
	setSession(id, session)
	{
		return this.cache.put(id, session);
	}	
	
}	


var mqtt = require("mqtt");

// cache für laufende Spiele: Positionen: Spieler --> Quizz Master --> Lobby voll
var matchmaking = new Matchmaking();
var sessionHandler = new sessionHandler();

var topicJoinGame = "ibsProjektQuizzApp/JoinGame";
// Queue für alle wartenden Spieler
var timeOut = 300000;

var connectOptions = {
	host: "localhost",
	port: 8883,
	protocol: "mqtts",
};

function onMessage(topic, message) {
	var mode = topic.split("/")[1];
	switch(mode){
		case "JoinGame":		
			JoinGame(message);	
			break;
		
	}	
}

function JoinGame(message, matchmaking, sessionHandler){
	var msg = JSON.parse(message);
	var id = msg.id;
	let r = matchmaking.addPlayer(msg.players, msg.time, msg.rounds, msg.number);
	if(r==null){
		let res = {
			"sessionID":"-"	
		}		
	} else {
		let session = sessionHandler.createNewGame(msg.players, msg.time, msg.rounds, msg.number);
		let res = {
			"players":msg.players,
			"sessionID":session.sID
		}	
	}	
	client.publish(topicJoinGame, JSON.stringify(res));
	client.subscribe(topicPlayGame + "/" + session.sID);
}




