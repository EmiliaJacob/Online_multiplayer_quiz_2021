const mqtt = require("mqtt");
const http = require('http');

// Datentypen für die Implementierung	

//Hilfsklasse implementiert Warteschlange

//implementiert ID Management für die Klassen
class sID
{
	constructor()
	{
		this.idQ = []
		for(let i=0; i<1000;i++){
				this.idQ.push(i);
		}
	}
	
	getID(){
		return this.idQ.shift();	
	}	

	setID(id){
		this.idQ.push(id);	
	}	
		
}


//kümmert sich um das Matchmaking
class Matchmaking
{
	constructor()
	{
		this.playerQ = [];
	}
	
	addPlayer(id)
	{
		this.playerQ.push(id);
		if(this.playerQ.length>=3){
			return [this.playerQ.shift(), this.playerQ.shift(), this.playerQ.shift()];				
		}
		return null;
			
	}

	leaveQueue(id)
	{
		let pid = this.playerQ.indexOf(id);
		if(id!=-1)
			this.playerQ.splice(pid, 1);
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
		this.playersAnswersRight = new Array(this.players.length);
		this.playersAnsweredYet = new Array(this.players.length);
		this.playersAnswers = new Array(this.players.length);
		this.roundSolution = 0;
		this.questionSend = false;
		this.playersReady = new Array(this.players.length);
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
	
	setPlayerReady(ready, pid){
	if(ready==false)		
		return;
	let index = this.players.indexOf(pid);
	if(index!=-1)
		this.playersReady[index] = true;
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
				this.playersAnsweredYet[i] = true;
				if(everyoneAnswered()==true && this.state > this.nbrQstRnd * this.players.length){
					//Auswertung der Ergebnisse 
					
					
				} else if(this.playerAnswers[i].length == 0){
					let a = new Array(1);
					a[0] = answer;
					this.playerAnswers[i] = a;
						
				} else {
					this.playerAnswers[i].push(answer);
				}	
				if(answer == this.roundSolution)
					this.playersAnswersRight[i] += 1;
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
				setTimeout(answerTimer(this.sID) ,this.timeLimit * 1000);
				return;
			}	
		}	
	}		
	
	answerTimer(sID){
		res = {
			"over":true	
		}	
		client.publish(topicNewGame + "/" + topicPlayGame + "/" + sID, JSON.stringify(res));
		this.state += 1;

	}	

	everyoneAnswered(){
		for(var r in this.playersAnsweredYet) {
			if(r==false) return false;	
			return true;
		}
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
	
	sendQuestion(qID, sID, master)
	{
		var session = this.cache.get(sID);
		if(session.questionSend==false && master == session.master)
			session.sendQuestion(qID);	
		session.questionSend = true;	
	}	
	
}	


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
	protocol: "mqtt"
};





//interpretiet alle Anfragen der Clients
function onMessage(topic, message) {
	console.log("message");
	var msg = JSON.parse(message);
	var mode = topic.split("/")[1];
	switch(mode){
		case "JoinGame":
			if(msg.type == "join")
				joinQueue(msg, matchmaking, sessionHandler);	
			else if(topic.split("/")[1]==topicPlayGame && msg.type == "ready"){
				readySession();
			}	
			else{
				matchmaking.leaveQueue(msg.player);
			}	
			break;
		case topicPlayGame:
			if(msg.type == "question" ){
				sessionHandler.sendQuestion(msg.question, msg.sID, msg.master);
			}
			else if(msg.type == "answer"){
				sessionHandler.handleAnswer(msg.answer, msg.player, msg.sID);
			}
			break;
			
	}	
}

//Funktion die einen Spieler in die Warteschlange einreiht und ggf. ein neues Spiel erzeugt 
function joinQueue(msg, matchmaking, sessionHandler){
	console.log("hey");
	var res = null;
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
		for(let i=0; i<session.players.length; i++){
			client.publish(topicNameGame + "/" + topicJoinGame + "/" + session.players[i],JSON.stringify(res));			
		}	
	}	
}


function readySession(sessionHandler, msg){
	var session = sessionHandler.getSession(msg.sessionID);
	if(session != null && session.arePlayersReady()){
		startSession(session);
	}else if(msg.content == true){
		session.setPlayerReady(true, msg.player);
	}	
}

function startSession(session){
	client.subscribe(topicNameGame + topicPlayGame + "/" + session.sID);	
	let pos = Math.floor(Math.random() * session.players.length);
	session.master = pos;
	res = {
		type:"start",
		content:pos
	}		
	client.publish(topicNameGame + "/" + topicPlayGame, msg);
}	

function endSession(session){
	


}	




function getQuestions(questions){

	http.get('http://localhost:5984', (resp) => {
	let data = '';

		// A chunk of data has been received.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		  // The whole response has been received. Print out the result.
		  resp.on('end', () => {
			console.log(JSON.parse(data).explanation);
		  });

		}).on("error", (err) => {
		  console.log("Error: " + err.message);
	});
	
	
	
}


(async function main(questions) {
	console.log("Go");
	client = mqtt.connect(connectOptions)
	.on("connect", function() {
		console.log("connected");
		client.on('message', onMessage);
		client.subscribe("ibsProjektQuizzApp/JoinGame");
		client.subscribe("ibsProjektQuizzApp/CreatingGame");
		}
	)
	//getQuestions(questions);
	
})();


	
