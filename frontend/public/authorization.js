async function checkToken(tokenCookie) {
    let response = await fetch('http://localhost:3001/checkToken' , {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + tokenCookie
        }
    });

    let responseJson = await response.json();
    return responseJson.response;
}

async function authorize() {
    var tokenFromCookie = document.cookie.split('=')[1];

    if(!tokenFromCookie) {
        document.location.href = "http://localhost:3000/login";
        return false;
    }
    
    let response = await fetch('http://localhost:3001/checkToken' , {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + tokenFromCookie
        }
    });

    let responseJson = await response.json();

    if(responseJson.response != 'authorized') {
        document.location.href = "http://localhost:3000/login";
        return false;
    }

    usernameString = JSON.stringify(responseJson.user.userName);
    username = usernameString.substring(3, usernameString.length - 3); // IDK why this is neccessary
    return username;
}