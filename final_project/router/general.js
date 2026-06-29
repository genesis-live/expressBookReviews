const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// Task 1: Get all books (sync)
public_users.get('/', function (_req, res) {
  return res.status(200).json(books);
});

// Task 2: Get by ISBN (sync)
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// Task 3: Get by author (sync)
public_users.get('/author/:author', function (req, res) {
  const author = decodeURIComponent(req.params.author.replace(/\+/g, ' '));
  const matched = Object.values(books).filter(b => b.author === author);
  if (!matched.length) return res.status(404).json({ message: "No books found for this author" });
  return res.status(200).json(matched);
});

// Task 4: Get by title (sync)
public_users.get('/title/:title', function (req, res) {
  const title = decodeURIComponent(req.params.title.replace(/\+/g, ' '));
  const matched = Object.values(books).filter(b => b.title === title);
  if (!matched.length) return res.status(404).json({ message: "No books found with this title" });
  return res.status(200).json(matched);
});

public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

/**
 * Task 10: Get all books using async/await with Axios.
 * Makes an asynchronous GET request to the base books endpoint
 * and returns the full list of books available in the shop.
 */
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * Task 11: Get book details based on ISBN using Promise callbacks with Axios.
 * Sends a GET request to the /isbn/:isbn endpoint and resolves
 * the book data via .then(), or returns a 404 error via .catch().
 */
public_users.get('/async/isbn/:isbn', (req, res) => {
  axios.get(`${BASE_URL}/isbn/${req.params.isbn}`)
    .then(response => res.status(200).json(response.data))
    .catch(err => res.status(err.response?.status || 404).json({ message: err.response?.data?.message || "Book not found" }));
});

/**
 * Task 12: Get book details based on Author using async/await with Axios.
 * Makes an asynchronous GET request filtering books by the author
 * name provided in the route parameter. Returns 404 if no match found.
 */
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${req.params.author}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(err.response?.status || 404).json({ message: err.response?.data?.message || "No books found for this author" });
  }
});

/**
 * Task 13: Get book details based on Title using Promise callbacks with Axios.
 * Sends a GET request to the /title/:title endpoint and resolves
 * the matching books via .then(), or returns a 404 error via .catch().
 */
public_users.get('/async/title/:title', (req, res) => {
  axios.get(`${BASE_URL}/title/${req.params.title}`)
    .then(response => res.status(200).json(response.data))
    .catch(err => res.status(err.response?.status || 404).json({ message: err.response?.data?.message || "No books found with this title" }));
});

module.exports.general = public_users;