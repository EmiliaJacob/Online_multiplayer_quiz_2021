const express = require('express')
const app = express();
const port = 3000;

app.use('/static', express.static('public'));
app.use(express.json());

app.set('view engine', 'pug');

app.get('/login', async (req,res) => {
    res.render('login');
})

app.get('/game', async(req,res) => {
    res.render('hub');
})

app.get('/test', async(req,res) => {
    if(req.body.matchTopic)
        console.log(req.body.matchTopic);
    res.render('game', {hello:"World"});
});

app.listen(port, () => {
    console.log('listening on port: ' + port);
});
