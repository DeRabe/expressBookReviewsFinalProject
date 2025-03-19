const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Checks if a username already exists in the 'users' array
const isValid = (username) => {
  // Filter the 'users' array for any user with the matching username
  let existingUsers = users.filter((user) => user.username === username);
  return existingUsers.length > 0;
};

// Checks if the username-password combination is valid
const authenticatedUser = (username, password) => {
  // Filter the 'users' array for a user with matching username & password
  let validUser = users.filter((user) => user.username === username && user.password === password);
  return validUser.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  // Extract username and password from the request body
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in. Username or password is missing." });
  }

  // Check if the username-password combination is valid
  if (authenticatedUser(username, password)) {
    // Generate a JWT token (set an expiry as needed, for example 1 hour)
    let accessToken = jwt.sign(
      { data: username },
      'fingerprint_customer',
      { expiresIn: 60 * 60 }
    );

    // Save the token in the session
    req.session.authorization = {
      accessToken,
      username,
    };

    // Respond with success
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    // If no valid user found, respond with error
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Retrieve the review text from the query string (e.g. ?review=someText)
  const reviewText = req.query.review;

  // Retrieve the username from the session object
  const username = req.session.authorization.username;

  // Find the book in our 'books' object
  let book = books[isbn];

  // Check if the book exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if a review was passed in query
  if (!reviewText) {
    return res.status(400).json({ message: "No review provided" });
  }

  // If the book has no 'reviews' key yet, initialize it
  if (!book.reviews) {
    book.reviews = {};
  }

  // Assign or update the review using username as the key
  book.reviews[username] = reviewText;

  // Return the updated reviews object
  return res.status(200).json({
    message: `Review for ISBN ${isbn} by user '${username}' has been added/updated.`,
    reviews: book.reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Get the username from the session
  const username = req.session.authorization.username;

  // Find the book by ISBN in the 'books' object
  let book = books[isbn];

  // If the book doesn't exist, return a 404
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // If the book has no reviews, or no review by this user, return a 404
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No review by this user to delete" });
  }

  // Delete the user's review
  delete book.reviews[username];

  // Return the updated reviews
  return res.status(200).json({
    message: `Review by user '${username}' for ISBN ${isbn} has been deleted.`,
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

// curl --location --request POST 'http://localhost:5000/customer/login' --header 'Content-Type: application/json' --data-raw '{"username":"exampleUser","password":"examplePass"}'

// curl --location --request PUT 'http://localhost:5000/customer/auth/review/1?review=This%20is%20an%20amazing%20book' --header 'Content-Type: application/json'

// curl --location --request DELETE 'http://localhost:5000/customer/auth/review/1' --header 'Content-Type: application/json'