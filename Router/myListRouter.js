const express = require('express');
const { addToMyListController, getMyListProductController, deleteMyListItemsController } = require('../controller/myListController');

const myListRouter = express.Router()

myListRouter.post("/add-to-mylist", addToMyListController)
myListRouter.get("/get-mylist-product/:userId", getMyListProductController)
myListRouter.delete('/delete-mylist-product/:userId',deleteMyListItemsController)


module.exports = myListRouter;