var client;
var userName;
var findGameButton;
var stopSearchingButton;
var joinMatchButton;
var searchStatus;

window.onload = async function() {
    userName = await authorize(); // TODO: Bad code

    if(!userName)
        return;
        
    document.getElementById('username').innerHTML = userName;

    init();

    findGameButton = document.getElementById("findGame");
    findGameButton.addEventListener("click", onFindMatchClicked);
    stopSearchingButton = document.getElementById("stopSearching");
    stopSearchingButton.addEventListener("click", onStopSearchingClicked);
    joinMatchButton = document.getElementById('joinMatch');
    joinMatchButton.addEventListener('click', onJoinMatchClicked);
    searchStatus = document.getElementById('status');
}

function onFindMatchClicked() {
    let message = new Paho.MQTT.Message("queueing " + userName);
    message.destinationName = "quiz/queue";
    client.send(message);
    searchStatus.innerHTML = "Searching for match...";
    findGameButton.style.visibility='hidden';
    stopSearchingButton.style.visibility="visible";
}

function onStopSearchingClicked() {
    searchStatus.innerHTML='';
    findGameButton.style.visibility="visible";
    stopSearchingButton.visibility="hidden";
    let message = new Paho.MQTT.Message("exiting " + userName);
    message.destinationName = "quiz/queue";
    client.send(message);
}

async function onJoinMatchClicked(){
    let message = new Paho.MQTT.Message("joining " + userName);
    message.destinationName = "quiz/queue";
    client.send(message);

    client.disconnect();
    document.location.href = "http://localhost:3000/game";
}

function init() {
    client = new Paho.MQTT.Client("localhost", 8080, "/mqtt/", "quizHubClient");
    client.onMessageArrived = onMessageArrived;

    client.connect(
        {onSuccess: onConnectionSuccess},
        {onFailure: onConnectionFailure}
    )
}

function onMessageArrived(msg) {
    console.log("received message: " + msg.payloadString);
   
    var playersInMatch = msg.payloadString.split(' ');
    for(i=0; i<playersInMatch.length; i++) {
        if(playersInMatch[i] == userName) {         
            console.log("found a match");
            searchStatus.innerHTML = "Found a match! Waiting for you to join..."
            stopSearchingButton.style.visibility='hidden';
            joinMatchButton.style.visibility='visible';
        }
    }
}

function onConnectionSuccess() {
    console.log("sucessfully connected");
    client.subscribe("quiz/availableMatches");
}

function onConnectionFailure(err) {
    console.log("connection failure: " + err);
    setTimeout(init, 2000);
}
