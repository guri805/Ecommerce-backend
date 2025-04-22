const express = require('express');
const upload = require('../Middlewares/multer');
const { createCategory, getAllCategories, getSingleCategory, deleteCategory, updateCategory } = require('../controller/CategroryController');

const categoryRouter = express.Router()

categoryRouter.post('/create-category', upload.array('categoryImages'), createCategory);
categoryRouter.get('/categories', getAllCategories);
categoryRouter.get('/:id', getSingleCategory);
categoryRouter.delete('/:id', deleteCategory)
categoryRouter.put('/update-category/:id', upload.array('categoryImages'), updateCategory)


module.exports = categoryRouter;