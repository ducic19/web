const express = require("express");
const app = express();

const trips=require("./trips"); //vanjski modul s poljem zapisa

app.use(express.json()); //middleware za parsiranje JSON tijela zahtjeva
app.use(express.urlencoded({ extended: true })); //middleware za parsiranje URL-encoded tijela zahtjeva
//get ruta 
app.get("/api/trips",(req,res)=>{
    res.json(trips);
}); //get metoda salje klijentu sve zapise 
app.put("/api/trips",(req,res)=>{
    const trip= req.body; //uzimamo zapis iz tijela zahtjeva
    for(const i in trips)
        if(trips[i].id===trip.id) //ako je id jednak id-u iz tijela zahtjeva
            trips[i]=trip; //zamjena zapisa u polju
    res.send({message:"Trip updated successfully"}); //saljemo poruku o uspjesnoj izmjeni
}); //put metoda prima zapis i mijenja ga u polju trips 

app.listen(3000); //server slusa na portu 3000