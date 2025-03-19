const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Extract username and password from request body
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Error: Username or password is missing" });
  }

  // Check if this username already exists (using isValid or your own check logic)
  if (isValid(username)) {
    // If user is already registered, return an error
    return res.status(409).json({ message: "User already exists!" });
  }

  // If not already registered, add new user
  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Send the list of all books in a neat JSON format
  res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Retrieve the ISBN parameter from the request
  const isbn = req.params.isbn;

  // Find the book in our 'books' object using the ISBN as key
  const book = books[isbn];

  // Check if the book exists
  if (book) {
    // Return book details in neat JSON format
    res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    // If no book found with the given ISBN, return a 404 error
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  // Retrieve the author parameter from the request
  const authorParam = req.params.author;

  // Create an array to store matched books
  let matchingBooks = [];

  // Iterate through all book keys in the 'books' object
  for (let isbn in books) {
    let book = books[isbn];

    // Check if the book's author matches the author parameter
    if (book.author === authorParam) {
      matchingBooks.push(book);
    }
  }

  // If we found matches, return them in neat JSON format
  if (matchingBooks.length > 0) {
    res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    // If no matches found, return a 404 error
    res.status(404).json({ message: "No books found by that author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  // Retrieve the title parameter from the request
  const titleParam = req.params.title;

  // Create an array to store matched books
  let matchingBooks = [];

  // Iterate through all book keys in the 'books' object
  for (let isbn in books) {
    let book = books[isbn];

    // Check if the book's title matches the title parameter
    if (book.title === titleParam) {
      matchingBooks.push(book);
    }
  }

  // If we found matches, return them in neat JSON format
  if (matchingBooks.length > 0) {
    res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } else {
    // If no matches found, return a 404 error
    res.status(404).json({ message: "No books found with that title" });
  }
});

//  Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  // Retrieve the ISBN parameter from the request
  const isbn = req.params.isbn;

  // Access the book in our 'books' object using the ISBN
  const book = books[isbn];

  // Check if the book exists
  if (book) {
    // Return only the 'reviews' property in a neat JSON format
    res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    // If no book is found with the given ISBN, return a 404 error
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

// curl localhost:5000

// curl localhost:5000/isbn/1

// curl --location 'http://localhost:5000/author/Chinua%20Achebe'

// curl --location 'http://localhost:5000/title/Things%20Fall%20Apart'

// curl --location 'http://localhost:5000/review/1'