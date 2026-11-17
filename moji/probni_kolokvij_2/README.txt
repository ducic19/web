PROBNI KOLOKVIJ 2 — Web programiranje
=====================================

Sadržaj mape
------------
kolokvij_2.pdf        tekst kolokvija (2 stranice, 60 bodova)
kolokvij_2_rjesenje.pdf  rješenje zadataka s objašnjenjima (16 stranica)
zad_1.png             kako treba izgledati rješenje Zadatka 1 (kartice bez gumba)
zad_2_1.png           Zadatak 2 — kartice s gumbom za uređivanje
zad_2_2.png           Zadatak 2 — otvoren modal s popunjenim podacima
copy.txt              polje putovanja koje se kopira u server/trips.js
custom_bootstrap/     predložak s kojim se kreće (Vite + Bootstrap, bez jQueryja)
custom_bootstrap.zip  isti predložak u zipu

Koncept: Trips App (kartice, ne tablica)
---------------------------------------
- Mreža kartica: row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4
- Kartica: card / card-body / shadow-sm, naslov, datum, ikona statusa
- Gumb za uređivanje: btn btn-sm btn-outline-primary + ikona pencil
- Polje: trips. Ruta: /api/trips. Datumsko polje: date, zastavica: visited
- Primarna boja #b91c1c (crvena), font Rubik, ikona u navigaciji compass

Isto znanje kao na kolegiju, ali drugi izgled i druga struktura DOM-a:
jQuery kroz npm, Sass prilagodba, Bootstrap Icons, Express + GET,
callback (getTrips -> renderTripCards), UUID, Modal bez naslova, hide,
openEditModal (val/prop), event handler na gumbu, PUT, submit, window.*,
brisanje node_modules. Statička mapa (express.static) namjerno NIJE dio
zadatka — poslužitelj služi samo /api rute, a klijent ide preko Vitea.

Pokretanje (dva terminala)
--------------------------
Terminal 1 — poslužitelj (mapu server gradiš sam, prema Zadatku 1):
    cd custom_bootstrap
    mkdir server && cd server
    npm init -y
    npm install express nodemon
    npm run nodemon

Terminal 2 — klijent:
    cd custom_bootstrap
    npm install
    npm install jquery bootstrap-icons
    npm run vite

Zatim otvori http://localhost:8080

Napomena: predložak namjerno nema mapu server/ ni uvezen jQuery — to je dio zadatka.
