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

async function getTeamForm(homeId, awayId) {
  const [homeRes, awayRes] = await Promise.all([
    axiosInstance.get('/fixtures', { params: { team: homeId, last: 5 } }),
    axiosInstance.get('/fixtures', { params: { team: awayId, last: 5 } }),
  ]);

  const parseForm = (matches) => {
    let draws = 0, totalGoals = 0;
    matches.forEach(match => {
      const { goals } = match;
      if (goals.home === goals.away) draws++;
      totalGoals += goals.home + goals.away;
    });
    return {
      draws,
      avgGoals: totalGoals / matches.length
    };
  };

  return {
    homeDraws: parseForm(homeRes.data.response).draws,
    awayDraws: parseForm(awayRes.data.response).draws,
    goalStats: {
      homeAvgGoals: parseForm(homeRes.data.response).avgGoals,
      awayAvgGoals: parseForm(awayRes.data.response).avgGoals
    }
  };
}

async function getHeadToHeadStats(homeId, awayId) {
  const res = await axiosInstance.get('/fixtures/headtohead', {
    params: { h2h: `${homeId}-${awayId}`, last: 10 }
  });

  const matches = res.data.response;
  const draws = matches.filter(m => m.goals.home === m.goals.away).length;
  const drawRatio = matches.length > 0 ? draws / matches.length : 0;

  return { drawRatio };
}

async function getLeagueStandings(homeId, awayId) {
  const standingsRes = await axiosInstance.get('/standings', {
    params: { league: 39, season: 2024 }
  });

  const table = standingsRes.data.response[0]?.league?.standings[0];
  let homePos = 20, awayPos = 20;

  for (const team of table) {
    if (team.team.id === homeId) homePos = team.rank;
    if (team.team.id === awayId) awayPos = team.rank;
  }

  return { homePos, awayPos };
}

module.exports = {
  getUpcomingFixtures,
  getOddsForFixture,
  getTeamForm,
  getHeadToHeadStats,
  getLeagueStandings,
};
