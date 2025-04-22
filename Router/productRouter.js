const express = require('express');
const upload = require('../Middlewares/multer');
const { createProduct, getAllProducts, getAllProductsByCategoryId, getAllProductsByCategoryName, getProductsByFilters, getProductCount, getFeaturedProducts, deleteProduct, updateProduct } = require('../controller/productController');

const productRouter = express.Router()

productRouter.post('/create-product', upload.array('images'), createProduct);
productRouter.get('/get-all-products', getAllProducts);
productRouter.get('/get-products-by-categoryid/:id', getAllProductsByCategoryId);
productRouter.get('/get-products-by-category-name/:name', getAllProductsByCategoryName);
productRouter.get('/get-products-by-filters', getProductsByFilters);
productRouter.get('/get-product-count', getProductCount);
productRouter.get('/get-featured-products', getFeaturedProducts);
productRouter.delete('/delete/:id', deleteProduct);
productRouter.put('/update/:id', upload.array('images'), updateProduct); 

module.exports = productRouter;