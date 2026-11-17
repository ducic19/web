// =====================================================================
// KLIJENT - sva logika stranice
// Ova datoteka je u index.html uključena kao <script type="module">.
// "module" skripte se izvršavaju tek nakon što je HTML učitan, a varijable
// iz njih NISU globalne (nisu na window) - zato gumbe povezujemo s .on(...)
// u ovoj datoteci, a ne s onclick="..." u HTML-u.
// =====================================================================

// jQuery instaliran preko npm-a; Vite ga pronađe u node_modules.
import $ from "jquery";
// Iz Bootstrapa uvozimo samo klasu Toast jer nam treba za "new Toast(...)".
// (main.js već uvozi cijeli Bootstrap JS, ali nama treba referenca na klasu.)
import { Toast } from "bootstrap";

// =====================================================================
// Zadatak 1: dohvaćanje podataka
// =====================================================================

// Globalno stanje filtera i sortiranja.
// Varijable su IZVAN funkcija kako bi ih mogli čitati getExpenses, a mijenjati
// event handleri za selectove (Zadatak 3). "let" jer se vrijednost mijenja.
let category = "";   // "" znači sve kategorije
let sort = "date";   // "date" ili "amount" - ista vrijednost kao <option value> u HTML-u

// Funkcija za dohvaćanje troškova.
// Prima CALLBACK - funkciju koja će se pozvati kad podaci stignu.
// Zašto callback? $.get je ASINKRON: zahtjev putuje do poslužitelja, a JS ne
// čeka nego nastavlja dalje. Podaci postoje tek unutar funkcije koju
// jQuery pozove kad odgovor stigne - tu ih prosljeđujemo callbacku.
// Tako ista funkcija može služiti za različite stvari: getExpenses(renderExpenses),
// getExpenses(console.log) itd.
const getExpenses = (callback) => {
    // URLSearchParams od objekta složi query string i sam pazi na "&" i
    // posebne znakove: { sort: "amount" } -> "sort=amount".
    const params = new URLSearchParams({ sort });
    // category dodajemo samo ako je odabran - "" je "falsy" pa se preskače,
    // tako ne šaljemo besmisleni "?category=".
    if (category) params.set("category", category);

    // Template string `${params}` automatski pozove params.toString().
    // Primjer konačnog URL-a: /api/expenses?sort=amount&category=food
    $.get(`/api/expenses?${params}`, (expenses) => {
        // jQuery je JSON odgovor već pretvorio u JS polje objekata.
        callback(expenses);
    });
};

// =====================================================================
// Zadatak 3: renderiranje
// =====================================================================

// Objekt koji svakoj kategoriji pridružuje naziv, ikonu i Bootstrap boju.
// Ključevi su iste vrijednosti kao u podacima ("food", "transport", ...),
// pa do podataka dođemo s CATEGORIES[expense.category].
// Prednost pred if/else ili switch: sve je na jednom mjestu, a nova kategorija
// je samo jedan novi redak. Velika slova u imenu su konvencija za konstante.
const CATEGORIES = {
    food:      { label: "Food",      icon: "bi-cart",       color: "success" },
    transport: { label: "Transport", icon: "bi-bus-front",  color: "info" },
    bills:     { label: "Bills",     icon: "bi-receipt",    color: "warning" },
    fun:       { label: "Fun",       icon: "bi-controller", color: "danger" }
};

// Formatiranje iznosa kao valute prema hrvatskim pravilima:
// decimalni zarez, razmak i znak € iza broja -> 42.35 postaje "42,35 €".
// Formatter se stvara JEDNOM (izvan funkcije) jer je stvaranje "skupo",
// a format() se zove za svaku stavku.
const money = new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" });
const formatMoney = (amount) => money.format(amount);

// Datum: string "2026-11-02" -> Date objekt -> hrvatski zapis "02. 11. 2026."
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("hr-HR");

// Zadnje dohvaćeni zapisi s poslužitelja.
// Pretraga (Zadatak 3) ne šalje novi zahtjev, nego filtrira OVO polje,
// zato ga moramo negdje sačuvati.
let current = [];

