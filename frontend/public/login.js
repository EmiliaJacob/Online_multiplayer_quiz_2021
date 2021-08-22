var submitButton;

window.onload = function() {
    submitButton = document.getElementById('submitButton')
    submitButton.addEventListener("click", login);
}



async function login() {
    var response = await fetch('http://localhost:3001/login', { // TODO: Add error handling
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: "Hiee",
            password: "jfslkfdj"
        })
    });

    var responseJson = await response.json();
    if(responseJson.response == "user doesn't exist") {
        var header = document.getElementById('header');
        header.innerHTML = "Please register";
        submitButton.innerHTML = "Register";
        submitButton.removeEventListener("click", login);
        submitButton.addEventListener("click", register);
    }
    else {
        console.log(responseJson);
    }
}

async function register() {
    var response = await fetch('http://localhost:3001/register', { // TODO: Add error handling
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: "Hiee",
            password: "jfslkfdj"
        })
    });

    var responseJson = await response.json();
    if(responseJson.response == "userName taken") {
        console.log("userName already taken");
    }
    else {
        console.log(responseJson);
    }
}