import $ from "jquery";

// lokalna kopija zapisa na klijentu, nadograđuje se zajedno s poslužiteljem
let todos = [];

// $.get vraća jqXHR objekt (thenable), pa se na njega može lančati .done() ili await-ati
export function get_todos() {
  return $.get("/api/todos");
}

// pretvara broj milisekundi od Unix epohe u format M/D/YYYY (npr. 12/4/2025)
function format_date(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US");
}

// ikona statusa ovisno o tome je li zapis gotov
function status_icon(done) {
  return done
    ? '<i class="bi bi-check-circle-fill text-success"></i>'
    : '<i class="bi bi-x-circle-fill text-danger"></i>';
}

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

// dohvaća zapise preko get_todos i iscrtava ih u #todos-container
export function render_todos() {
  get_todos()
    .done((data) => {
      todos = data;
      const $container = $("#todos-container").empty();

      todos.forEach((todo, i) => {
        // fade-in: kartica kreće nevidljiva i postupno se pojavljuje, svaka malo kasnije
        create_card(todo)
          .css("opacity", 0)
          .appendTo($container)
          .delay(i * 100)
          .fadeTo(600, 1);
      });
    })
    .fail((error) => console.error("Greška pri dohvatu:", error));
}

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

$(() => {
  render_todos();
});
