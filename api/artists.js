const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
    $artistId: artistId
  }, (err, row) => {
    if(err){
      next(err);
    }else if(row){
      req.artist = row;
      next();
    }else{
      res.sendStatus(404);
    }
  });
});


artistsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Artist WHERE Artist.is_currently_employed = 1`, (err, rows) => {
    if(err){
      next(err);
    } else{
      res.status(200).json({ artists: rows });
    }
  });

});

artistsRouter.post('/', (req,res, next) => {
  const artistToAdd = req.body.artist;

  if(!artistToAdd || !artistToAdd.name || !artistToAdd.dateOfBirth || !artistToAdd.biography){
    res.sendStatus(400);
  }
  const name = artistToAdd.name,
       dateOfBirth = artistToAdd.dateOfBirth,
       biography = artistToAdd.biography,
       isCurrentlyEmployed = artistToAdd.isCurrentlyEmployed === 0 ? 0 : 1;

  const sql = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`;
  const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: isCurrentlyEmployed
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
        (error, artist) => {
          res.status(201).json({artist: artist});
        });
    }
  });

});


artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({artist:req.artist});

});

artistsRouter.put('/:artistId', (req, res, next) => {
  const artistToUpdate = req.body.artist;


  const name = artistToUpdate.name,
       dateOfBirth = artistToUpdate.dateOfBirth,
       biography = artistToUpdate.biography,
       isCurrentlyEmployed = artistToUpdate.isCurrentlyEmployed === 0 ? 0 : 1;

 if(!name|| !dateOfBirth || !biography){
         res.sendStatus(400);
       }
  const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';

  const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: isCurrentlyEmployed,
    $artistId: req.params.artistId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
        (error, artist) => {
          res.status(200).json({artist: artist});
        });
    }
  });

});

artistsRouter.delete('/:artistId', (req, res, next) => {

 const values = {
         $artistId: req.params.artistId
       };

const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId';

  db.run(sql, values, function(error){
    if(error){
      next(error);
    } else{
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
        (error, artist) => {
          res.status(200).json({artist: artist});
        });
    }
  });

});

module.exports = artistsRouter;
