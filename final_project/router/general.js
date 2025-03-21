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


// Mock function to simulate asynchronous retrieval of books
function getBooks() {
  return new Promise((resolve, reject) => {
    // Simulate a small delay
    setTimeout(() => {
      // Resolve the Promise with local 'books' data
      resolve(books);
    }, 300);
  });
}

// Get the book list available in the shop (using async/await)
public_users.get('/', async function (req, res) {
  try {
    // Await the asynchronous "getBooks" call
    const fetchedBooks = await getBooks();

    // Send the list of all books in a neat JSON format
    return res.status(200).send(JSON.stringify(fetchedBooks, null, 4));
  } catch (error) {
    // If any error occurs during the process, respond with status 500
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Simulated async function to get a single book by ISBN
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    }, 100);
  });
}

// Get book details based on ISBN (Async/Await + Promise)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Simulated async function to get books by author
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Create an array to store matched books
      let matchingBooks = [];
      for (let isbn in books) {
        if (books[isbn].author === author) {
          matchingBooks.push(books[isbn]);
        }
      }
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found by that author");
      }
    }, 500);
  });
}

// Get book details based on Author (Async/Await + Promise)
public_users.get('/author/:author', async function (req, res) {
  try {
    const authorParam = req.params.author;
    const matchingBooks = await getBooksByAuthor(authorParam);
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Simulated async function to get books by title
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let matchingBooks = [];
      for (let isbn in books) {
        if (books[isbn].title === title) {
          matchingBooks.push(books[isbn]);
        }
      }
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found with that title");
      }
    }, 1000);
  });
}

/// Get all books based on Title (Async/Await + Promise)
public_users.get('/title/:title', async function (req, res) {
  try {
    const titleParam = req.params.title;
    const matchingBooks = await getBooksByTitle(titleParam);
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error });
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

// curl --location --request POST 'http://localhost:5000/register' --header 'Content-Type: application/json' --data-raw '{"username":"exampleUser","password":"examplePass"}'