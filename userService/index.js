const { json } = require('express'); // TODO: What is this?
const express = require('express');
const bodyParser = require('body-parser'); // TODO: stop using bodyparser
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const app= express();
const port = 3001;
const NodeCouchDb = require('node-couchdb');
const jwt = require('jsonwebtoken');

const cors = require('cors');

app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true
    })
);

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
    
    if(await getUserFromDB(req.body.userName) == null) {
        await addUser(req.body.userName, req.body.password);
        let user = await getUserFromDB(req.body.userName);
        let rand = require('crypto').randomBytes(64).toString('hex');
        let accessToken = jwt.sign(user, rand);
        res.json(accessToken);
    }
    else 
        res.json({answer:"userName taken"});
});
	 
app.post('/login', async (req,res) => { // TODO: Automatically redirect to 'register' if user doesn't exist
    // compare pwds: 
        console.log("new login request: " + JSON.stringify(req.body));
        if(!req.body.password || !req.body.userName) { // Check if correct JSON is sent
                res.json({answer:"unexpected body"});
                return;            
        }

        var user = await getUserFromDB(req.body.userName);

        if(user == null) { // Check if username exists
            res.json({response:"user doesn't exist"});
            return;
        }
        
        bcrypt.compare(req.body.password, user.password, function(err, result) {
            if(err) {
                console.log(result);
                res.json({response: "error"}); // TODO: make one central error return
            }
            else {
                if(result == true) {
                    var rand = require('crypto').randomBytes(64).toString('hex');
                    var accessToken = jwt.sign(user, rand);
                    res.json(accessToken);
                }
                else 
                    res.json({response: "wrong pw"});
            }
        });
});

async function getPasswordHash(password) {
    let salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

app.listen(port, () => {
    console.log('listening on port: ' + port);
})

async function getUserFromDB (userName) {
    let mangoQuery = { // TODO: Create Index
        selector: {
            "userName": {
                "$eq": JSON.stringify(userName)
            }
        }
    };

    var queryResult = await couch.mango("users", mangoQuery, {});

    if(queryResult.data.docs.length == 0) 
        return null;
    else
        return queryResult.data.docs[0];
}

async function addUser(userName, password) { // Create new user in DB
    var uuid = await couch.uniqid(); // yes, this could be done way easier 
    var salt = await bcrypt.genSalt(saltRounds);
    var hashedPw = await bcrypt.hash(password, salt);

    await couch.insert("users", {
        _id: uuid[0], // TODO: is ID necessary? 
        userName: JSON.stringify(userName),
        password: hashedPw
    })
}
