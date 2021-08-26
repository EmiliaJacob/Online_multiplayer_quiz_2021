var timerRunning = false;
var isGameMaster = false;

async function switchToGameMaster() {
    let result = await fetch('http://localhost:3000/gameMaster');
    let gameMasterView = await result.text();
    document.getElementById('view').innerHTML = gameMasterView;
}

function displayQuestionsGameMaster() {
    var questionDiv = document.getElementById('questions');

    for(i=0; i<questions.length; i++) {
        console.log(JSON.stringify(questions[i]));
        let question = questions[i];

        let selection = document.createElement("input");
        selection.id = question.id;
        selection.value = question.id;
        selection.type = "radio";
        selection.name = "choices";

        if(i==0)
            selection.checked = true;

        questionDiv.appendChild(selection);
        
        var questionString = '  ' + question.text + ":<br>";
        for(var k in question) {
            let key = k;

            if(key == 'id' || key == 'text')
                continue;
            
            questionString += '•  ' + question[key] + '<br>';
        }

        let label = document.createElement("label");
        label.for = selection.id;
        label.innerHTML = questionString;
        questionDiv.appendChild(label);
        questionDiv.appendChild(document.createElement('br'));
    }

    document.getElementById('confirmSelection').addEventListener('click', onConfirmSelectionClicked);
}

async function switchToPlayer() {
    let result = await fetch('http://localhost:3000/player');
    let hubViewHtml = await result.text();
    document.getElementById('view').innerHTML = hubViewHtml;
}

function displayQuestionsPlayer(questionId) {
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
}

function onConfirmSelectionClicked(){
    questions = document.getElementById('questions').children;
    for(i=0; i<questions.length; i++){
        if(questions[i].tagName == 'INPUT' && questions[i].checked){
            publishMessage(0, matchServerTopic, 'questionSelected', questions[i].value);
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

    publishMessage(0, matchServerTopic, "client x answered: " + answer);
}