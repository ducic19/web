import crypto from "crypto";

const todos = [
  {id:crypto.randomUUID(), title: "Buy groceries",     timestamp: 1764845228329, done: true },
  {id:crypto.randomUUID(), title: "Email client",      timestamp: 1764845228329, done: true  },
  {id:crypto.randomUUID(), title: "Clean desk",        timestamp: 1764931675258, done: false },
  {id:crypto.randomUUID(), title: "Pay bills",         timestamp: 1765104490843, done: false },
  {id:crypto.randomUUID(), title: "Read 20 pages",     timestamp: 1765018057945, done: false  },
  {id:crypto.randomUUID(), title: "Workout",           timestamp: 1765104490843, done: true },
  {id:crypto.randomUUID(), title: "Plan weekly tasks", timestamp: 1764845228329, done: true },
  {id:crypto.randomUUID(), title: "Water plants",      timestamp: 1765018057945, done: false  },
  {id:crypto.randomUUID(),  title: "Review code",       timestamp: 1764931675258, done: false }
]
//export default todos.map(todo=> ({id:crypto.randomUUID(),...todo}));
//mapiranje uuid-a za svaki todo, da se ne ponavlja id i da ne pises isto puno puta
export default todos; //da se moze uvest u index.js