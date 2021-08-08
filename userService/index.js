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

app.post('/register',  (req,res) => {
    data = req.body;

    if(data.userName && data.password) {
        let mangoQuery = { // TODO: Create Index
            selector: {
                "userName": {
                    "$eq": data.userName
                }
            }
        };

        couch.mango("users", mangoQuery, {}).then(({data, headers, status}) => {
            console.log("mango result: " + JSON.stringify(data));
            if(data.docs.length != 0) {
                res.json({answer:"userName already exists"});
                return;
            }
            else {
                res.json({answer:"new username"});
                return;
            }
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
        }, err => {
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
        
    console.log("recieved following data: " + JSON.stringify(data));
    addUser();
    //res.json({answer:"recieved register request"});
    //couch.createDatabase("test_database").then(() => {console.log("database created")}, err => {console.log("error: " + err)});
    //check if user already exists
});
	
app.listen(port, () => {
    console.log('listening on port: ' + port);
})

async function addUser() {
    let uuid = await couch.uniqid(); // yes, this could be done way easier 
    //console.log(uuid);
    couch.insert("test_database", {
        _id: uuid[0],
        field: ["sample", "data", true]
    }).then(({data, headers, status}) => {
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

async function checkIfUsernameExists(userName) {
    let mangoQuery = { // TODO: Create Index
        selector: {
            "userName": {
                "$eq": data.userName
            }
        }
    };

    couch.mango("users", mangoQuery, {}).then(({data, headers, status}) => {
        console.log("mango result: " + JSON.stringify(data));
        if(data.docs.length != 0) {
            return true;
        }
        else {
            return false;
        }
    // data is json response
    // headers is an object with all response headers
    // status is statusCode number
    }, err => {
    // either request error occured
    // ...or err.code=EDOCMISSING if document is missing
    // ...or err.code=EUNKNOWN if statusCode is unexpected
        console.log("mango error: " + err);
    });
}