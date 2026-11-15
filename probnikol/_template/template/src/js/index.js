import $ from "jquery";

//3.zad
// lokalna kopija zapisa na klijentu, nadograđuje se zajedno s poslužiteljem
let todoList = [];

// fade-in se radi samo pri prvom učitavanju, ne i kod kasnijih promjena
let prvoUcitavanje = true;

// $.get vraća jqXHR objekt (thenable), pa se na njega može lančati .done() ili await-ati
export function get_todos() {
  return $.get("/api/todos");
}

// pretvara broj milisekundi od Unix epohe u format M/D/YYYY (npr. 12/4/2025)
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US");
}

// ikona statusa ovisno o tome je li zapis gotov
function statusIcon(done) {
  return done
    ? '<i class="bi bi-check-circle-fill text-success"></i>'
    : '<i class="bi bi-x-circle-fill text-danger"></i>';
}

//3.zad
// HTML predložak za jednu karticu, napravljen prema zakomentiranom prototipu iz index.html
const kartica = (todo) => {
  const $kartica = $(`
    <div class="col">
      <div class="card shadow-sm rounded-4 border h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-2"></h5>
          <p class="card-text mb-2">
            <strong>When:</strong> ${formatDate(todo.timestamp)}
          </p>
          <p class="card-text mb-3">
            <strong>Status:</strong> <span class="status">${statusIcon(todo.done)}</span>
          </p>
          <div class="d-flex flex-column flex-md-row gap-2 gap-md-4 mt-auto">
            <button type="button" class="btn btn-light border flex-grow-1 rounded-pill btn-toggle">Toggle</button>
            <button type="button" class="btn btn-light border flex-grow-1 rounded-pill btn-remove">Remove</button>
          </div>
        </div>
      </div>
    </div>
  `);

  // naslov preko .text() da se HTML iz podataka ne izvrši
  $kartica.find(".card-title").text(todo.title);

  $kartica.find(".btn-toggle").on("click", () => toggleTodo(todo.id, $kartica));
  $kartica.find(".btn-remove").on("click", () => removeTodo(todo.id, $kartica));

  return $kartica;
};

//3.zad
// iscrtava sve zapise koje dobije kao parametar
const renderTodos = (data) => {
  todoList = data;

  const $todosContainer = $("#todos-container").empty();

  data.forEach((todo) => {
    const $kartica = kartica(todo);

    // append, pa ako je prvo učitavanje hide + fadeIn
    $todosContainer.append($kartica);

    if (prvoUcitavanje) {
      $kartica.hide().fadeIn(800);
    }
  });

  prvoUcitavanje = false;
};

//3.zad
// mijenja status na poslužitelju (PUT), zatim na klijentu i u prikazu
export function toggleTodo(id, $kartica) {
  const todo = todoList.find((t) => t.id === id);
  if (!todo) return;

  const updated = { ...todo, done: !todo.done };

  $.ajax({
    url: `/api/todos/${id}`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(updated),
  })
    .done((saved) => {
      Object.assign(todo, saved);
      $kartica.find(".status").html(statusIcon(saved.done));
    })
    .fail((error) => console.error("Greška pri promjeni statusa:", error));
}

//3.zad
// briše zapis na poslužitelju (DELETE), zatim na klijentu i iz prikaza
export function removeTodo(id, $kartica) {
  $.ajax({
    url: `/api/todos/${id}`,
    method: "DELETE",
  })
    .done(() => {
      todoList = todoList.filter((t) => t.id !== id);
      $kartica.remove();
    })
    .fail((error) => console.error("Greška pri brisanju:", error));
}

//3.zad
// pri učitavanju dohvati zapise i predaj ih renderTodos
$(() => {
  get_todos()
    .done(renderTodos)
    .fail((error) => console.error("Greška pri dohvatu:", error));
});