// id zapisa koji se trenutno uređuje (Zadatak 4).
// null = forma je u načinu dodavanja, string = u načinu uređivanja.
// Na temelju toga saveExpense odlučuje šalje li POST ili PUT.
let editId = null;

// Stvara jedan <li> element za jedan trošak.
// Vraća jQuery objekt (a ne string) kako bismo na njega mogli odmah
// "zakačiti" event handlere prije nego ga stavimo u stranicu.
const createItem = (expense) => {
    // Podaci o kategoriji ovog troška, npr. { label: "Food", icon: "bi-cart", color: "success" }
    const cat = CATEGORIES[expense.category];

    // $(`...HTML...`) - jQuery od HTML stringa napravi stvarne DOM elemente.
    // Boje su složene iz imena boje: bg-success-subtle (svijetla pozadina)
    // i text-success-emphasis (tamnija boja ikone) - zato je u CATEGORIES
    // spremljeno samo "success", a ne cijela klasa.
    // flex-grow-1 na srednjem dijelu "gura" iznos i gumbe na desni rub.
    // text-nowrap sprječava da se "42,35 €" prelomi u dva retka na uskim zaslonima.
    // Klase js-edit i js-delete služe SAMO za pronalaženje gumba u JS-u
    // (prefiks js- označava da nemaju nikakav stil).
    const li = $(`
        <li class="list-group-item d-flex align-items-center gap-3 py-3">
            <span class="badge fs-5 p-2 rounded-3 bg-${cat.color}-subtle text-${cat.color}-emphasis">
                <i class="bi ${cat.icon}"></i>
            </span>
            <div class="flex-grow-1">
                <div class="fw-semibold">${expense.title}</div>
                <div class="small text-body-secondary">${formatDate(expense.date)} · ${cat.label}</div>
            </div>
            <span class="fw-bold text-nowrap">${formatMoney(expense.amount)}</span>
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-secondary js-edit"><i class="bi bi-pencil"></i></button>
                <button type="button" class="btn btn-outline-danger js-delete"><i class="bi bi-trash3"></i></button>
            </div>
        </li>
    `);

    // Zadatak 4: zapis koji se upravo uređuje istaknut je primarnom bojom.
    // Provjera je ovdje (pri stvaranju) jer se popis često ponovno renderira,
    // pa bi se ručno dodana klasa izgubila.
    if (expense.id === editId) li.addClass("list-group-item-primary");

    // li.find(...) traži SAMO unutar ove stavke, pa svaki gumb dobije
    // handler za svoj zapis. Arrow funkcija "zapamti" (closure) baš ovaj
    // expense i ovaj li, iako se createItem pozove za svaki zapis.
    li.find(".js-edit").on("click", () => startEdit(expense));
    li.find(".js-delete").on("click", () => removeExpense(expense.id, li));
    return li;
};

// Renderira popis troškova u <ul id="expenses">.
// Ovo je callback za getExpenses, ali je zovemo i direktno pri pretrazi
// i ulasku u uređivanje - zato prima polje kao parametar.
const renderExpenses = (expenses) => {
    // Spremimo zadnje dohvaćene podatke za pretragu (vidi "current" gore).
    current = expenses;

    const list = $("#expenses");
    // empty() briše sve stare stavke - bez toga bi se svaki render
    // DODAO ispod prethodnog i stavke bi se duplicirale.
    list.empty();

    // Pretraga je ugrađena u render, pa se automatski primjenjuje i nakon
    // svakog novog dohvaćanja (filter, sort, dodavanje, brisanje...).
    // toLowerCase() na obje strane -> "TAXI" i "taxi" se smatraju istima.
    // Prazan string je sadržan u svakom stringu, pa prazna pretraga prikaže sve.
    const term = $("#search").val().trim().toLowerCase();
    const visible = expenses.filter(e => e.title.toLowerCase().includes(term));

    // Prazno stanje: korisnik mora vidjeti zašto nema ničega, a ne prazan okvir.
    if (visible.length === 0) {
        list.append(`<li class="list-group-item text-center text-body-secondary py-4">No expenses found.</li>`);
        return;   // nema smisla nastaviti
    }
    visible.forEach(e => list.append(createItem(e)));
};

