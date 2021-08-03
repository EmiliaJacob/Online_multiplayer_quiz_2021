// Datentypen für die Implementierung	

//Hilfsklasse implementiert Warteschlange
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


//implementiert ID Management für die Klassen
class sID
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

//alle Informationen über eine Session werden gespeichert
class Session
{
	constructor(sID, players, time, rounds, number)
	{
		this.sID = sID;
		this.state = 0;
		this.master = 0;
		this.players = players;
		this.playersAnswersRight = [];
		this.playersAnswersRound = [];
		this.playersReady = [];
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
	
	resetReadyCheck()
	{
		this.playersReady.forEach(element => element=false);
	}
	
	arePlayersReady()
	{
		this.playersReady.forEach(element => if(element==false) return false);
		return true;
	}	
	
	changeQuizzMaster()
	{
		this.master+=1;
		this.master%=3;
	}
		
	

}

//kümmert sich um das Matchmaking
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

//organisiert alle Sessions
class sessionHandler
{
	constructor(cache)
	{		
		this.cache = require("memory-cache");
		this.IDs = new sID();
	}	
	
	createNewGame(players, time, rounds, number)
	{
		var sID = this.IDs.getID();	
		var playerAnswers = [];
		var session = new Session(sID , players, time, rounds, number); 
		session.resetReadyCheck();
		this.cache.put(sID, session);
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
var sHandler = new sessionHandler();

var topicjoinGame = "ibsProjektQuizzApp/joinGame";
var topicNewGame = "ibsProjektQuizzApp/NewGame";
var topicPlayGame = "ibsProjektQuizzApp/PlayGame";
// Queue für alle wartenden Spieler
var timeOut = 300000;

var connectOptions = {
	host: "localhost",
	port: 1883,
	protocol: "mqtt",
};

//interpretiet alle Anfragen der Clients
function onMessage(topic, message) {
	var mode = topic.split("/")[1];
	console.log("yes");
	switch(mode){
		case "joinGame":		
			joinGame(message,matchmaking,sessionHandler);	
			break;
		case "RdyNxtQst":
			readyCheck(message);
			break;
		
	}	
}
//Funktion die einen Spieler in die Warteschlange einreiht und ggf. ein neues Spiel erzeugt 
function joinGame(message, matchmaking, sessionHandler){
	var msg = JSON.parse(message);
	var res = null;
	console.log(msg);
	var id = msg.id;
	let r = matchmaking.addPlayer(msg.player, msg.time, msg.rounds, msg.number);
	if(r==null){
		res = {
			"sID":"-"	
		}
		client.publish(topicjoinGame, JSON.stringify(res));	
	} else {
		var session = sHandler.createNewGame(r, msg.time, msg.rounds, msg.number);
		res = {
			"players":r,
			"sID":session.sID
		}
		console.log(res);	
		client.subscribe(topicjoinGame + "/" + session.sID);
		for(let i=0; i<session.players.length; i++){
			client.publish(topicNewGame + "/" + session.players[i],JSON.stringify(res));			
		}	
	}	
}

function readyCheck(sessionHandler, message){
	var msg = JSON.parse(message);
	var session = sessionHandler.getSession(msg.sessionID);
	if(session.arePlayersReady())
		sendNewQuestion(msg.sessionID);
	
}

function sendNewQuestion(){
		
	
	
}	





(async function main() {
	console.log("Go");
	client = mqtt.connect(connectOptions)
	.on("connect", function() {
		console.log("connected");
		client.on('message', onMessage);
		client.subscribe("ibsProjektQuizzApp/joinGame/+");
		client.subscribe("ibsProjektQuizzApp/CreatingGame/+");
		}
	)
	
})();


	
