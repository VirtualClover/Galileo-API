const {google} = require('googleapis');
const express = require('express');
const app = express();

const SPREAD_DATA = {
  id: '14KUqHfspC2mD_aH5EhCxUFY_nSqvjwLmd2EvMBlgVAA',
  url: 'https://www.googleapis.com/auth/spreadsheets',
};

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Galileo REST API listening on port', port);
});

app.get('/styleguide', async (req, res) => {
  const colorList = await getColorlist();
  const textStyles = await getTextStyles();
  let retVal;
  if (colorList && textStyles) {
    retVal = {
      status: 'success',
      data: {colors: colorList, textStyles: textStyles},
    };
  } else {
    res.status(404);
    retVal = {
      status: 'fail',
      data: {title: `Something went wrong fetching the styleguide`},
    };
  }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('content-type', 'application/json');
  res.end(JSON.stringify(retVal));
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

app.get('/text_styles', async (req, res) => {
  const list = await getTextStyles();
  let retVal;
  if (list) {
    retVal = {status: 'success', data: {textStyles: list}};
  } else {
    res.status(404);
    retVal = {status: 'fail', data: {title: `Text styles not found`}};
  }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('content-type', 'application/json');
  res.end(JSON.stringify(retVal));
});

async function getColorlist() {
  const auth = await google.auth.getClient({
    scopes: [SPREAD_DATA.url],
  });
  const list = {};
  const api = google.sheets({version: 'v4', auth});
  const response = await api.spreadsheets.values.get({
    spreadsheetId: SPREAD_DATA.id,
    range: 'ColorList!A:G',
  });
  for (const row of response.data.values) {
    if (row[0] !== 'Color') {
      const color = row[0].toLowerCase();
      const shade = {
        hex: row[2],
        rgb: row[3],
        hsl: row[4],
        recommended_foreground: row[5],
        description: row[6],
      };
      if (!list[color]) {
        list[color] = {};
      }
      list[color][row[1]] = shade;
    }
  }
  return list;
}

async function getTextStyles() {
  const auth = await google.auth.getClient({
    scopes: [SPREAD_DATA.url],
  });
  const list = {};
  const api = google.sheets({version: 'v4', auth});
  const response = await api.spreadsheets.values.get({
    spreadsheetId: SPREAD_DATA.id,
    range: 'TextStyles!A:H',
  });
  for (const row of response.data.values) {
    if (row[0] !== 'Style') {
      const style = row[0].toLowerCase();
      const device = {
        font: row[2],
        size: row[3],
        lineHeight: row[4],
        weight: row[5],
        decoration: row[6],
        description: row[7],
      };
      if (!list[style]) {
        list[style] = {};
      }
      list[style][row[1]] = device;
    }
  }
  return list;
}
