const app = require('express')();
const port = 3000;

app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log('listening on port: ' + port);
});