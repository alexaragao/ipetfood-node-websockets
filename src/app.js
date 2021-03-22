const express = require('express');

const app = express();

app.use(express.static('public/html', {
  extensions: ['html', 'htm']
}));
app.use(express.static('public'));

module.exports = app;