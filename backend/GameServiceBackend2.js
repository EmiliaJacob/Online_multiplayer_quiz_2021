var mqtt = require("mqtt");

var questions;
// cache für laufende Spiele: Positionen: Spieler --> Quizz Master --> Lobby voll
var matchmaking = new Matchmaking();
var sHandler = new sessionHandler();

var gameStartText = "game is starting";


var topicNameGame = "ibsProjektQuizzApp";
var topicJoinGame = "JoinGame";
var topicNewGame = "NewGame";
var topicAcceptGame = "AcceptGame";
var topicPlayGame = "PlayGame";


var timeOut = 300000;
var gameStartDelay = 1;

var connectOptions = {
	host: "localhost",
	port: 1883,
	protocol: "mqtt",
};

const fetch = require('node-fetch');

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
		this.state = 1;
		this.master = 0;
		this.players = players;
		this.playersAnswersRight = [];
		this.playersAnsweredYet = [];
		this.playersAnswersThisRound = [];
		this.roundSolution = 0;
		this.questionSend = false;
		this.playersReady = [];
		this.timeLimit = time;
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
	
	resetreadySessionStart()
	{
		this.playersReady.forEach(element => element=false);
	}
	
	arePlayersReady()
	{
		for(var r in playersReady) {
			if(r==false) return false;	
		return true;
		}
	}	
	
	changeQuizzMaster()
	{
		this.master+=1;
		this.master%=3;
	}
	
	handleAnswer(answer, player)
	{
		for(let i=0; i<this.players.length; i++){
			if(this.players[i]==player && this.playersAnsweredYet[i]==false){
				this.playersAnswersThisRound[i] = answer;
				this.playersAnsweredYet[i] = true;
				break;
			}	
		}	
	}	
	
	sendQuestion(qID)
	{
		for(let i=0; i<questions.length; i++){
			if(questions[i].uid == qID){
				for(let j=0; j<this.playersAnswersThisRound.length; j++){
					this.playersAnswersThisRound[j] = "-"
					this.playersAnsweredYet[j] = false; 
				}	
				
				let res = questions[i];
				client.publish(topicNameGame + "/" + topicPlayGame + "/" + this.sID, JSON.stringify(res));
				setTimeout(evalQuestion ,this.timeLimit * 1000);
				return;
			}	
		}	
	}		
	
	evalQuestion()
	{
		for(let i=0; i<this.players.length; i++){
			if(this.playersAnswersThisRound[i] == this.roundSolution){
				this.playersAnswersRight[i] += 1;
			}	
		}	
		this.state += 1;
		if(this.state>this.nbrQstRnd * this.players.length){
			
			//Muss noch ausformuliert werden
			sessionEnd();
		}	
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
		session.resetreadySessionStart();
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
	
	handleAnswer(answer, player, sID)
	{
		var session = this.cache.get(sID);
		session.handleAnswer(answer, player);
	}	
	
	sendQuestion(qID, sID)
	{
		var session = this.cache.get(sID);
		if(session.questionSend==false)
			session.sendQuestion(qID);	
		session.questionSend = true;	
	}	
	
}	


//interpretiet alle Anfragen der Clients
function onMessage(topic, message) {
	var msg = JSON.parse(message);
	var mode = topic.split("/")[1];
	switch(mode){
		case "JoinGame":		
			JoinGame(msg,matchmaking,sessionHandler);	
			break;
		case topicAcceptGame:
			readySessionStart();
		case topicPlayGame:
			if(topic.split("/")[1]==topicPlayGame && msg.type == "question" ){
				sessionHandler.sendQuestion(msg.id, msg.sID);
			}
			else if(topic.split("/")[1]==topicPlayGame && msg.type == "answer"){
				sessionHandler.setAnswer(msg.answer, msg.player, msg.sID);
			}	
			
			
	}	
}
//Funktion die einen Spieler in die Warteschlange einreiht und ggf. ein neues Spiel erzeugt 
function JoinGame(message, matchmaking, sessionHandler){
	var msg = JSON.parse(message);
	var res = null;
	console.log(msg);
	var id = msg.id;
	let r = matchmaking.addPlayer(msg.player, msg.time, msg.rounds, msg.number);
	if(r==null){
		res = {
			"sID":"-"	
		}
		client.publish(topicJoinGame, JSON.stringify(res));	
	} else {
		var session = sHandler.createNewGame(r, msg.time, msg.rounds, msg.number);
		res = {
			"players":r,
			"sID":session.sID
		}
		client.subscribe(topicNameGame + "/" + topicJoinGame + "/" + session.sID);
		for(let i=0; i<session.players.length; i++){
			client.publish(topicNameGame + "/" + topicNewGame + "/" + session.players[i],JSON.stringify(res));			
		}	
	}	
}

function readySessionStart(sessionHandler, msg){
	var session = sessionHandler.getSession(msg.sessionID);
	if(session != null && session.arePlayersReady()){
		startSession(session);
	}	
}

function startSession(session){
	client.subscribe(topicNameGame + topicPlayGame + "/" + session.sID)	
	let pos = Math.floor(Math.random() * session.players.length);
	session.master = pos;
	msg = {
		res:gameStartText,
		master:pos
	}		
	client.publish(topicNameGame + "/" + topicPlayGame, msg);
}	



function getQuestions(questions){
	//fetch("http://ibs:1234@localhost:5984/database_quizzapp_questions\_all_docs")
	fetch('http://localhost:5984')
	.then(res => console.log())
	.catch(err => console.log(err))
	//questions = await fetched.json();	
	//console.log(questions);
}




(async function main(questions) {
	console.log("Go");
	client = mqtt.connect(connectOptions)
	.on("connect", function() {
		console.log("connected");
		client.on('message', onMessage);
		client.subscribe("ibsProjektQuizzApp/JoinGame/+");
		client.subscribe("ibsProjektQuizzApp/CreatingGame/+");
		}
	)
	getQuestions(questions);
	
})();


	
