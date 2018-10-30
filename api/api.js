const express = require('express');

//instance of an express router
const apiRouter = express.Router();
const artistsRouter = require('./artists.js');

apiRouter.use('/artists', artistsRouter);




module.exports = apiRouter;
