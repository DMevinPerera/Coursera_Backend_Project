
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const axios = require('axios');
const app = express();
const PORT = 3000;


app.use(bodyParser.json());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));


const books = [
  { isbn: '12345', title: 'Book One', author: 'Author One', reviews: [
    { user: 'user1', comment: 'Great Book' }, 
    { user: 'user2', comment: 'Too Much' }
  ]  },
  { isbn: '67890', title: 'Book Two', author: 'Author Two', reviews: [] }
];
const users = [
    { username: 'user1', password: 'password123' },
    { username: 'user2', password: 'password456' }
  ];

// Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, 'jwt-secret', (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Task 1
app.get('/books', async (req, res) => {
  try {
    res.json(books);
  } catch (err) {
    res.status(500).send('Error retrieving books');
  }
});

// Task 2
app.get('/books/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books.find(b => b.isbn === isbn);
  book ? res.json(book) : res.status(404).send('Book not found');
});

// Task 3
app.get('/books/author/:author', (req, res) => {
  const { author } = req.params;
  const filteredBooks = books.filter(b => b.author === author);
  res.json(filteredBooks);
});

// Task 4
app.get('/books/title/:title', (req, res) => {
  const { title } = req.params;
  const filteredBooks = books.filter(b => b.title === title);
  res.json(filteredBooks);
});

// Task 5
app.get('/books/reviews/:isbn', (req, res) => {
    const { isbn } = req.params;
    const book = books.find(b => b.isbn === isbn);
    if (book) {
      res.json(book.reviews);
    } else {
      res.status(404).send('Book not found');
    }
  });

// Task 6
app.post('/users/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).send('User already exists');
  }
  users.push({ username, password });
  res.status(201).send('User registered successfully');
});

// Task 7
app.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const token = jwt.sign({ username }, 'jwt-secret', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Task 8
app.post('/books/review/:isbn', authenticateJWT, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const book = books.find(b => b.isbn === isbn);
  
    if (book) {

      const existingReviewIndex = book.reviews.findIndex(r => r.username === req.user.username);
  
      if (existingReviewIndex !== -1) {

        book.reviews[existingReviewIndex].review = review;
        res.send('Review modified');
      } else {

        book.reviews.push({ username: req.user.username, review });
        res.send('Review added');
      }
    } else {
      res.status(404).send('Book not found');
    }
  });

// Task 9
app.delete('/books/review/:isbn', authenticateJWT, (req, res) => {
  const { isbn } = req.params;
  const book = books.find(b => b.isbn === isbn);
  if (book) {
    book.reviews = book.reviews.filter(r => r.username !== req.user.username);
    res.send('Review deleted');
  } else {
    res.status(404).send('Book not found');
  }
});

// Task 10
app.get('/books/async', async (req, res) => {
  try {
    const response = await axios.get('https://api.example.com/books');
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching books');
  }
});

// Task 11
app.get('/books/promise/:isbn', (req, res) => {
  axios.get(`https://api.example.com/books/${req.params.isbn}`)
    .then(response => res.json(response.data))
    .catch(error => res.status(500).send('Error fetching book'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
