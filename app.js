//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));





  
  //connnecting our server to the mongodb server:
  mongoose.connect("mongodb+srv://Harman:Cricketer24@cluster0.mdmqurh.mongodb.net/todolist");
  //now creating a items schema 
  const itemSchema = new mongoose.Schema({
    name:String
  });
  //making a mongoose model:-
  const Item = mongoose.model("item",itemSchema);
  //making documents using this model and adding to the collection:-
  const item1 = new Item({
    name:"Homework"
  });
  const item2 = new Item({
    name:"Food"
  });
  const item3 = new Item({
    name:"Exercise"
  });
  
  
  //now saving these items in an array :-
  
  const defaultItems = [item1,item2,item3];
  
  
  //Creating a new Schema for the custom lists that we can access and update on our todolist web app:-

  const listSchema = new mongoose.Schema({
    name:String,
    items:[itemSchema]
  });
  //now creating a corresponding model of this schema:-

  const List = mongoose.model("List",listSchema);

  //now we can create new documents using List model which represents custom lists entered by the user....

    
    
      







const workItems = [];

app.get("/", function(req, res) {
// retrieving all the documents from the Item model/collection in the todolist database:-

  Item.find({}).exec()

  .then(function(foundItems){

    if(foundItems.length===0){
      //if there are no documents present in the items collection then we initialise the collection with some data by using the insertMany operation:-
      Item.insertMany(defaultItems)
      .then(function(){
        console.log("MULTIPLE ITEMS ADDED SUCCESSFULLY !!")
      })
      .catch(function(err){
        console.log(err);
      })

      res.redirect("/");

    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    
  })
  .catch(function(err){
    console.log(err);
  })

  

});

app.post("/", function(req, res){

  //retrieving the data entered by the user :-
  const itemName = req.body.newItem;
  //retrieving the list name/title in which the user want to add this new list item with content = itemName:-
  const listName = req.body.list;
  //creating a document with the name field data as entered by the user in the form which is stored in the itemNAme variable:-
  const newItem = new Item({
    name:itemName
  });
  //now we add this new list item in the items array of the list in which user wants to add it:-
  if(listName==="Today"){
    //saving the newly created document in the items collection in the mongodb server:-
    newItem.save();
    //now redirecting to the home route to display all the items including the newly added item (newItem):-
    res.redirect("/");
  }
  else{
    //this means user wants to add a new list item in a custom list:-
    List.findOne({name:listName})
    .then(function(foundList){
      //add the newItem in the items field of the foundList document:-
      foundList.items.push(newItem);
      //saving the updated document
      foundList.save();
      //then displaying the updated list:-
      res.redirect("/"+listName);
    })
    .catch(function(err){
      console.log(err);
    });
  }
});

//now to handle the delete requests:-
app.post("/delete",function(req,res){
  //to retrieve the id of the item the user wants to delete:-
  const checkedItemID = req.body.checkbox;
  //to retrieve the list from which the user wants to delete :-
  //we use a hidden input along with the checkbox input to get the list the user is currently present:-
  const listName = req.body.listName;

  if(listName==="Today"){

    //if the list is the default list then we simply delete the checkedItemID element and then redirect to the home route
    //to display the updated items:
    Item.findByIdAndDelete(checkedItemID)
    .then(function(){
      res.redirect("/");
    })
    .catch(function(err){
      console.log(err);
    })
    
  }
  else{
    //if the user wants to delete an item in the custom list:-
    //Using the findOneAndUpdate method to find the list user is present in using the 'List' Model and updating the items field of the document by using the $pull method on that document:-
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}})
    .then(function(){
        res.redirect("/"+listName);
    }) 
    .catch(function(err){
        console.log(err);
    })

  }
  

  
  
  // Item.deleteOne({_id:checkedItemID})
  // .then(function(){
  //   res.redirect("/");
  // })
  // .catch(function(err){
  //   console.log(err);
  // })

});


//if the user tries to access or creates a custom list by accessing a random route then by using express routing parameters:-
app.get("/:customListName",function(req,res){
  //we access the dynamic route entered by the user by using express routing parameters:
    const customList = req.params.customListName;
    //now if the user tries to access the same custom route again and again then we need not create a new list but just find one already existing and return it as a response :-
    List.findOne({name:customList})
    .then(function(foundList){
      //if the listname which the user is trying to access does not already exist in the 'lists' collection in the mongodb server then:-
      if(!foundList){
        //now we create a new List type document using the 'List' model to form the new list:-
        const list = new List({
        name:customList,
        items:defaultItems
        });
        //now saving the newly created list document in the List model/collection:-
        list.save();
        //now redirecting to the same route to display the newly stored list :-
        res.redirect("/"+customList);
        // res.render("list",{listTitle:list.name,newListItems:list.items});
      }
      else{
        //show the existing list by rendering the template file in response:-
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }

    })
    .catch(function(err){
      console.log(err);
    })
   

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
