import ProductSchema from '../Model/ProductModel.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { catchAsyncError } from '../Middleware/CatchAsyncError.js';

export const createProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { plateNo, price, discount } = req.body;
    const seller = req.user._id;

    const findPlateNO = await ProductSchema.findOne({ plateNo });
    if (findPlateNO) {
      return next(new ErrorHandler('This plate number already exists', 401));
    }

    const newProduct = new ProductSchema({
      plateNo,
      price,
      discount,
      seller,
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
      products: getProducts,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

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

    const productToUpdate = await ProductSchema.findById(id);
    if (!productToUpdate) {
      return next(new ErrorHandler('Product not found', 404));
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
    const { productId } = req.params;
    const deleteProduct = await ProductSchema.findByIdAndDelete(productId);
    if (!deleteProduct) {
      return next(new ErrorHandler('Product not found!', 404));
    }
    res
      .status(200)
      .json({ message: 'Product deleted successfully!', success: true });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const likeProduct = catchAsyncError(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      productId,
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
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      productId,
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
  const { productId } = req.params;
  try {
    const updatedProduct = await ProductSchema.findByIdAndUpdate(
      productId,
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
