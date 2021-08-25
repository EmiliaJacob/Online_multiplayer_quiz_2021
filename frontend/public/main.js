
window.onload = async function() { // Hub - perspective is loaded by default
    userName = await authorize(); 

    if(!userName)
        return;
        
    document.getElementById('username').innerHTML = userName;

    setupMQTT();

    document.getElementById('logout').addEventListener('click', logoutButton);
}

function logoutButton(){
    console.log('logout button pressed');
    let cookie = document.cookie;    
    document.cookie = cookie + '; expires=Thu, 18 Dec 2013 12:00:00 UTC';
    document.location.href = 'http://localhost:3000/login';
}

function setupMQTT() {
    client = new Paho.MQTT.Client("localhost", 8080, "/mqtt/", "quizHubClient");
    client.onMessageArrived = onMessageArrivedHub;

    client.connect(
        {onSuccess: onConnectionSuccess},
        {onFailure: onConnectionFailure}
    )
}

function onConnectionSuccess() {
    console.log("sucessfully connected");
    client.subscribe("quiz/joinGame/"+userName);
}

function onConnectionFailure(err) {
    console.log("connection failure: " + err);
    setTimeout(setupMQTT, 2000);
}

function onMessageArrivedHub(msg) {
    console.log("received message: " + msg.payloadString);

    var splittedMsg = msg.payloadString.split(' ');

    if(splittedMsg[0] == 'foundMatch') {
        matchTopic = splittedMsg[1]; 

        searchStatus.innerHTML = "Found a match! Waiting for you to join..."
        stopSearchingButton.style.visibility='hidden';
        joinMatchButton.style.visibility='visible';
    }
}