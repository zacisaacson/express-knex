const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Publications';

app.get('/', (request, response) => {
  response.send('Hello, Publications');
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

// Get all papers
app.get('/api/v1/papers', (request, response) => {
  database('papers').select()
    .then((papers) => {
      response.status(200).json(papers);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

// Get all footnotes
app.get('/api/v1/footnotes', (request, response) => {
  database('footnotes').select()
    .then((footnotes) => {
      response.status(200).json(footnotes);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

// Add new paper
app.post('/api/v1/papers', (request, response) => {
  const paper = request.body;

  for (let requiredParameter of ['title', 'author']) {
    if (!paper[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { title: <String>, author: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }

  database('papers').insert(paper, 'id')
    .then(paper => {
      response.status(201).json({ id: paper[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

// Add new footnote
app.post('/api/v1/footnotes', (request, response) => {
  const footnote = request.body;

  for (let requiredParameter of ['note', 'paper_id']) {
    if ( !footnote[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { note: <String>, paper_id: <Integer> }. You're missing a "${requiredParameter}" property.`});
    }
  }

  database('footnotes').insert(footnote, 'id')
    .then(footnote => {
      response.status(201).json({ id: footnote[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

// Get one paper
app.get('/api/v1/papers/:id', (request, response) => {
  database('papers').where('id', request.params.id).select()
    .then(papers => {
      if (papers.length) {
        response.status(200).json(papers);
      } else {
        response.status(404).json({
          error: `Could not find paper with id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

// Get all footnotes for one paper
app.get('/api/v1/papers/:id/footnotes', (request, response) => {
  database('footnotes').where('paper_id', request.params.id).select()
    .then(footnotes => {
      if (footnotes.length) {
        response.status(200).json(footnotes);
      } else {
        response.status(404).json({
          error: `Could not find footnotes with paper id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});
