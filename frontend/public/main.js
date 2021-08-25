var username;

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
    switchToHub();
}

function onConnectionFailure(err) {
    console.log("connection failure: " + err);
    setTimeout(setupMQTT, 2000);
}

function publishMessage(qos, destination, payload) {
    try {
        let message = new Paho.MQTT.Message(payload);
        message.destinationName = destination;
        message.qos = qos;
        client.send(message)
    } catch  {
        console.log("client is not connected");
    }
}

function subscribe(topic, onSuccess) {
    client.subscribe(topic, {
        onSuccess: onSuccess,
        onFailure: function(err) {
            console.log("Couldn't subscribe to topic: " + JSON.stringify(err.errorMessage));
            setTimeout(2000, subscribe(topic, onSuccess));
        }
    });
}

function unsubscribe(topic, onSuccess) {
    client.unsubscribe(topic, {
        onSuccess: onSuccess,
        onFailure: function(err) {
            console.log("Couldn't subscribe to topic: " + JSON.stringify(err.errorMessage));
            setTimeout(2000, subscribe(topic, onSuccess));
        }
    });
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

    client.onMessageArrived = onMessageArrivedHub;
    subscribe('quiz/joinGame/' + username, ()=>{});
}

async function switchToGame() {
    //unsubscribe from previous topics
    unsubscribe('quiz/joinGame/' + username, () => {});
    //change the view to game
    //subscribe to new topics
    //set all callbacks and eventlisteners
}