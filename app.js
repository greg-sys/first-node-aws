const express = require('express');
const app = express();

const astroapi = require ('./astroapi');
const home = require('./home');

app.use('/api/astro', astroapi); // use router for /api/astro path
app.use('/', home); // use router for home path

const port = process.env.port || 3000;

app.listen(port, () => {
    console.log("Listening on port " + port);
});

