const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('home', {
    title: 'Search Hacker News',
  });
});

app.get('/search', (req, res) => {
  const gitOwner = req.query.owner;
  const gitRepo = req.query.repo;
  if (!gitOwner || !gitRepo) {
    res.redirect(302, '/');
    return;
  }

  console.log(gitOwner,"/",gitRepo);
  res.status(200).end();
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Node server started on port: ${server.address().port}`);
});
