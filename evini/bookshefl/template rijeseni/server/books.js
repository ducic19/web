import crypto from "crypto";

const books = [
  {id: crypto.randomUUID(), title: "The Hobbit",              author: "J. R. R. Tolkien",   pages: 310, read: true,  addedAt: 1794481200000 },
  {id: crypto.randomUUID(), title: "1984",                    author: "George Orwell",      pages: 328, read: false, addedAt: 1794567600000 },
  {id: crypto.randomUUID(), title: "Dune",                    author: "Frank Herbert",      pages: 612, read: false, addedAt: 1794654000000 },
  {id: crypto.randomUUID(), title: "Clean Code",              author: "Robert C. Martin",   pages: 464, read: true,  addedAt: 1794740400000 },
  {id: crypto.randomUUID(), title: "Brave New World",         author: "Aldous Huxley",      pages: 288, read: false, addedAt: 1794826800000 },
  {id: crypto.randomUUID(), title: "The Pragmatic Programmer",author: "D. Thomas, A. Hunt", pages: 352, read: false, addedAt: 1794913200000 },
  {id: crypto.randomUUID(), title: "Kiklop",                  author: "Ranko Marinković",   pages: 500, read: true,  addedAt: 1794999600000 },
  {id: crypto.randomUUID(), title: "The Little Prince",       author: "Antoine de Saint-Exupéry", pages: 96, read: false, addedAt: 1795086000000 }
];

export default books;