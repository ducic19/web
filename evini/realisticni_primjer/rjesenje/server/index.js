// =====================================================================
// POSLUŽITELJ (Express.js)
// Pokretanje: u mapi server -> "npm run nodemon" (ili "node index.js")
// Ovaj poslužitelj NE poslužuje HTML stranicu - to radi Vite na portu 8080.
// Ovdje su samo API rute (/api/...) koje vraćaju JSON podatke.
// =====================================================================

// "import" radi jer u server/package.json piše "type": "module".
import express from "express";
// Zadatak 1: uvoz polja filmova iz vanjskog modula.
// Radi samo zato što movies.js ima "export default movies".
// Putanja mora počinjati s "./" i imati nastavak ".js".
import movies from "./movies.js";

const app = express();

// (dano u predlošku) Middleware-i za čitanje tijela zahtjeva u req.body.
// U ovom zadatku klijent ne šalje tijelo (PATCH samo mijenja watched u
// suprotno), ali middleware-i su standardni dio svakog Express poslužitelja.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ---------------------------------------------------------------------
// Zadatak 1: GET /api/movies -> šalje sve filmove
// Filtriranje (All / To watch / Watched) radi se na KLIJENTU, pa poslužitelj
// uvijek vraća cijelo polje.
// ---------------------------------------------------------------------
app.get("/api/movies", (req, res) => {
    // res.send s poljem automatski šalje JSON i postavlja Content-Type.
    res.send(movies);
});

// ---------------------------------------------------------------------
// Zadatak 1: PATCH /api/movies/:id -> mijenja watched u suprotnu vrijednost
// PATCH se koristi kad mijenjamo SAMO DIO zapisa (ovdje jedno svojstvo).
// PUT bi značio zamjenu cijelog zapisa novim podacima.
// ":id" je parametar putanje: za /api/movies/abc-123 -> req.params.id === "abc-123".
// ---------------------------------------------------------------------
app.patch("/api/movies/:id", (req, res) => {
    // find vraća SAM OBJEKT (ili undefined). Objekt je referenca na element
    // u polju, pa promjena movie.watched mijenja i film u polju movies.
    const movie = movies.find(m => m.id === req.params.id);

    if (!movie) {
        // 404 Not Found = traženi film ne postoji.
        // "return" je bitan: bez njega bi se kod nastavio izvršavati i
        // pokušao poslati drugi odgovor (greška "headers already sent").
        res.status(404).send({ error: "Not found" });
        return;
    }

    // ! pretvara true u false i obrnuto ("toggle").
    movie.watched = !movie.watched;
    // Vraćamo promijenjeni film - korisno za provjeru, a klijent ionako
    // nakon toga ponovno dohvaća sve filmove.
    res.send(movie);
});

// ---------------------------------------------------------------------
// Zadatak 1: DELETE /api/movies/:id -> briše film
// ---------------------------------------------------------------------
app.delete("/api/movies/:id", (req, res) => {
    // Ovdje nam treba INDEKS (pozicija u polju), a ne objekt, jer
    // splice briše po poziciji. findIndex vraća -1 ako ništa ne nađe.
    const index = movies.findIndex(m => m.id === req.params.id);

    if (index === -1) {
        res.status(404).send({ error: "Not found" });
        return;
    }

    // splice(index, 1) uklanja 1 element na toj poziciji DIREKTNO iz
    // originalnog polja i vraća polje obrisanih elemenata. S [deleted]
    // uzimamo prvi (jedini) element tog polja.
    const [deleted] = movies.splice(index, 1);
    res.send(deleted);
});

// (dano u predlošku) Poslužitelj sluša na portu 3000 - isti port kao u
// proxy postavci u vite.config.js.
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
