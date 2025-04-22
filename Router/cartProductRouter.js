const express = require('express');
const { addToCartController, getCartProductController, updateCartItemsController, deleteCartItemsController } = require('../controller/cartProductController');

const cartRouter = express.Router()

cartRouter.post("/addToCart", addToCartController)
cartRouter.get("/get-cart-product/:userId", getCartProductController)
cartRouter.put("/update-cart-product/:userId", updateCartItemsController)
cartRouter.delete('/delete-cart-product/:userId',deleteCartItemsController)

module.exports = cartRouter;