const {
    getProductsModel,
    getProductByIdModel,
    addProductModel,
    updateProductModel,
    deleteProductModel,
    getProductsWithCategoryModel,
    getProductsByCategoryIdModel,
    addProductImageModel,
    getProductImagesModel,
    deleteProductImagesModel
} = require("../models/productModel");

const getProducts = async (req, res) => {

    try {

        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort
        } = req.query;


        const filters = {};


        if (search) {
            filters.search = search.trim();
        }


        if (category) {

            const categoryId = parseInt(category, 10);

            if (isNaN(categoryId)) {

                return res.status(400).json({
                    message: "Invalid category"
                });

            }

            filters.category = categoryId;
        }


        if (minPrice !== undefined && minPrice !== "") {

            const price = Number(minPrice);

            if (isNaN(price) || price < 0) {

                return res.status(400).json({
                    message: "Invalid minimum price"
                });

            }

            filters.minPrice = price;
        }


        if (maxPrice !== undefined && maxPrice !== "") {

            const price = Number(maxPrice);

            if (isNaN(price) || price < 0) {

                return res.status(400).json({
                    message: "Invalid maximum price"
                });

            }

            filters.maxPrice = price;
        }


        if (filters.minPrice !== undefined &&
            filters.maxPrice !== undefined &&
            filters.minPrice > filters.maxPrice) {

            return res.status(400).json({
                message: "Minimum price cannot be greater than maximum price"
            });
        }


        const allowedSorts = [
            "price_asc",
            "price_desc",
            "name_asc",
            "name_desc"
        ];


        if (sort) {

            if (!allowedSorts.includes(sort)) {

                return res.status(400).json({
                    message: "Invalid sort option"
                });

            }

            filters.sort = sort;
        }


        const products =
            await getProductsModel(filters);


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

const getProductImages = async (req, res) => {

    try {

        const productId =
            parseInt(req.params.id, 10);


        if (isNaN(productId)) {

            return res.status(400).json({
                message: "Invalid product ID"
            });

        }


        const images =
            await getProductImagesModel(productId);


        res.status(200).json(images);


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
            category_id,
            additionalImages = []
        } = req.body;

        if (!name || price === undefined || stock === undefined || !category_id) {
            return res.status(400).json({
                message: "Name, price, stock and category_id are required"
            });
        }

        if (Number(price) <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0"
            });
        }

        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return res.status(400).json({
                message: "Stock must be a non-negative integer"
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

        for (const additionalImage of additionalImages) {

            await addProductImageModel(
                result.insertId,
                additionalImage
            );

        }

        res.status(201).json({
            message: "Product created successfully",
            productId: result.insertId
        });
    }catch (error) {
        console.error(error);

        if (error.errno === 1452) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

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
            category_id,
            additionalImages = []
        } = req.body;

        if (!name || price === undefined || stock === undefined || !category_id) {
            return res.status(400).json({
                message: "Name, price, stock and category_id are required"
            });
        }

        if (Number(price) <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0"
            });
        }

        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return res.status(400).json({
                message: "Stock must be a non-negative integer"
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


        await deleteProductImagesModel(id);


        for (const additionalImage of additionalImages) {

            await addProductImageModel(
                id,
                additionalImage
            );

        }

        res.status(200).json({
            message: "Product updated successfully"
        });
    } catch (error) {
        console.error(error);

        if (error.errno === 1452) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const deleteProduct = async (req, res) => {
    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid Product ID"
            });
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

const getProductsWithCategory = async (req, res) => {
    try {
        const products = await getProductsWithCategoryModel();

        res.status(200).json(products);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const getProductsByCategoryId = async (req, res) => {
    try{
        const categoryId = parseInt(req.params.categoryId, 10);

        if(isNaN(categoryId)){
            return res.status(400).json({
                message: "Invalid Category Id"
            })
        }

        const category = await getProductsByCategoryIdModel(categoryId)

        if (category.length === 0){
            return res.status(404).json({
                message: "Category not found"
            })
        }

        res.status(200).json(category);
    } catch(error){
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        })
    }
    
}

module.exports = {
    getProducts,
    getProductById,
    getProductImages,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsWithCategory,
    getProductsByCategoryId
};