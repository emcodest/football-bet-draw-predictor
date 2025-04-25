require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const { getLikelyDraws } = require('./utils/drawLogic');

app.get('/likely-draws', async (req, res) => {
  try {
    const predictions = await getLikelyDraws();
    res.json(predictions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error predicting draws');
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
