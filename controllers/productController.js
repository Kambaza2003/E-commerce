const { getProductsModel, getProductByIdModel, addProductModel, updateProductModel, deleteProductModel } = require("../models/productModel");

const getProducts = async (req, res) => {
    try {
        const products = await getProductsModel();

        res.status(200).json(products);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const products = await getProductByIdModel(id);

        if (products.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(products[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            image,
            category_id
        } = req.body;

        if (!name || price === undefined || stock === undefined || !category_id) {
            return res.status(400).json({
                message: "Name, price, stock and category_id are required"
            });
        }

        const result = await addProductModel(
            name,
            description,
            price,
            stock,
            image,
            category_id
        );

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const {
            name,
            description,
            price,
            stock,
            image,
            category_id
        } = req.body;

        if (!name || price === undefined || stock === undefined || !category_id) {
            return res.status(400).json({
                message: "Name, price, stock and category_id are required"
            });
        }

        const result = await updateProductModel(
            id,
            name,
            description,
            price,
            stock,
            image,
            category_id
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const deleteProduct = async (req, res) => {
    try{
        const id = parseInt(req.params.id, 10);
        if(isNaN(id)){
            return status(400).res.json({
                message: "invalid productId"
            })
        }

        const result = await deleteProductModel(id);

        if(result.affectedRows === 0){
            return res.status(404).json({
                message: "Product not found"
            })
        }

        return res.status(200).json({
            message: `product id = ${id} deleted successfully`
        })

    }catch(error){
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};