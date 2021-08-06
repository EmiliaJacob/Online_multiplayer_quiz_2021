function startCountdown() {
    var countdownTime = 10;
    var countdownVisualisation = document.getElementById("countdown");

    var intervalId = setInterval(secondExpired, 1000);
    function secondExpired() {
        if(countdownTime < 0) {
            clearInterval(intervalId);
            countdownVisualisation.innerHTML = "Round over";
        } 
        else {
            countdownVisualisation.innerHTML = countdownTime.toString();
            countdownTime -= 1;
        }
    }
}