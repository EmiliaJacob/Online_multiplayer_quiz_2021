var username;
var matchTopic;
var questions;

window.onload = async function() { // Hub - perspective is loaded by default
    username = await authorize(); 

    if(!username)
        return;
        
    document.getElementById('username').innerHTML = username;

    await setupMQTT();

    document.getElementById('logout').addEventListener('click', onLogoutClicked);
}

function onLogoutClicked(){
    console.log('logout button pressed');
    let cookie = document.cookie;    
    document.cookie = cookie + '; expires=Thu, 18 Dec 2013 12:00:00 UTC';
    document.location.href = 'http://localhost:3000/login';
}

function setupMQTT() {
    client = new Paho.MQTT.Client("localhost", 8080, "/mqtt/", "quizHubClient");

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

function onMessageArrived(msg) {
    console.log("received message: " + msg.payloadString);

    var splittedMsg = msg.payloadString.split(' ');

    if(splittedMsg[0] == 'foundMatch') {
        matchTopic = splittedMsg[1]; 

        searchStatus.innerHTML = "Found a match! Waiting for you to join ..."
        stopSearchingButton.style.visibility='hidden';
        joinMatchButton.style.visibility='visible';
    }
    
    if(splittedMsg[0] == 'gameStart') {
        searchStatus.innerHTML = 'Game starts ...';
        console.log('game starts');
    }

    if(splittedMsg[0] == 'questions') {
        questions = JSON.parse(splittedMsg[1]);
    }
}

async function switchToHub() {
    let result = await fetch('http://localhost:3000/hub');
    let hubViewHtml = await result.text();
    document.getElementById('view').innerHTML = hubViewHtml;

    findGameButton = document.getElementById("findGame");
    findGameButton.addEventListener("click", onFindMatchClicked);
    stopSearchingButton = document.getElementById("stopSearching");
    stopSearchingButton.addEventListener("click", onStopSearchingClicked);
    joinMatchButton = document.getElementById('joinMatch');
    joinMatchButton.addEventListener('click', onJoinMatchClicked);
    searchStatus = document.getElementById('status');

    subscribe('quiz/joinGame/' + username, ()=>{});
}

async function switchToGame() {
    //unsubscribe from previous topics
    //change the view to game
    //subscribe to new topics
    //set all callbacks and eventlisteners
}