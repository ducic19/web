import $ from "jquery";

//3.zad
// lokalna kopija zapisa na klijentu, nadograđuje se zajedno s poslužiteljem
let todos = [];

// $.get vraća jqXHR objekt (thenable), pa se na njega može lančati .done() ili await-ati
export function get_todos() {
  return $.get("/api/todos");
}

//3.zad
// pretvara broj milisekundi od Unix epohe u format M/D/YYYY (npr. 12/4/2025)
function format_date(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US");
}

//3.zad
// ikona statusa ovisno o tome je li zapis gotov
function status_icon(done) {
  return done
    ? '<i class="bi bi-check-circle-fill text-success"></i>'
    : '<i class="bi bi-x-circle-fill text-danger"></i>';
}

//3.zad
// kartica napravljena prema zakomentiranom prototipu iz index.html
function create_card(todo) {
  const $card = $(`
    <div class="col">
      <div class="card shadow-sm rounded-4 h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-2"></h5>
          <p class="card-text mb-2">
            <strong>When:</strong> ${format_date(todo.timestamp)}
          </p>
          <p class="card-text mb-3">
            <strong>Status:</strong> <span class="status">${status_icon(todo.done)}</span>
          </p>
          <div class="d-flex flex-column flex-md-row gap-2 gap-md-4 mt-auto">
            <button class="btn btn-light border flex-grow-1 rounded-pill btn-toggle">Toggle</button>
            <button class="btn btn-light border flex-grow-1 rounded-pill btn-remove">Remove</button>
          </div>
        </div>
      </div>
    </div>
  `);

  // naslov preko .text() da se HTML iz podataka ne izvrši
  $card.find(".card-title").text(todo.title);

  $card.find(".btn-toggle").on("click", () => toggle(todo.id, $card));
  $card.find(".btn-remove").on("click", () => remove(todo.id, $card));

  return $card;
}

//3.zad
// dohvaća zapise preko get_todos i iscrtava ih u #todos-container
export function render_todos() {
  get_todos()
    .done((data) => {
      todos = data;
      const $container = $("#todos-container").empty();

      todos.forEach((todo) => {
        // fade-in: kartica se sakrije (hide), doda u kontejner i postupno pojavi (fadeIn)
        create_card(todo).hide().appendTo($container).fadeIn(800);
      });
    })
    .fail((error) => console.error("Greška pri dohvatu:", error));
}

//3.zad
// mijenja status na poslužitelju (PUT), zatim na klijentu i u prikazu
export function toggle(id, $card) {
  const todo = todos.find((t) => t.id === id);
  const updated = { ...todo, done: !todo.done };

  $.ajax({
    url: `/api/todos/${id}`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(updated),
  })
    .done((saved) => {
      todo.done = saved.done;
      $card.find(".status").html(status_icon(saved.done));
    })
    .fail((error) => console.error("Greška pri promjeni statusa:", error));
}

//3.zad
// briše zapis na poslužitelju (DELETE), zatim na klijentu i iz prikaza
export function remove(id, $card) {
  $.ajax({
    url: `/api/todos/${id}`,
    method: "DELETE",
  })
    .done(() => {
      todos = todos.filter((t) => t.id !== id);
      $card.remove();
    })
    .fail((error) => console.error("Greška pri brisanju:", error));
}

//3.zad
$(() => {
  render_todos();
});

//3.zad DRUGI NAČIN – render kao na vježbama 3 (createMovieLi / renderMovies / fetchMovies)
// Blok ispod je zakomentiran (/* ... */) da se ne sudara s funkcijama iznad (ista imena).
//
// RAZLIKA:
//   - sadašnji način: render_todos() sam zove get_todos() – dohvat i crtanje u jednoj funkciji
//   - način s vježbi: dohvat i crtanje su odvojeni – get_todos dohvati podatke i preda ih
//     render_todos(data), a render_todos samo crta ono što dobije
//     (kao fetchMovies(renderMovies) na vježbama 3)
//
// KAKO PREBACITI NA OVAJ NAČIN:
//   1. Gore zakomentiraj (označi redke + Cmd + /):
//        - function create_card(todo) { ... }
//        - export function render_todos() { ... }
//        - $(() => { render_todos(); });
//   2. Ovdje obriši redak /* (odmah ispod ovih komentara) i redak */ (zadnji redak datoteke).
//   3. NE diraj: get_todos, format_date, status_icon, toggle, remove – koriste ih oba načina.
//   4. index.html se NE mijenja – #todos-container ostaje isti.
//
// USPOREDBA S VJEŽBAMA 3:
//   createMovieLi(movie)              -> createTodoCard(todo)
//   renderMovies(movies)              -> render_todos(data)
//   $(() => fetchMovies(renderMovies)) -> $(() => get_todos().done(render_todos))
//   (get_todos vraća zahtjev umjesto da prima callback, pa se render predaje kroz .done)
/*

// jedna kartica (kao createMovieLi) – gumbe vežemo ovdje, dok znamo todo.id
const createTodoCard = (todo) => {
    const card = $(`
        <div class="col">
            <div class="card shadow-sm rounded-4 h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title mb-2">${todo.title}</h5>
                    <p class="card-text mb-2">
                        <strong>When:</strong> ${format_date(todo.timestamp)}
                    </p>
                    <p class="card-text mb-3">
                        <strong>Status:</strong> <span class="status">${status_icon(todo.done)}</span>
                    </p>
                    <div class="d-flex flex-column flex-md-row gap-2 gap-md-4 mt-auto">
                        <button class="btn btn-light border flex-grow-1 rounded-pill btn-toggle">Toggle</button>
                        <button class="btn btn-light border flex-grow-1 rounded-pill btn-remove">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    card.find(".btn-toggle").on("click", () => {
        toggle(todo.id, card);
    });

    card.find(".btn-remove").on("click", () => {
        remove(todo.id, card);
    });

    return card;
}

// iscrtava sve zapise koje dobije kao parametar (kao renderMovies)
export const render_todos = (data) => {
    todos = data;
    const todosContainer = $("#todos-container");
    todosContainer.empty();
    todos.forEach(todo => {
        const card = createTodoCard(todo);
        // fade-in: sakrij, dodaj u kontejner, postupno prikaži
        card.hide();
        todosContainer.append(card);
        card.fadeIn(800);
    });
}

// pri učitavanju: dohvati zapise i predaj ih render_todos (kao fetchMovies(renderMovies))
$(() => {
    get_todos().done(render_todos);
});
*/
