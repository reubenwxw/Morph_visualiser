import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

const pmtilesDir = path.join(__dirname, 'public', 'pmtiles');

app.get('/tiles', (req, res) => {
  fs.readdir(pmtilesDir, (err, files) => {
    if (err) {
      res.status(500).send('Unable to scan tiles directory');
      return;
    }
    const pmtilesFiles = files
      .filter(file => file.endsWith('.pmtiles'))
      .map(file => `/pmtiles/${file}`);
    res.json(pmtilesFiles);
  });
});

const catchmentDir = path.join(__dirname, 'public', 'catchment');

app.get('/catchment', (req, res) => {
  fs.readdir(catchmentDir, (err, files) => {
    if (err) {
      res.status(500).send('Unable to scan catchment directory');
      return;
    }
    const catchmentFiles = files
      .filter(file => file.endsWith('.geojson') && !file.startsWith('._'))
      .map(file => `/catchment/${file}`);
    res.json(catchmentFiles);
  });
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Server Directory</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #333; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 10px 0; }
          a { text-decoration: none; color: #007bff; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Server Directory</h1>
        <p>Available resources:</p>
        <ul>
          <li><a href="/tiles">/tiles</a> - JSON list of available pmtiles files</li>
          <li><a href="/catchment">/catchment</a> - JSON list of available catchment files</li>
          <li><a href="/CityRankings2024.json">/CityRankings2024.json</a> - Main city data file</li>
          <li>Static directories:</li>
          <ul>
            <li><a href="/pmtiles/">/pmtiles/</a></li>
            <li><a href="/catchment/">/catchment/</a></li>
          </ul>
        </ul>
      </body>
    </html>
  `);
});

app.use('/pmtiles', express.static(pmtilesDir));
app.use('/catchment', express.static(catchmentDir));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
