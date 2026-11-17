import express from "express";
import books from "./books.js";
import crypto from "crypto";

const app = express();

app.use(express.json());
app.use(express.static("../src/"));
app.use(express.urlencoded({ extended: false }));

// GET /api/books           -> sve knjige
// GET /api/books?read=true -> samo pročitane
// GET /api/books?read=false-> samo nepročitane
app.get("/api/books", (req, res) => {
    const { read } = req.query; //uzima objekt koji ima svojstvo read i vraca true ili false
    if(read=="true") {
        return res.send(books.filter(b => b.read));
    }  
    else if(read === "false"){
        return res.send(books.filter(b => !b.read ));
    }
    else
        res.send(books);    
});

app.get("/api/stats", (req, res) => {
    res.send({
        total: books.length,
        read: books.filter(b => b.read).length
    });    
});

// POST /api/books -> dodaje novu knjigu
app.post("/api/books", (req, res) => {
    const { title, author, pages, read } = req.body;
    if (!title || !author || !(Number(pages) > 0)) {
        res.status(400).send({ error: "Invalid data" });
        return;
    }
    const book = {
        id: crypto.randomUUID(),
        title,
        author,
        pages: Number(pages),
        read: Boolean(read),
        addedAt: Date.now()
    };
    books.push(book);
    res.status(201).send(book);
});


// PATCH /api/books/:id -> mijenja status read (true <-> false)
app.patch("/api/books/:id", (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        res.status(404).send({ error: "Not found" });
        return;
    }
    book.read = !book.read;
    res.send(book);
});

// DELETE /api/books/:id
app.delete("/api/books/:id", (req, res) => {
    const index = books.findIndex(b => b.id === req.params.id);
    if (index === -1) {
        res.status(404).send({ error: "Not found" });
        return;
    }
    const [deleted] = books.splice(index, 1);
    res.send(deleted);
});


app.listen(3000, () => {
console.log("Server is running on http://localhost:3000");
});