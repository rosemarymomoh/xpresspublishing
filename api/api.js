const express = require('express');

//instance of an express router
const apiRouter = express.Router();
const artistsRouter = require('./artists.js');
const seriesRouter = require('./series.js');

apiRouter.use('/artists', artistsRouter);
apiRouter.use('/series', seriesRouter);


module.exports = apiRouter;
