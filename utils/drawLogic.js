const { getUpcomingFixtures, getOddsForFixture, getTeamForm, getHeadToHeadStats, getLeagueStandings } = require('../services/footballDataService');

async function getLikelyDraws() {
  const fixtures = await getUpcomingFixtures();
  const predictions = [];

  for (const match of fixtures) {
    const { teams, fixture } = match;

    try {
      const oddsData = await getOddsForFixture(fixture.id);
      const odds = oddsData[0]?.bookmakers[0]?.bets[0]?.values;

      const drawOdds = odds?.find(o => o.value === 'Draw')?.odd;
      const homeWinOdds = odds?.find(o => o.value === 'Home')?.odd;
      const awayWinOdds = odds?.find(o => o.value === 'Away')?.odd;

      const dOdd = parseFloat(drawOdds);
      const hOdd = parseFloat(homeWinOdds);
      const aOdd = parseFloat(awayWinOdds);

      let drawScore = 0;

      if (dOdd >= 3.0 && dOdd <= 3.5) drawScore++;
      if (Math.abs(hOdd - aOdd) <= 0.5) drawScore++;
      if (hOdd > 2.0 && aOdd > 2.0) drawScore++;

      const form = await getTeamForm(teams.home.id, teams.away.id);
      if (form.homeDraws >= 2 && form.awayDraws >= 2) drawScore++;

      const goalStats = form.goalStats;
      if (goalStats.homeAvgGoals < 1.5 && goalStats.awayAvgGoals < 1.5) drawScore++;

      const h2h = await getHeadToHeadStats(teams.home.id, teams.away.id);
      if (h2h.drawRatio >= 0.3) drawScore++;

      const positions = await getLeagueStandings(teams.home.id, teams.away.id);
      if (Math.abs(positions.homePos - positions.awayPos) <= 3) drawScore++;

      if (drawScore >= 4) {
        predictions.push({
          fixtureId: fixture.id,
          date: fixture.date,
          home: teams.home.name,
          away: teams.away.name,
          drawOdds: dOdd,
          drawScore,
        });
      }
    } catch (e) {
      console.warn(`Error processing fixture ${fixture.id}: ${e.message}`);
    }
  }

  return predictions;
}

module.exports = { getLikelyDraws };
