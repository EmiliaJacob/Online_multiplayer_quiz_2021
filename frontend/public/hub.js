var findMatchButton;
var stopSearchingButton;
var joinMatchButton;
var searchStatus;

async function switchToHub() {
    document.getElementById('countdown').innerHTML = '';
    document.getElementById('roundCounter').innerHTML = '';

    let result = await fetch('http://localhost:3000/hub');
    let hubViewHtml = await result.text();
    document.getElementById('view').innerHTML = hubViewHtml;

    findMatchButton = document.getElementById("findGame");
    findMatchButton.addEventListener("click", onFindMatchClicked);
    stopSearchingButton = document.getElementById("stopSearching");
    stopSearchingButton.addEventListener("click", onStopSearchingClicked);
    joinMatchButton = document.getElementById('joinMatch');
    joinMatchButton.addEventListener('click', onJoinMatchClicked);
    searchStatus = document.getElementById('status');

    subscribe('quiz/joinGame/' + username, ()=>{});
}

function onFindMatchClicked() {
    publishMessage(0,'quiz/queue', 'queueing' , username);
    searchStatus.innerHTML = 'Searching for match...';
    findMatchButton.style.visibility = 'hidden';
    stopSearchingButton.style.visibility = 'visible';
}

function onStopSearchingClicked() {
    searchStatus.innerHTML = '';
    findMatchButton.style.visibility = 'visible';
    stopSearchingButton.style.visibility = 'hidden';
    publishMessage(0,'quiz/queue', 'exiting' , username);
}

async function onJoinMatchClicked(){
    unsubscribe('quiz/joinGame/' + username, () => {});
    console.log('joining: ' + matchServerTopic);
    subscribe(matchTopic, async () => {
        publishMessage(0, matchServerTopic , 'joining' , username);
        searchStatus.innerHTML = 'Waiting for the other player to join ...'
        joinMatchButton.style.visibility= 'hidden';
    });
}