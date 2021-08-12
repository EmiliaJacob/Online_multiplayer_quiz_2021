const express = require('express')
const app = express();
const port = 3000;

app.use('/static', express.static('public'));

app.set('view engine', 'pug');

app.get('/login', async (req,res) => {
    res.render('login');
})

app.get('/hub', async(req,res) => {
    res.render('hub');
})

app.get('/game', async(req,res) => {
    res.render('game');
})

app.get('/mqttTest', async(req,res) => {
    res.render('mqtt_test');
})

app.listen(port, () => {
    console.log('listening on port: ' + port);
});