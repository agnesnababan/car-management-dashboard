const express = require('express');
const path = require('path');
const app = express();

const { PORT = 8000 } = process.env;
const PUBLIC_DIRECTORY = path.join(__dirname, './public');

// Tentukan folder untuk templat EJS
app.set('views', path.join(PUBLIC_DIRECTORY, '/views'));
app.use('/css', express.static(PUBLIC_DIRECTORY + 'public/css'))
app.set('view engine', 'ejs');

app.use(express.static(PUBLIC_DIRECTORY));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) =>{
  res.render('home');
});

app.get('/tambah', (req, res) =>{
    res.render('create');
});

app.get('/edit', (req, res) =>{
    res.render('update');
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:%d', PORT);
});
