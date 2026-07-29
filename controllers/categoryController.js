const { getCategoriesModel, getCategoryByIdModel, addCategoryModel, updateCategoryModel, deleteCategoryModel } = require("../models/categoryModel");

const getCategories = async (req, res) => {
    try {
        const categories = await getCategoriesModel();

        res.status(200).json(categories);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


const getCategoryById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid Category ID"
            });
        }

        const category = await getCategoryByIdModel(id);

        if (category.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json(category[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const addCategory = async (req, res) => {
    try {
        const {name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const result = await addCategoryModel(name);

        res.status(201).json({
            message: "Category created successfully",
            categoryId: result.insertId
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid Category ID"
            });
        }

        const { name } = req.body;

        if (!name || !name.trim()){
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const result = await updateCategoryModel(id,name);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            message: "Category updated successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const deleteCategory = async (req, res) => {
    try{
        const id = parseInt(req.params.id, 10);
        if(isNaN(id)){
            return res.status(400).json({
                message: "invalid categoryId"
            })
        }

        const result = await deleteCategoryModel(id);

        if(result.affectedRows === 0){
            return res.status(404).json({
                message: "Category not found"
            })
        }

        return res.status(200).json({
            message: `Category with ID ${id} deleted successfully`
        });

    } catch (error) {
        console.error(error);

        if (error.errno === 1451) {
            return res.status(409).json({
                message: "Cannot delete category because it is being used by products"
            });
        }

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    getCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
};