// Dohvaća sažetak s poslužitelja i upisuje ga u tri kartice sa statistikom.
// Statistika se računa na poslužitelju (iz SVIH zapisa), pa se ne mijenja
// kad korisnik filtrira ili pretražuje - samo kad se podaci stvarno promijene.
const loadSummary = () => {
    // Destrukturiranje u parametru: odgovor { total, count, top } odmah
    // raspakiramo u tri varijable.
    $.get("/api/summary", ({ total, count, top }) => {
        // .text() za obične vrijednosti (sigurno - ne tumači HTML)
        $("#total").text(formatMoney(total));
        $("#count").text(count);
        // .html() jer ubacujemo i <i> ikonu.
        // top je null kad nema zapisa -> tada bi CATEGORIES[null] bio undefined
        // i .icon bi bacio grešku, zato prvo provjerimo (ternarni operator).
        $("#top").html(top
            ? `<i class="bi ${CATEGORIES[top].icon} text-${CATEGORIES[top].color} me-1"></i>${CATEGORIES[top].label}`
            : "–");
    });
};

// Ponovno dohvati sve što ovisi o podacima na poslužitelju.
// Zove se nakon svake promjene (dodavanje, uređivanje, brisanje) i pri učitavanju.
// Dva zahtjeva idu paralelno - nije bitno koji prvi završi.
const refresh = () => {
    getExpenses(renderExpenses);
    loadSummary();
};

// Promjena kategorije ili sortiranja -> novi zahtjev s drugim parametrima upita.
// Event "change" kod <select> okida se kad korisnik odabere drugu opciju.
// Koristimo "function" (a ne arrow funkciju) jer tada "this" pokazuje na
// element koji je izazvao događaj, pa $(this).val() daje odabranu vrijednost.
// Statistiku ne osvježavamo jer se podaci nisu promijenili.
$("#filter-category").on("change", function () {
    category = $(this).val();
    getExpenses(renderExpenses);
});
$("#sort").on("change", function () {
    sort = $(this).val();
    getExpenses(renderExpenses);
});

// Pretraga uživo.
// Event "input" okida se pri SVAKOM unesenom ili obrisanom znaku
// (i kad korisnik klikne "x" u polju type="search").
// "change" bi se okinuo tek kad polje izgubi fokus - to nije "uživo".
// Ne šaljemo novi zahtjev: samo ponovno renderiramo već dohvaćene zapise,
// a renderExpenses sama pročita tekst iz polja i filtrira.
$("#search").on("input", () => renderExpenses(current));

// Brisanje zapisa.
// li je jQuery objekt stavke - prosljeđuje ga createItem kako bismo baš
// tu stavku mogli animirati.
const removeExpense = (id, li) => {
    // $.get postoji samo za GET; za DELETE, PUT itd. koristi se $.ajax s method.
    $.ajax({
        method: "DELETE",
        url: `/api/expenses/${id}`,   // id ide u putanju -> req.params.id na poslužitelju
        success: () => {
            // Ako se briše zapis koji je bio otvoren u formi za uređivanje,
            // forma se mora vratiti u početno stanje - inače bi "Save changes"
            // slao PUT za zapis koji više ne postoji (404).
            if (id === editId) resetForm();

            // Animacija TEK nakon uspješnog odgovora - ako brisanje ne uspije,
            // stavka ne smije nestati.
            // slideUp(300, callback): stavka se 300 ms "zatvara" prema gore,
            // a callback se izvrši kad animacija završi. refresh je u callbacku
            // jer bi ga ponovno renderiranje (empty()) odmah prekinulo.
            li.slideUp(300, () => {
                refresh();
                showToast("Expense deleted.");
            });
        }
    });
};

