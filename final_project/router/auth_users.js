const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(u => u.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

// Task 7: Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in - missing credentials" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ data: username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken: token };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.data;

  if (!review) {
    return res.status(400).json({ message: "Review text is required as a query parameter" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews[username] = review;
  return res.status(200).json({ message: `Review added/updated for ISBN ${isbn}`, reviews: book.reviews });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on that book" });
  }

  delete book.reviews[username];
  return res.status(200).json({ message: `Review by ${username} deleted for ISBN ${isbn}`, reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;