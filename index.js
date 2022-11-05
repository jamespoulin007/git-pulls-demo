const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('home', {
    title: 'Search Hacker News',
  });
});

async function searchGit(gitOwner, gitRepo) {
  const response = await axios.get(
    `https://api.github.com/repos/${gitOwner}/${gitRepo}/pulls`
  );

  return response.data;
}

app.get('/search', async (req, res) => {
  const gitOwner = req.query.owner;
  const gitRepo = req.query.repo;
  const searchQuery = `https://api.github.com/repos/${gitOwner}/${gitRepo}/pulls`;
  if (!gitOwner || !gitRepo) {
    res.redirect(302, '/');
    return;
  }

  console.log(gitOwner,"/",gitRepo);
 
  const results = await searchGit(gitOwner, gitRepo);
  
  res.render('search', {
    title: `Pull Request Search results for: GitRepoOwner:${gitOwner} GitRepo:${gitRepo} `,
    searchResults: results,
    searchQuery,
  });
  
  
  // res.status(200).json(results);
  // res.status(200).end();
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Node server started on port: ${server.address().port}`);
});