// =====================================================================
// Zadatak 4: forma za dodavanje i uređivanje, toast
// =====================================================================

// Instanca Bootstrap Toast komponente - napravi se jednom, pa je pokazujemo
// po potrebi. Prima DOM element (ne jQuery objekt), zato getElementById.
// delay: toast se sam sakrije nakon 2.5 s.
const toast = new Toast(document.getElementById("toast"), { delay: 2500 });

// Jedan toast za sve poruke: promijenimo tekst pa ga pokažemo.
const showToast = (message) => {
    $("#toast-text").text(message);
    toast.show();
};

// Današnji datum u obliku koji traži <input type="date">: "YYYY-MM-DD".
// toISOString() vraća npr. "2026-11-16T13:45:00.000Z" - prvih 10 znakova
// je upravo datum. (Napomena: ISO je u UTC-u, pa oko ponoći datum može biti
// dan ranije - za ovaj zadatak to je dovoljno dobro.)
// Funkcija, a ne konstanta, kako bi uvijek vratila TRENUTNI datum.
const today = () => new Date().toISOString().slice(0, 10);

// Vraća formu u početno stanje (način dodavanja).
// Poziva se nakon uspješnog spremanja, na "Cancel" i pri brisanju
// zapisa koji se uređuje.
const resetForm = () => {
    editId = null;   // sljedeći submit će biti POST

    // reset() je metoda DOM elementa <form>, a ne jQuery objekta.
    // [0] iz jQuery objekta izvuče prvi (jedini) pravi DOM element.
    // reset() vrati sva polja na početne vrijednosti iz HTML-a.
    $("#expense-form")[0].reset();
    // reset() bi datum ostavio praznim, a mi želimo današnji.
    $("#date").val(today());

    // Uklonimo crvene oznake grešaka s prethodnog pokušaja.
    $("#expense-form .is-invalid").removeClass("is-invalid");

    // Vratimo izgled načina dodavanja (.html jer naslov sadrži ikonu).
    $("#form-title").html(`<i class="bi bi-plus-circle text-primary me-2"></i>New expense`);
    $("#submit-btn").text("Add expense");
    // d-none je Bootstrap klasa za display: none -> sakrije "Cancel".
    $("#cancel-btn").addClass("d-none");

    // Maknemo isticanje stavke koja se uređivala.
    $("#expenses .list-group-item-primary").removeClass("list-group-item-primary");
};

// Prebacuje formu u način uređivanja i popunjava je podacima odabranog zapisa.
const startEdit = (expense) => {
    // Pamtimo id - saveExpense ga koristi za PUT /api/expenses/:id.
    editId = expense.id;

    // .val(vrijednost) POSTAVLJA vrijednost kontrole (.val() bez argumenta je čita).
    // Kod <select> .val("bills") odabere opciju s value="bills".
    // Datum je već u obliku "YYYY-MM-DD" pa ga input type="date" prihvaća direktno.
    $("#title").val(expense.title);
    $("#amount").val(expense.amount);
    $("#category").val(expense.category);
    $("#date").val(expense.date);
    $("#expense-form .is-invalid").removeClass("is-invalid");

    // Izgled načina uređivanja.
    $("#form-title").html(`<i class="bi bi-pencil-square text-primary me-2"></i>Edit expense`);
    $("#submit-btn").text("Save changes");
    $("#cancel-btn").removeClass("d-none");   // pokaži "Cancel"

    // Ponovni render iz "current" (bez zahtjeva) - createItem sada vidi
    // novi editId i doda list-group-item-primary pravoj stavci, a staroj
    // istaknutoj stavci klasa nestane jer se cijeli popis ponovno gradi.
    renderExpenses(current);

    // Fokus na prvo polje: korisnik može odmah tipkati, a na mobitelu
    // se stranica pomakne do forme.
    $("#title").trigger("focus");
};

// "Cancel" samo vraća formu u početno stanje - ništa se ne šalje.
$("#cancel-btn").on("click", resetForm);

