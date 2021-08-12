const {google} = require('googleapis');
const express = require('express');
const app = express();

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Galileo REST API listening on port', port);
});

app.get('/colors', async (req, res) => {
  const list = await getColorlist();
  let retVal;
  if (list) {
    retVal = {status: 'success', data: {colors: list}};
  } else {
    res.status(404);
    retVal = {status: 'fail', data: {title: `Color list not found`}};
  }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('content-type', 'application/json');
  res.end(JSON.stringify(retVal));
});

async function getColorlist() {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const list = {};
  const api = google.sheets({version: 'v4', auth});
  const response = await api.spreadsheets.values.get({
    spreadsheetId: '14KUqHfspC2mD_aH5EhCxUFY_nSqvjwLmd2EvMBlgVAA',
    range: 'ColorList!A:F',
  });
  for (const row of response.data.values) {
    if (row[0] !== 'Color') {
      const color = row[0].toLowerCase();
      const shade = {
        hex: row[2],
        rgb: row[3],
        hsl: row[4],
        recommended_foreground: row[5],
      };
      if (!list[color]) {
        list[color] = {};
      }
      list[color][row[1]] = shade;
    }
  }
  return list;
}
