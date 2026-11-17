import express from 'express'
import todos from './todos.js'; //uvoz todos.js

const app = express()

app.use(express.static("../client/"));
app.use(express.urlencoded({ extended: false }));

//omogućuje čitanje podataka iz json formata
app.use(express.json());

let todoList=[...todos]; //lokalna kopija, možemo raditi promjene 

app.get("/hello", (req, res) => {
    res.send({ message: "Hello World" });    
});

app.get("/api/hello", (req, res) => {
    res.send({ message: "Hello World 2" });    
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
//nastavak 1. zad
//GET /todos dohvaćanje svih zapisa
app.get("/api/todos",(req,res)=>{
    res.status(200).json(todoList);
});
app.put("/api/todos/:id",(req,res)=>{
    const {id}=req.params;
    const index=todoList.findIndex((t)=>t.id===id);
    if(index===-1){
        return res.status(404).json({message:"Todo not found"});
    }
    //PUT mijenja cijeli objekt, zadržava se ID, ostalo se mijenja
    todoList[index]={
        id,
        title:req.body.title,
        timestamp:req.body.timestamp,
        done:req.body.done!== undefined? req.body.done : todoList[index].done
    };
    res.status(200).json(todoList[index]);
})
/*
//djelomična izmjena, PATCH mijenja samo dio objekta
app.patch("/api/todos/:id", (req, res) => {
    const { id } = req.params;
    const todo = todoList.find((t) => t.id === id);

    if (!todo) {
        return res.status(404).json({ message: "Zapis nije pronađen" });
    }

    // automatski prebacuje status (true/false) ovisno o nazivu svojstva u todos.js
    if (todo.done !== undefined) {
        todo.done = !todo.done;
    } else if (todo.completed !== undefined) {
        todo.completed = !todo.completed;
    }

    res.status(200).json(todo);
});
*/
app.delete("/api/todos/:id",(req,res)=>{
    const {id}=req.params;
    const index=todoList.findIndex((t)=>t.id===id);
    if(index===-1){
        return res.status(404).json({message:"Todo not found"})
    }
    todoList.splice(index,1); //briše element iz polja na mjestu 
    res.status(200).json(todoList)
})

