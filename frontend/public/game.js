var timerRunning = false;
var isGameMaster = false;
var roundCounter = 0;
var countdownTime = 10;

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
    document.getElementById('playerTitle').innerHTML = 'Time to showcase your knowledge:';

    var questionDiv = document.getElementById('question');

    for(i=0; i<questions.length; i++){
        var question = questions[i];

        if(question.id == questionId) {

            document.getElementById('questionDisplay').innerHTML = question.text;

            for(var k in question) {
                let key = k;

                if(key == 'id' || key == 'text')
                    continue;
                
                let choice = document.createElement("input");
                choice.id = key;
                choice.value = key;
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
                countdownVisualisation.innerHTML = 'Time left to answer to question: ' + countdownTime.toString();
                countdownTime -= 1;
            }
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
    document.getElementById('confirmSelection').disabled = true;
    document.getElementById('gameMasterTitle').innerHTML = 'Please wait for the other players to answer you question';
}

function enableQuestionSelectionGameMaster() {
    document.getElementById('confirmSelection').disabled = false;
    document.getElementById('gameMasterTitle').innerHTML = 'You are now Game-Master please select a question:';
}

function roundOver() {
    var choices = document.getElementById('question').children;
    for(i=0; i<choices.length; i++){
        if(choices[i].tagName == 'INPUT' && choices[i].checked){
            publishMessage(0, matchServerTopic, 'answer', JSON.stringify({userName:username, answer:choices[i].value}));
        }
    }
    document.getElementById('playerTitle').innerHTML = 'Please wait for the Quizmaster to select the next question';
    document.getElementById('questionDisplay').innerHTML = '';
    document.getElementById('question').innerHTML = '';
}