var passwordLabel;
var userNameLabel;

window.onload = function() {
    passwordLabel = document.getElementById('labelPassword');
    userNameLabel = document.getElementById('labelUsername');
    loginButton = document.getElementById('login')
    loginButton.addEventListener("click", login);
    registerButton = document.getElementById('register')
    registerButton.addEventListener("click", register);
}



async function login() {
    resetLabels();

    input = getInput();

    if(!input)
        return;

    var response = await fetch('http://localhost:3001/login', { // TODO: Add error handling
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: input.username,
            password: input.password
        })
    });

    var responseJson = await response.json();

    if(responseJson.response == "user doesn't exist") {
        userNameLabel.innerHTML = 'Username doesnt exist - please register';
        userNameLabel.style.color = '#ff0000';
    }
    else if(responseJson.response == "wrong pw") {
        passwordLabel.innerHTML = 'Password - Wrong Password';
        passwordLabel.style.color = '#ff0000';
    }
    else if(responseJson.response == 'success'){
        document.cookie = 'token=' + responseJson.token;
        document.location.href = "http://localhost:3000/game";
    }
}

async function register() {
    resetLabels();

    input = getInput();
    
    if(!input)
        return;

    var response = await fetch('http://localhost:3001/register', { // TODO: Add error handling
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: input.username,
            password: input.password
        })
    });

    var responseJson = await response.json();
    if(responseJson.response == "userName taken") {
        userNameLabel.innerHTML = 'Username - Username already taken'
        userNameLabel.style.color = '#ff0000';
    }
    else if(responseJson.response == 'success'){
        document.cookie = 'token=' + responseJson.token;
        document.location.href = "http://localhost:3000/game";
    }
}

function getInput(){
    var username = document.getElementById('inputUsername').value;
    var password = document.getElementById('inputPassword').value;


    if(username == '') {
        userNameLabel.innerHTML = "Username - please enter a value";
        userNameLabel.style.color = '#ff0000';
    }
    if(password == '') {
        passwordLabel.innerHTML = "Password - please enter a value";
        passwordLabel.style.color = '#ff0000';
    }
    if(password =='' || username =='')
        return false;

    return {username: username, password: password}
}

function resetLabels() {
    userNameLabel.innerHTML = 'Username';
    userNameLabel.style.color = '#000000';
    passwordLabel.innerHTML = 'Password';
    passwordLabel.style.color = '#000000';
}