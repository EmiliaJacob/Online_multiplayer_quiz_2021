var timerRunning = false;
var isGameMaster = false;

async function switchToGameMaster() {
    let result = await fetch('http://localhost:3000/gameMaster');
    let gameMasterView = await result.text();
    document.getElementById('view').innerHTML = gameMasterView;

    var questionDiv = document.getElementById('questions');

    for(i=0; i<dummyQuestions.length; i++) {
        console.log(JSON.stringify(dummyQuestions[i]));
        let question = JSON.stringify(dummyQuestions[i]);

        let selection = document.createElement("input");
        selection.id = i;
        selection.type = "radio";
        selection.name = "choices";
        selection.value = question;
        questionDiv.appendChild(selection);

        let label = document.createElement("label");
        label.for = selection.id;
        label.innerHTML = question;
        questionDiv.appendChild(label);
        questionDiv.appendChild(document.createElement('br'));
    }

    document.getElementById('0').checked = true;
    document.getElementById('confirmSelection').addEventListener('click', onConfirmSelectionClicked);
}

async function switchToPlayer() {
    let result = await fetch('http://localhost:3000/player');
    let hubViewHtml = await result.text();
    document.getElementById('view').innerHTML = hubViewHtml;
}

function displayQuestion(questionId) {
    var questionDiv = document.getElementById('question');

    for(i=0; i<dummyQuestions.length; i++){
        var question = dummyQuestions[i];

        if(question.id == questionId) {

            document.getElementById('questionDisplay').innerHTML = question.text;

            for(var k in question) {
                let key = k;

                if(key == 'id' || key == 'text')
                    continue;
                
                let choice = document.createElement("input");
                choice.id = key;
                choice.type = "radio";
                choice.name = "choices";
                questionDiv.appendChild(choice);

                if(key=='a')
                    choice.checked = true;

                let label = document.createElement("label");
                label.for = choice.id;
                label.innerHTML = key + ': ' + question[key];
                questionDiv.appendChild(label);

                let br = document.createElement("br");
                questionDiv.appendChild(br);
            }
        }
    }
}

function startCountdown(countdownTime) {
    if(!timerRunning) {
        var countdownVisualisation = document.getElementById("countdown");
        var intervalId = setInterval(secondExpired, 1000);
        timerRunning = true;

        function secondExpired() {
            if(countdownTime < 0) {
                clearInterval(intervalId);
                timerRunning = false;
                if(!isGameMaster)
                    roundOver();
                countdownVisualisation.innerHTML = "Round over";
            } 
            else {
                countdownVisualisation.innerHTML = countdownTime.toString();
                countdownTime -= 1;
            }
        }
    }
}


function onMessageArrivedHub(msg) {
    console.log("received message: " + msg.destinationName);
    if(msg.destinationName == "quiz/match/timer") {
        let convertedMsg = parseInt(msg.payloadString);
        if(convertedMsg) {
            console.log("starting timer");
            startCountdown(convertedMsg);
        }
    }

    if(msg.destinationName == "quiz/match/questions") {
        var questions = null;

        try {
            questions = JSON.parse(msg.payloadString);
        } catch (err) {
            console.log("payload is no proper JSON");
            console.log(msg.payloadString);
        }

        if(questions) 
            setQuestions(questions);
    }

    if(msg.destinationName == "quiz/match/roles") {
        if(msg.payloadString == "player"){ // TODO: Add check for username so that you know what role is yours
            setToPlayerView();
            subscribe("quiz/match/players", () => {
                publishMessage(0, "quiz/match/status", "sucessfully subscribed to players");
            })
        }
        if(msg.payloadString == "gameMaster") {
            setToGameMasterView();
            subscribe("quiz/match/gameMaster", () => {
                publishMessage(0, "quiz/match/status", "sucessfully subscribed to gameMaster");
            })
        }
    }
}

function onConfirmSelectionClicked(){
    questions = document.getElementById('questions').children;
    for(i=0; i<questions.length; i++){
        if(questions[i].tagName == 'INPUT' && questions[i].checked){
            publishMessage(0, 'quiz/' + matchServerTopic + '/server', questions[i].value);
        }
    }
}


function roundOver() {
    console.log("round over");

    var answer = "none";
    if(document.getElementById("answerA").checked) {
        answer = "a";
    } else if (document.getElementById("answerB").checked) {
        answer = "b"
    } else if (document.getElementById("answerC").checked) {
        answer = "c"
    } else if (document.getElementById("answerD").checked) {
        answer = "d"
    }

    publishMessage(0, "quiz/match", "client x answered: " + answer);
}