// Validacija forme na klijentu.
// Bootstrap prikazuje .invalid-feedback poruku koja se nalazi uz kontrolu
// SAMO kad kontrola ima klasu is-invalid - mi tu klasu dodajemo i uklanjamo.
const validate = () => {
    // Polje parova [selektor, je_li_ispravno] - tako sve 4 provjere obradimo
    // istim kodom umjesto 4 gotovo ista if-a.
    const checks = [
        ["#title", $("#title").val().trim() !== ""],      // trim: "   " nije naslov
        ["#amount", Number($("#amount").val()) > 0],      // prazno -> 0, a 0 nije > 0
        ["#category", $("#category").val() !== ""],       // "Choose..." ima value=""
        ["#date", $("#date").val() !== ""]
    ];

    // toggleClass(klasa, uvjet): dodaje klasu kad je uvjet true, uklanja kad je false.
    // !ok -> neispravna kontrola DOBIJE is-invalid, ispravna je IZGUBI
    // (bitno kad korisnik ispravi grešku i ponovno pošalje formu).
    checks.forEach(([selector, ok]) => $(selector).toggleClass("is-invalid", !ok));

    // every vraća true samo ako je SVAKA provjera ispravna.
    // [, ok] preskoči prvi element para (selektor) i uzme samo drugi.
    return checks.every(([, ok]) => ok);
};

// Jedan handler za oba načina rada: POST za novi zapis, PUT za uređivanje.
// Vezan je na "submit" događaj FORME (a ne na click gumba), pa radi i
// kad korisnik pritisne Enter u nekom polju.
const saveExpense = (e) => {
    // Zadano ponašanje forme je poslati podatke i ponovno učitati stranicu.
    // preventDefault() to zaustavlja - podatke šaljemo sami preko AJAX-a.
    e.preventDefault();

    // Ako bilo što nije ispravno, ne šaljemo ništa (greške su već prikazane).
    if (!validate()) return;

    // Objekt koji šaljemo poslužitelju - imena svojstava moraju odgovarati
    // onima koja poslužitelj čita iz req.body.
    const expense = {
        title: $("#title").val().trim(),
        // .val() uvijek vraća STRING ("18.90"); Number ga pretvara u broj.
        amount: Number($("#amount").val()),
        category: $("#category").val(),
        date: $("#date").val()
    };

    // Stanje spremamo u lokalnu varijablu jer resetForm() u success-u
    // postavi editId na null - a poruka toasta mora znati što je bilo.
    const editing = editId !== null;

    $.ajax({
        method: editing ? "PUT" : "POST",
        url: editing ? `/api/expenses/${editId}` : "/api/expenses",
        // contentType govori poslužitelju da je tijelo JSON -> express.json() ga parsira.
        // JSON.stringify pretvara objekt u JSON string. Bez toga bi jQuery poslao
        // podatke kao "title=...&amount=..." i svi bi tipovi postali stringovi.
        contentType: "application/json",
        data: JSON.stringify(expense),
        success: () => {
            resetForm();
            refresh();
            showToast(editing ? "Expense updated." : "Expense added.");
        }
    });
};

$("#expense-form").on("submit", saveExpense);

// Čim korisnik promijeni neispravnu kontrolu, oznaka greške nestane.
// Delegirani event: handler je na formi, a drugi argument ".is-invalid"
// znači da se izvrši samo ako je događaj došao s elementa koji U TOM
// TRENUTKU ima klasu is-invalid. Zato ne moramo handlere dodavati i
// uklanjati svaki put kad se klasa promijeni.
// "input" pokriva tipkanje, "change" pokriva <select> i odabir datuma.
$("#expense-form").on("input change", ".is-invalid", function () {
    $(this).removeClass("is-invalid");
});

// $(() => { ... }) je skraćenica za $(document).ready(...): kod se izvrši
// kad je DOM spreman. Ovdje postavimo današnji datum i učitamo podatke
// i statistiku prvi put.
$(() => {
    $("#date").val(today());
    refresh();
});
