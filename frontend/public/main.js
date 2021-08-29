var username;
var matchTopic;
var matchServerTopic;
var questions;
var client;

var dummyQuestions = [
    {id:"x", text:'??', a:2,b:3,c:4,d:5},
    {id:"y", text:'bomboclaat?', a:6,b:7,b:8,d:9}
];

window.onload = async function() { // Hub - perspective is loaded by default
    username = await authorize(); 

    if(!username)
        return;
        
    document.getElementById('username').innerHTML = username;

    await setupMQTT();

    document.getElementById('logout').addEventListener('click', onLogoutClicked);
}

function onLogoutClicked(){ 
    let cookie = document.cookie;    
    document.cookie = cookie + '; expires=Thu, 18 Dec 2013 12:00:00 UTC';
    document.location.href = 'http://localhost:3000/login';
}

function setupMQTT() {
    client = new Paho.MQTT.Client("localhost", 8080, "/mqtt/", username);

    client.connect(
        {onSuccess: onConnectionSuccess},
        {onFailure: onConnectionFailure}
    )
}

function onConnectionSuccess() {
    console.log("sucessfully connected");
    client.onMessageArrived = onMessageArrived;
    switchToHub();
}

function onConnectionFailure(err) {
    console.log("connection failure: " + err);
    setTimeout(setupMQTT, 2000);
}

async function onMessageArrived(msg) {
    console.log("received message: " + msg.payloadString);

    var message = JSON.parse(msg.payloadString);

    if(message.command == 'foundMatch') {
        matchTopic = 'quiz/' + message.content;
        matchServerTopic = 'quiz/'+ message.content + '/server'; 

        searchStatus.innerHTML = "Found a match! Waiting for you to join ..."
        findMatchButton.style.visibility='hidden';
        stopSearchingButton.style.visibility='hidden';
        joinMatchButton.style.visibility='visible';
    }
    
    if(message.command == 'gameStart') {
        searchStatus.innerHTML = 'Game starts ...';
        console.log('game starts');
    }

    if(message.command == 'questions') {
        questions = message.content.questions;
        console.log("recieved questions: " + JSON.stringify(questions));
        publishMessage(0, matchServerTopic, 'questionsRecieved', username);
    }

    if(message.command == 'setGameMaster') { 
        if(message.content == username) {
            isGameMaster = true;
            await switchToGameMaster();
            displayQuestionsGameMaster();
            publishMessage(0, matchServerTopic , 'roleSet' , username);

        }
        else {
            isGameMaster = false;
            await switchToPlayer();
            publishMessage(0, matchServerTopic, 'roleSet' , username);
        }
    }

    if(message.command == 'newRound') {
        roundCounter += 1;
        document.getElementById('countdown').innerHTML = '';
        document.getElementById('roundCounter').innerHTML = 'Round: ' + roundCounter.toString();
        if(isGameMaster) {
            enableQuestionSelectionGameMaster();
        }
        else {

        }
    }

    if(message.command == 'selectedQuestion') {
        if(isGameMaster)
            return;

        displayQuestionsPlayer(message.content);
        publishMessage(0, matchServerTopic , 'receivedSelectedQuestion' , username);
    }

    if(message.command == 'startRound') {
        startCountdown(countdownTime);
    }

    if(message.command == 'end') {
        let result = await fetch('http://localhost:3000/results');
        let hubViewHtml = await result.text();
        document.getElementById('view').innerHTML = hubViewHtml;

        createRankingList(message.content);

            //document.getElementById('backToHub').addEventListener('click', switchToHub);
        unsubscribe(matchTopic, () =>{
            document.getElementById('backToHub').addEventListener('click', switchToHub);
        });
    }

    if(message.command == 'error') {
        unsubscribe(matchTopic, switchToHub);
    }
}
