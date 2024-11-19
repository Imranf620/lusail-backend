import ProductSchema from '../Model/ProductModel.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncError } from '../Middleware/CatchAsyncError.js';

export const createProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { category, plateNo, price, discount, availability } = req.body;
    const seller = req.user._id;

    const findPlateNO = await ProductSchema.findOne({ plateNo });
    if (findPlateNO) {
      return next(new ErrorHandler('This plate number already exists', 401));
    }

    const newProduct = new ProductSchema({
      category,
      plateNo,
      price,
      discount,
      seller,
      availability
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getAllProducts = catchAsyncError(async (req, res, next) => {
  try {
    const getProducts = await ProductSchema.find();

    if (getProducts.length < 1) {
      return next(new ErrorHandler('No products found', 404));
    }

    res.status(200).json({
      message: 'Products retrieved successfully',
      count: getProducts.length,
      products: getProducts,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getProductsOfSeller = catchAsyncError(async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const products = await ProductSchema.find({ sellerId });
    if (!products.length) {
      res.status(200).json({ message: "No products found" });
    }
    res.status(200).json({ message: "Products received successfully!", products: products, count: products.length })
  } catch (error) {
    return next(new ErrorHandler(error.message,500))
  }
})

export const getSingleProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    const findProduct = await ProductSchema.findById(id);

    if (!findProduct) {
      return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
      message: 'Product retrieved successfully',
      product: findProduct,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const updateProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const sellerId = req.user._id;

    const productToUpdate = await ProductSchema.findById(id);

    if (!productToUpdate) {
      return next(new ErrorHandler('Product not found', 404));
    }

    if (
      productToUpdate.seller.toString() !== sellerId.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorHandler('You are not authorized to update this product', 403)
      );
    }

    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHandler('Error updating product', 500));
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const deleteProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const productToDelete = await ProductSchema.findById(id);

    if (!productToDelete) {
      return next(new ErrorHandler('Product not found!', 404));
    }

    if (
      productToDelete.seller.toString() !== sellerId.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorHandler('You are not authorized to delete this product', 403)
      );
    }

    await productToDelete.deleteOne();

    res.status(200).json({
      message: 'Product deleted successfully!',
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const likeProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      id,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    if (!updatedProduct) {
      return next(new ErrorHandler('Product not found!', 404));
    }

    res.status(200).json({
      message: 'Product liked successfully',
      product: updatedProduct,
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const dislikeProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      id,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!updatedProduct) {
      return next(new ErrorHandler('Product not found!', 404));
    }

    res.status(200).json({
      message: 'Product disliked successfully',
      product: updatedProduct,
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const productViews = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  try {
    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!updatedProduct) {
      return next(new ErrorHandler('Product not found!', 404));
    }
    res.status(200).json({
      message: 'Product viewed successfully!',
      product: updatedProduct,
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const filterProducts = catchAsyncError(async (req, res, next) => {
  const { category } = req.body;
  if (!category) {
    return next(new ErrorHandler("Category required!", 401));
  }
  const products = await ProductSchema.find({ category });
  if (products.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No products found for this category.",
      products: [],
    });
  }
  res.status(200).json({ success: true, message: "Products Retreived successfully", products });
})