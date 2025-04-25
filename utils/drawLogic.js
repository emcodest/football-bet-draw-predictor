const { getUpcomingFixtures, getOddsForFixture } = require('../services/footballDataService');

async function getLikelyDraws() {
  const fixtures = await getUpcomingFixtures();
  const predictions = [];

  for (const match of fixtures) {
    const { teams, fixture } = match;

    try {
      const oddsData = await getOddsForFixture(fixture.id);
      const odds = oddsData[0]?.bookmakers[0]?.bets[0]?.values;

      const drawOdds = odds?.find(o => o.value === 'Draw')?.odd;

      if (drawOdds && drawOdds >= 3.0 && drawOdds <= 3.5) {
        predictions.push({
          fixtureId: fixture.id,
          date: fixture.date,
          home: teams.home.name,
          away: teams.away.name,
          drawOdds,
        });
      }
    } catch (e) {
      console.warn(`Could not fetch odds for fixture ${fixture.id}`);
    }
  }

  return predictions;
}

module.exports = { getLikelyDraws };
