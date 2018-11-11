'use strict';

const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('CPED CRUD API');
});

router.get('/new', (req, res) => {
  // TODO: Create entry
});

router.get('/find', (req, res) => {
  // TODO: Read entry
});

router.get('/update', (req, res) => {
  // TODO: Update entry
});

router.get('/delete', (req, res) => {
  // TODO: Delete entry
  res.send('testing');
});

module.exports = router;
