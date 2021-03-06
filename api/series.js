const express = require('express');
const seriesRouter = express.Router();
const issuesRouter = require('./issues.js');

seriesRouter.use('/:seriesId/issues', issuesRouter);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get('SELECT * FROM Series WHERE Series.id = $seriesId', {
    $seriesId: seriesId
  }, (err, series) => {
    if(err){
      next(err);
    }else if(series){
      req.series = series;
      next();
    }else{
      res.sendStatus(404);
    }
  });
});



seriesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Series`, (err, series) => {
    if(err){
      next(err);
    } else{
      res.status(200).json({ series: series });
    }
  });

});

seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({series:req.series});
});


seriesRouter.post('/', (req,res, next) => {
  const seriesToAdd = req.body.series;

  const name = seriesToAdd.name,
        description = seriesToAdd.description;

  if(!seriesToAdd || !name || !description){
    res.sendStatus(400);
  }

  const sql = `INSERT INTO Series (name, description) VALUES ($name, $description)`;
  const values = {
    $name: name,
    $description: description
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`,
        (error, series) => {
          res.status(201).json({series: series});
        });
    }
  });

});

seriesRouter.put('/:seriesId', (req,res, next) => {
  const seriesToAdd = req.body.series;

  const name = seriesToAdd.name,
        description = seriesToAdd.description;

  if(!seriesToAdd || !name || !description){
    res.sendStatus(400);
  }

  const sql = `UPDATE Series SET name = $name, description = $description WHERE Series.id = $seriesId`;
  const values = {
    $name: name,
    $description: description,
    $seriesId: req.params.seriesId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`,
        (error, series) => {
          res.status(200).json({series: series});
        });
    }
  });

});

seriesRouter.delete('/:seriesId', (req, res, next) => {
  const getSQL = `SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`;
  const sql = `DELETE FROM Series WHERE Series.id = ${req.params.seriesId}`;
  db.get(getSQL, (error, row) => {
    if(error){
      next(error);
    }else if(row){
      res.sendStatus(400);
    }else{
      db.run(sql, function(error){
        if(error){
          next(error);
        }else{
          res.sendStatus(204);
        }
      });
    }
  });
});


module.exports = seriesRouter;
