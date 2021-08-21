const { json } = require('express'); // TODO: What is this?
const express = require('express');
const bodyParser = require('body-parser'); // TODO: stop using bodyparser
const bcrypt = require('bcryptjs');
const app= express();
const port = 3001;
const NodeCouchDb = require('node-couchdb');

app.use(express.json());

const couch = new NodeCouchDb({ // See the default values at https://www.npmjs.com/package/node-couchdb
        auth: {
            user:'ibs',
            password: '1234'
        }
});

app.post('/register',  async (req,res) => { // TODO: You can also make (req,res) async. This might help in refactoring
    if(!req.body.userName || !req.body.password) { // Check if required fields are part of request
        res.json({answer:"unexpexted body"});
        return;
    }
    
    if(await checkIfUserNameExists(req.body.userName) == false) {
        addUser(req.body.userName, req.body.password);
        res.json({answer:"new username"});
        return;
    }
    else {
        res.json({answer:"user already exists"});
        return;            
    }
});
	 
app.post('/login', async (req,res) => { // TODO: Automatically redirect to 'register' if user doesn't exist
    // compare pwds: 
        if(!req.body.password || !req.body.userName) { // Check if correct JSON is sent
                res.json({answer:"unexpected body"});
                return;            
        }

        if(await checkIfUserNameExists(req.body.userName) == false) { // Check if username exists
            res.json({response:"user doesn't exist"});
            return;
        }
        
        var plaintextPw = JSON.stringify(req.body.password);
        //bcrypt.compare(plaintextPw, 
});

async function getPasswordHash(password) {
    let salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

app.listen(port, () => {
    console.log('listening on port: ' + port);
})

async function checkIfUserNameExists(userName) {
        let mangoQuery = { // TODO: Create Index
            selector: {
                "userName": {
                    "$eq": JSON.stringify(userName)
                }
            }
        };

        var queryResult = await couch.mango("users", mangoQuery, {});
        
        if(queryResult.data.docs.length == 0) 
            return false;
        else
            return true;
}

async function addUser(userName, password) { // Create new user in DB
    var uuid = await couch.uniqid(); // yes, this could be done way easier 
    var pwHash = await getPasswordHash(JSON.stringify(password));

    couch.insert("users", {
        _id: uuid[0],
        userName: JSON.stringify(userName),
        password: pwHash
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
