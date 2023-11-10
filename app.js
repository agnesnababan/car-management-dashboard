const express = require('express'); // third-party module
const path = require('path'); // core module

const api = require('./routes/api'); // local module (api)

const app = express(); // instance express -> assign ke variabel app
const { PORT = 8080 } = process.env;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.set('views', path.join(PUBLIC_DIR, '/views'));
app.use('/css', express.static(PUBLIC_DIR + 'public/css'))
app.set('view engine', 'ejs');
app.use(express.static(PUBLIC_DIR)); // membuat URL sendiri untuk apa saja
// yang ada di dalam folder PUBLIC_DIR -> "public"

app.use(express.json()); // body json
app.use(
  express.urlencoded({
    extended: true,
  })
); // body urlencoded

app.use('/api/cars', api.cars());

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:%d', PORT);
});
