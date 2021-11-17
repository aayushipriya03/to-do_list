//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemsSchema={
    name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1= new Item({
   name:"Welcome to your todolist"
});
const item2= new Item({
  name:"Hit the + button to add new item"
});
const item3= new Item({
  name:"Hit <-- to delete an item"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find({},function(err,founditems){
    if(founditems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){console.log(err);}
        else {console.log("successful");}

      });
      res.redirect("/");
    }
   else { res.render("list", {listTitle:"TODAY" , newListItems: founditems});}
  });


  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name: itemName
  });
  if(listName==="TODAY"){ item.save();
    res.redirect("/");}
  else{
    List.findOne({name:listName}, function(err,foundlist){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+listName);
    });
  }  

 
});
app.post("/delete", function(req, res){
    const  checkedItemID=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="TODAY"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(!err){
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  }
  else{ 
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},function(err,foundlist){
         res.redirect("/"+listName);
    });
  }
});

app.get("/:customeListName", function(req, res) {
 const customeListName=_.capitalize(req.params.customeListName);
 List.findOne({name: customeListName}, function(err, foundlist) {
   if(!err){
     if(!foundlist){
       //create a new list
       const list= new List({
        name: customeListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customeListName);
     }
     else{
       //show existing list
       res.render("list",{listTitle:foundlist.name , newListItems: foundlist.items});
     }
   }
 });
 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
