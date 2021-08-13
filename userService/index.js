const { json } = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const app= express();
const port = 3001;
const NodeCouchDb = require('node-couchdb');

app.use(express.json());

const couch = new NodeCouchDb({ // See the default values at https://www.npmjs.com/package/node-couchdb
        auth: {
            user:'admin',
            password: 'password'
        }
});

app.post('/register',  (req,res) => { // TODO: You can also make (req,res) async. This might help in refactoring
    var userInfo = req.body;

    if(userInfo.userName && userInfo.password) { // Check if required fields are part of request
        let mangoQuery = { // TODO: Create Index
            selector: {
                "userName": {
                    "$eq": userInfo.userName
                }
            }
        };

        couch.mango("users", mangoQuery, {}).then(({data, headers, status}) => 
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
       // }
        testing({data, headers, status}, userInfo, res) // Ik this is bad code 
        , err => {
        // either request error occured
        // ...or err.code=EDOCMISSING if document is missing
        // ...or err.code=EUNKNOWN if statusCode is unexpected
            console.log("mango error: " + err);
        });
    }
    else {
        res.json({answer:"data has wrong format"});
        return;
    }
        
    console.log("recieved following data: " + JSON.stringify(userInfo));
    //res.json({answer:"recieved register request"});
    //couch.createDatabase("test_database").then(() => {console.log("database created")}, err => {console.log("error: " + err)});
    //check if user already exists
});
	 
app.post('/login', (req,res) => { // TODO: Automatically redirect to 'register' if user doesn't exist

})

function testing({data, headers, status}, userInfo, res) {
    if(data.docs.length == 0) { // Check if username already exists
        res.json({answer:"userName already exists"});
        return;
    }
    else {
        addUser(userInfo.userName, userInfo.password);
        res.json({answer:"new username"});
        return;
    }
}

app.listen(port, () => {
    console.log('listening on port: ' + port);
})

async function addUser(userName, password) { // Create new user in DB
    let uuid = await couch.uniqid(); // yes, this could be done way easier 
    couch.insert("users", {
        _id: uuid[0],
        userName: JSON.stringify(userName),
        password: JSON.stringify(password)
    }).then(({data, headers, status}) => {
        console.log("input: " + JSON.stringify(userName)+" "+JSON.stringify(password));
        console.log("sucessfully created a new user: " + JSON.stringify(data));
       // console.log(JSON.stringify(data));
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
    }, err => {
        //console.log("error: " + err);
        // either request error occured
        // ...or err.code=EDOCCONFLICT if document with the same id already exists
    });
}