// =====================================================================
// KLIJENT - sva logika stranice
// Datoteka je u index.html uključena kao <script type="module">, pa se
// izvršava tek kad je HTML učitan. Varijable iz modula nisu globalne,
// zato gumbe povezujemo s .on(...) ovdje, a ne s onclick="..." u HTML-u.
// =====================================================================

// jQuery instaliran preko npm-a (dan u predlošku).
import $ from "jquery";

// =====================================================================
// Zadatak 1: dohvaćanje podataka
// =====================================================================

// getMovies prima CALLBACK - funkciju koja se pozove kad podaci stignu.
// $.get je ASINKRON: zahtjev putuje do poslužitelja, a JS ne čeka nego
// nastavlja dalje. Podaci postoje tek unutar funkcije koju jQuery pozove
// kad odgovor stigne, pa ih tu predajemo callbacku.
// Primjer: getMovies(console.log) ispiše polje u konzolu,
//          getMovies(renderMovies) ih prikaže na stranici.
const getMovies = (callback) => {
    $.get("/api/movies", (movies) => {
        // jQuery je JSON odgovor već pretvorio u JS polje objekata.
        callback(movies);
    });
};

// =====================================================================
// Zadatak 3: prikaz, filtriranje, promjena statusa, brisanje
// =====================================================================

// Zadnje dohvaćeni filmovi. Filtriranje se radi na klijentu, bez novog
// zahtjeva prema poslužitelju, pa podatke moramo negdje sačuvati.
let movies = [];

// Trenutno odabrani filter: "all", "towatch" ili "watched"
// (iste vrijednosti kao data-filter na gumbima u HTML-u).
let filter = "all";

// Vraća HTML za 5 zvjezdica: prvih "rating" punih, ostale prazne.
// Primjer: rating 3 -> ★★★☆☆
// Petlja ide od 1 do 5; za svaku poziciju odlučimo koju ikonu dodati.
const stars = (rating) => {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html += i <= rating
            ? `<i class="bi bi-star-fill"></i>`
            : `<i class="bi bi-star"></i>`;
    }
    return html;
};

// Stvara jednu karticu (stupac s karticom) za jedan film.
// Vraća jQuery objekt (a ne string) kako bismo na njegove gumbe mogli
// zakačiti event handlere prije nego ga stavimo u stranicu.
const createCard = (movie) => {
    // Sve što ovisi o statusu izračunamo unaprijed (ternarni operator
    // uvjet ? ako_da : ako_ne), da sam HTML ostane pregledan.
    const border = movie.watched ? "border-success" : "";
    const headerClass = movie.watched ? "text-bg-success" : "bg-body-tertiary";
    const status = movie.watched
        ? `<i class="bi bi-eye-fill me-1"></i>Watched`
        : `<i class="bi bi-eye-slash me-1"></i>To watch`;
    const buttonText = movie.watched ? "Mark as unwatched" : "Mark as watched";

    // HTML je kopiran iz zakomentiranog prototipa u index.html, a fiksne
    // vrijednosti zamijenjene su s ${...}.
    // Klase js-toggle i js-remove nemaju stil - služe samo da gumbe
    // pronađemo s find() (prefiks js- je konvencija za to).
    const col = $(`
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm ${border}">
                <div class="card-header d-flex justify-content-between align-items-center ${headerClass}">
                    <span>${status}</span>
                    <span class="badge rounded-pill text-bg-light">${movie.genre}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title mb-1">${movie.title}</h5>
                    <p class="small text-body-secondary mb-2">${movie.year}</p>
                    <div class="text-warning">${stars(movie.rating)}</div>
                </div>
                <div class="card-footer bg-transparent d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary flex-fill js-toggle">${buttonText}</button>
                    <button type="button" class="btn btn-sm btn-outline-danger js-remove"><i class="bi bi-trash3"></i></button>
                </div>
            </div>
        </div>
    `);

    // col.find(...) traži SAMO unutar ove kartice, pa svaki gumb dobije
    // handler za svoj film. Arrow funkcija "zapamti" (closure) baš ovaj
    // movie i ovaj col, iako se createCard poziva za svaki film.
    col.find(".js-toggle").on("click", () => toggleWatched(movie.id));
    col.find(".js-remove").on("click", () => removeMovie(movie.id, col));
    return col;
};

// Prikazuje filmove prema trenutnom filteru i osvježava brojač.
// Callback za getMovies, ali ga zovemo i direktno pri promjeni filtera.
const renderMovies = (data) => {
    // Spremimo sve dohvaćene filmove (za filtriranje bez novog zahtjeva).
    movies = data;

    // Brojač u navigaciji računa se iz SVIH filmova, ne samo prikazanih -
    // zato je prije filtriranja.
    const watchedCount = movies.filter(m => m.watched).length;
    $("#counter").text(`${watchedCount} / ${movies.length} watched`);

    // Odaberemo filmove za prikaz. filter() vraća NOVO polje, a "movies"
    // ostaje netaknut za sljedeći put.
    let visible = movies;
    if (filter === "watched") visible = movies.filter(m => m.watched);
    if (filter === "towatch") visible = movies.filter(m => !m.watched);

    const container = $("#movies");
    // empty() obriše stare kartice - bez toga bi se svaki render DODAO
    // ispod prethodnog i kartice bi se duplicirale.
    container.empty();
    visible.forEach(movie => container.append(createCard(movie)));
};

// Klik na filter (nav-pills).
// "function" umjesto arrow funkcije: samo tada "this" pokazuje na gumb
// koji je kliknut, pa ga možemo dohvatiti s $(this).
$(".nav-pills .nav-link").on("click", function () {
    // Klasa active pripada samo odabranom gumbu: maknemo je sa svih,
    // pa je dodamo kliknutom.
    $(".nav-pills .nav-link").removeClass("active");
    $(this).addClass("active");

    // .data("filter") čita atribut data-filter="..." s gumba.
    filter = $(this).data("filter");

    // Ponovno prikažemo već dohvaćene filmove - bez zahtjeva prema poslužitelju.
    renderMovies(movies);
});

// Mijenja status odgledano / nije odgledano.
// $.get postoji samo za GET; za PATCH, DELETE i ostale metode koristi se
// $.ajax s opcijom method.
const toggleWatched = (id) => {
    $.ajax({
        method: "PATCH",
        url: `/api/movies/${id}`,   // id ide u putanju -> req.params.id na poslužitelju
        success: () => {
            // Poslužitelj je promijenio podatak - dohvatimo svježe podatke
            // i ponovno prikažemo (renderMovies zadrži odabrani filter).
            getMovies(renderMovies);
        }
    });
};

// Briše film. col je jQuery objekt kartice (stupca) - prosljeđuje ga
// createCard kako bismo baš tu karticu mogli animirati.
const removeMovie = (id, col) => {
    $.ajax({
        method: "DELETE",
        url: `/api/movies/${id}`,
        success: () => {
            // Animacija tek NAKON uspješnog odgovora - ako brisanje ne
            // uspije, kartica ne smije nestati.
            // fadeOut(400, callback): kartica 400 ms postupno nestaje, a
            // callback se izvrši kad animacija završi. Novi dohvat je u
            // callbacku jer bi empty() u renderu odmah prekinuo animaciju.
            col.fadeOut(400, () => {
                getMovies(renderMovies);
            });
        }
    });
};

// $(() => {...}) = $(document).ready: kad je DOM spreman, prvi put
// dohvatimo i prikažemo filmove.
$(() => {
    getMovies(renderMovies);
});
