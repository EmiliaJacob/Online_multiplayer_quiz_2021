window.onload = function() {
  const startButton = document.getElementById("submitButton");

  if(startButton) {
   submitButton.addEventListener("click", (event) => {
       document.getElementById("countdown").innerHTML = "STARTED";
   });
  }
}