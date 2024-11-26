import { catchAsyncError } from '../Middleware/CatchAsyncError.js';
import OrderModel from '../Model/OrderModel.js';
import ProductModel from '../Model/ProductModel.js';
import ErrorHandler from '../utils/ErrorHandler.js';

export const createOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const buyer = req.user._id;

  if (!id || !buyer) {
    return next(
      new ErrorHandler('Invalid input: Product ID and buyer are required.', 400)
    );
  }

  const findProduct = await ProductModel.findById(id);
  if (!findProduct) {
    return next(new ErrorHandler('Product not found!', 404));
  }

  const productWithSeller = await ProductModel.findById(id).populate(
    'seller',
    'name'
  );
  const seller = productWithSeller.seller;

  if (!seller) {
    return next(new ErrorHandler('Seller not found for this product.', 404));
  }

  const order = await OrderModel.create({
    seller: seller._id,
    buyer,
    plateNO: findProduct._id,
    price: findProduct.price,
    discountedPrice: findProduct.discountedPrice,
  });

  const populatedOrder = await OrderModel.findById(order._id)
    .populate('seller', 'name')
    .populate('buyer', 'name')
    .populate('plateNO', 'plateNo');

  order.sellerName = populatedOrder.seller.name;
  order.buyerName = populatedOrder.buyer.name;
  order.plateNoDetails = populatedOrder.plateNO.plateNo;
  await order.save();

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order,
  });
});

export const userOrders = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find products where the user is either the buyer or seller
    const products = await OrderModel.find({
      $or: [{ seller: userId }, { buyer: userId }],
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: 'Orders not found!',
        success: false,
      });
    }

    res.status(200).json({
      message: 'Orders fetched successfully',
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(new Error(error.message)); // Pass a proper error object to `next`
  }
});

export const statusUpdate = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };

  const updatedStatus = await OrderModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!updatedStatus) {
    return next(new ErrorHandler('Product not found!', 404));
  }
  res
    .status(200)
    .json({ message: 'Status updated.', updatedStatus, success: true });
});

export const getAllOrders = catchAsyncError(async (req, res, next) => {
  const findOrders = await OrderModel.find();
  if (findOrders.length < 1) {
    return next(new ErrorHandler('NO order found!', 404));
  }
  res.status(200).json({ success: true, count: findOrders.length, findOrders });
});

export const deleteOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const deleteOrder = await OrderModel.findByIdAndDelete(id);
  if (!deleteOrder) {
    return next(new ErrorHandler('Order not found!', 404));
  }
  res
    .status(200)
    .json({ success: true, message: 'Order Deleted Successfully' });
});
