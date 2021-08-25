var timerRunning = false;
var isGameMaster = false;
var currentRole;


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

function setToPlayerView() {
    var chars = "abcd";

    var questionParagraph = document.getElementById("question");

    var questionDisplay = document.createElement("h2");
    questionDisplay.id = "questionDisplay";
    questionDisplay.innerHTML = "Question: Placeholder";
    questionParagraph.appendChild(questionDisplay);

    for(i=0; i<4; i++) {
        let choice = document.createElement("input");
        choice.id = "answer" + chars.charAt(i);
        choice.type = "radio";
        choice.name = "choices";
        questionParagraph.appendChild(choice);

        let label = document.createElement("label");
        label.for = choice.id;
        label.id = "question" + chars.charAt(i).toUpperCase();
        label.innerHTML = "placeholder";
        questionParagraph.appendChild(label);

        let br = document.createElement("br");
        questionParagraph.appendChild(br);
    }
}

function onConfirmSelectionClicked(){
    questions = document.getElementById('questions').children;
    for(i=0; i<questions.length; i++){
        if(questions[i].tagName == 'INPUT' && questions[i].checked){
            publishMessage(0, 'quiz/' + matchTopic + '/server', questions[i].value);
        }
    }
}

function setQuestions(question) {
    document.getElementById("questionDisplay").innerHTML = "Question: " + JSON.stringify(question.text);
    document.getElementById("questionA").innerHTML = "A: " + JSON.stringify(question.a);
    document.getElementById("questionB").innerHTML = "B: " + JSON.stringify(question.b);
    document.getElementById("questionC").innerHTML = "C: " + JSON.stringify(question.c);
    document.getElementById("questionD").innerHTML = "D: " + JSON.stringify(question.d);
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