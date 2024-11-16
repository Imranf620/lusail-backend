import { catchAsyncError } from '../Middleware/CatchAsyncError.js';
import OrderModel from '../Model/OrderModel.js';
import ProductModel from '../Model/ProductModel.js';
import ErrorHandler from '../utils/ErrorHandler.js';

export const createOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params; // Product ID from the URL
  const seller = req.user._id; // Assuming req.user contains authenticated user info
  const buyer = req.user._id; // Assuming buyer is also the logged-in user

  // Validate input
  if (!id || !seller || !buyer) {
    return next(
      new ErrorHandler(
        'Invalid input: Product ID, seller, and buyer are required.',
        400
      )
    );
  }

  // Check if the product exists
  const findProduct = await ProductModel.findById(id);
  if (!findProduct) {
    return next(new ErrorHandler('Product not found!', 404));
  }

  // Create the order
  const order = await OrderModel.create({
    seller,
    buyer,
    plateNO: findProduct._id, // Assuming plateNO corresponds to the product ID
    price: findProduct.price, // Assign the product price
  });

  // Send success response
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order,
  });
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
