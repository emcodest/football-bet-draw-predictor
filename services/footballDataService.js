const axios = require('axios');

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
  },
});

async function getUpcomingFixtures() {
  const res = await axiosInstance.get('/fixtures', {
    params: { next: 20, league: 39, season: 2024 },
  });
  return res.data.response;
}

async function getOddsForFixture(fixtureId) {
  const res = await axiosInstance.get('/odds', {
    params: { fixture: fixtureId },
  });
  return res.data.response;
}

module.exports = { getUpcomingFixtures, getOddsForFixture };
