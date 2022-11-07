const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const Nodemailer = require('./nodemailer');

// 
// using dotenv to load mailgun api key and domain 
// *** for the send email function to work a local
// *** .env.dev file is needed with the following variables
// *** MAILGUN_API_KEY="your mailgun api key goes here" 
// *** MAILGUN_DOMAIN="your mailgun domain goes here"
// 
const result = dotenv.config({ path: '.env.dev' })
if (result.error) {
  throw result.error
}

// for debug of dotenv
//console.log(result.parsed)

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
}

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('home', {
    title: 'Search Github Pull Requests',
  });
});

function subtractDays(numOfDays, date = new Date()) {
  date.setDate(date.getDate() - numOfDays);
  return date;
}

// 
// just using unauthenticated get on the github api address here
// ideally would be better to be using the oktokit github rest api
// 
async function searchGit(gitOwner, gitRepo) {
  const response = await axios.get(
    `https://api.github.com/repos/${gitOwner}/${gitRepo}/pulls`
  );
  
  const weekDate = subtractDays(7);
  var startDate = new Date(weekDate);
  // var endDate = new Date(date.getDate());
  var filteredData = response.data.filter(a => {
      var date = new Date(a.created_at);
      return (date >= startDate && date)
    });

  // console.log(weekDate)
  
  return filteredData;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  
  // console.log(req.body)
  // console.log(req.query)
  // console.log(globalThis.results)

  try {
    const {email, name} = req.body;
    const from = name+"@"+auth.auth.domain;
    const resultData = globalThis.results
    await new Nodemailer({ resultData }, email, from, 'Weekly Github Pull Request Report', auth).sendMail();
    return res.json({
      success: true,
      message: 'Email Send Successfully',
  });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err,
    });
  }
});

app.get('/search', async (req, res) => {
  try {
    const gitOwner = req.query.owner;
    const gitRepo = req.query.repo;
    const searchQuery = `https://api.github.com/repos/${gitOwner}/${gitRepo}/pulls`;
    if (!gitOwner || !gitRepo) {
      res.redirect(302, '/');
      console.log("No data enetered")
      return;
    }

    console.log("GitProject:",gitOwner,"|","GitRepo:",gitRepo);
    console.log(searchQuery)
  
    globalThis.results = await searchGit(gitOwner, gitRepo);
      
    res.render('search', {
      title: `Pull Request Search results for: GitRepoOwner:${gitOwner} GitRepo:${gitRepo} `,
      searchResults: results,
      searchQuery
    });
  } catch (err) {
    // next(err);
    // console.log(err)
    return res.status(400).json({
      success: false,
      message: err,
    });
  }
  
  // res.status(200).json(results);
  
});

// 
// couldn't quite get this working 
// 
// app.use(function err (err, req, res, next) {
//   console.error(err);
//   res.set('Content-Type', 'text/html');
//   res.status(500).send('<h1>Internal Server Error</h1>');
// });

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Node server started on port: ${server.address().port}`);
});
