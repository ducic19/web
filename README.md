pomoc za web :/

Kako sam pokrenuti (dva terminala)

Terminal 1 — poslužitelj:
cd /Users/emaducic/web/miaprobni/rjesenje/server
npm install
npm run nodemon

Terminal 2 — klijent:
cd /Users/emaducic/web/miaprobni/rjesenje/client
npm install
npm run vite
Zatim otvori http://localhost:8080.

Redoslijed je važan: server prvi, jer ako Vite učita stranicu dok server još ne sluša, tablica ostane prazna (osvježi stranicu nakon što se server digne).

