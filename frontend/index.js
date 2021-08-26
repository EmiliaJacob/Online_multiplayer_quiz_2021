const express = require('express')
const app = express();
const port = 3000;

app.use('/static', express.static('public'));
app.use(express.json());

app.set('view engine', 'pug');

app.listen(port, () => {
    console.log('listening on port: ' + port);
});

app.get('/login', async (req,res) => {
    res.render('login');
})

app.get('/game', async(req,res) => {
    //res.render('hub');
    res.render('main');
})

app.get('/hub', async(req,res) => {
    //res.render('hub');
    res.render('hub');
})

app.get('/player', (req,res) => {
   res.render('player');
});

app.get('/gameMaster', (req, res) => {
   res.render('gameMaster');
});

app.get('/results', (req,res) => {
    res.render('results');
});