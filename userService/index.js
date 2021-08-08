const express = require('express')
const app = express();
const port = 3001;
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({ // See the default values at https://www.npmjs.com/package/node-couchdb
        auth: {
            user:'admin',
            password: 'password'
        }
});

app.post('/register', (req,res) => {
    res.json({answer:"recieved register request"});
    couch.createDatabase("test_database").then(() => {console.log("database created")}, err => {console.log("error: " + err)});
    //check if user already exists

})
	
app.listen(port, () => {
    console.log('listening on port: ' + port);
})