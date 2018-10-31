const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(`SELECT * FROM Issue WHERE id = ${issueId}`,(error, row)=> {
    if(error){
      next(error);
    }else if(row){
      req.issue = row;
      next()
    }else{
      res.sendStatus(404);
    }
  } );
});


issuesRouter.get('/', (req,res, next) => {
  const seriesId = req.params.seriesId;
  const sql = `SELECT * FROM Issue WHERE series_id = $seriesId`;
  const values = {$seriesId: seriesId};
  db.all(sql, values, (error, rows) =>{
     if(error){
       next(error);
     }else{
       res.status(200).json({issues: rows});
     }
  });
});


issuesRouter.post('/', (req,res, next) => {
  const issueToAdd = req.body.issue;

  const name = issueToAdd.name,
        issueNumber = issueToAdd.issueNumber,
        publicationDate = issueToAdd.publicationDate,
        artistId = issueToAdd.artistId;
        seriesId = issueToAdd.seriesId;

  if(!issueToAdd || !name || !issueNumber || !publicationDate || !artistId){
    res.sendStatus(400);
  }

  const sql = `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`;
  const values = {
    $name: name,
    $issueNumber: issueNumber,
    $publicationDate: publicationDate,
    $artistId: artistId,
    $seriesId: req.params.seriesId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`,
        (error, issue) => {
          res.status(201).json({issue: issue});
        });
    }
  });

});

issuesRouter.put('/:issueId', (req,res, next) => {
  const issueToUpdate = req.body.issue;

  const name = issueToUpdate.name,
        issueNumber = issueToUpdate.issueNumber,
        publicationDate = issueToUpdate.publicationDate,
        artistId = issueToUpdate.artistId;
        // seriesId = issueToUpdate.seriesId;

  if(!issueToUpdate || !name || !issueNumber || !publicationDate || !artistId){
    res.sendStatus(400);
  }


  const sql = `UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId`;
  const values = {
      $name: name,
      $issueNumber: issueNumber,
      $publicationDate: publicationDate,
      $artistId: artistId
    };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`,
        (error, issue) => {
          res.status(200).json({issue: issue});
        });
    }
  });

});

issuesRouter.delete('/:issueId', (req, res, next) => {
  const getSQL = `SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`;
  const sql = `DELETE FROM Issue WHERE Issue.id = ${req.params.issueId}`;

  db.get(getSQL, (error, row) => {
    if(error){
      next(error);
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

module.exports = issuesRouter;
