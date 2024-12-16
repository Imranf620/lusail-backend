import { catchAsyncError } from '../Middleware/CatchAsyncError.js';
import OrderModel from '../Model/OrderModel.js';
import ProductModel from '../Model/ProductModel.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { sendMail } from '../sendCustomMail.js';

export const createOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const buyer = req.user;

  // Validate inputs
  if (!id || !buyer) {
    return next(new ErrorHandler('Invalid input: Product ID and buyer are required.', 400));
  }

  // Fetch product along with seller details
  const findProduct = await ProductModel.findById(id).populate('seller', 'name email');
  if (!findProduct) {
    return next(new ErrorHandler('Product not found!', 404));
  }

  const seller = findProduct.seller;
  if (!seller) {
    return next(new ErrorHandler('Seller not found for this product.', 404));
  }

  // Create the order
  const order = await OrderModel.create({
    seller: seller._id,
    buyer: buyer._id,
    plateNO: findProduct._id,
    price: findProduct.price,
    product: findProduct._id,
    discountedPrice: findProduct.discountedPrice,
  });

  // Populate the order details
  const populatedOrder = await OrderModel.findById(order._id)
    .populate('seller', 'name email')
    .populate('buyer', 'name email')
    .populate('plateNO', 'plateNo');

  // Prepare the order summary
  const { buyerName, sellerName, plateNoDetails } = {
    buyerName: populatedOrder.buyer.name,
    sellerName: populatedOrder.seller.name,
    plateNoDetails: populatedOrder.plateNO.plateNo,
  };

  // Email preparation
  const adminEmail = 'info@lusailnumbers.com';
  const sellerEmail = seller.email;
  const buyerEmail = buyer.email;

  const buyerMessage = `
    <p style='color:rgb(0, 0, 0);'>Dear ${buyerName},</p>
    <p style='color:rgb(0, 0, 0);'>Thank you for placing an order on Lusail Numbers!</p>
    <p style='color:rgb(0, 0, 0);'>Your order for the \n\n<pre style='font-size: 17px; color:rgb(0, 0, 0); display: flex; align-items: center;'>Plate Number: <strong style='font-size: 20px; color: #570007;'>${plateNoDetails}</strong></pre>\n\n has been successfully placed. Our team will contact you shortly with further details.</p>
    <p style='color:rgb(0, 0, 0);'>Best regards,<br>Lusail Numbers Team</p>
  `;

  const adminMessage = `
    <p>Dear Admin,</p>
    <p>A new order has been placed on Lusail Numbers!</p>
    <p>Buyer Name: <strong>${buyerName}</strong></p>
    <p>Seller Name: <strong>${sellerName}</strong></p>
    <p>Number Plate: <strong>${plateNoDetails}</strong></p>
    <p>Please proceed with the necessary steps to process the order.</p>
    <p>Best regards,<br>Lusail Numbers Team</p>
  `;

  const sellerMessage = `
    <p>Dear ${sellerName},</p>
    <p>We are excited to inform you that a new order has been placed on Lusail Numbers!</p>
    <p>Buyer Name: <strong>${buyerName}</strong></p>
    <p>Number Plate: <strong>${plateNoDetails}</strong></p>
    <p>Please review the order details and proceed with the necessary steps.</p>
    <p>Best regards,<br>Lusail Numbers Team</p>
  `;

  // Send emails
  await sendMail({ to: buyerEmail, subject: 'Order Confirmation - Lusail Numbers', text: buyerMessage });
  await sendMail({ to: adminEmail, subject: 'New Order Notification - Lusail Numbers', text: adminMessage });
  await sendMail({ to: sellerEmail, subject: 'Order Notification - Lusail Numbers', text: sellerMessage });

  // Response
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: { ...populatedOrder.toObject(), buyerName, sellerName, plateNoDetails },
  });
});


export const userOrders = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const products = await OrderModel.find({
      $or: [{ seller: userId }, { buyer: userId }],
    });

    if (!products || products.length === 0) {
      return res
        .status(200)
        .json({ message: 'Orders not found!', success: true, products: [] });
    }

    res.status(200).json({
      message: 'Orders fetched successfully',
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(new Error(error.message));
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
    res
      .status(200)
      .json({ message: 'No order found!', success: true, findOrders: [] });
  }
  res.status(200).json({ success: true, count: findOrders.length, findOrders });
});

export const deleteOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const deleteOrder = await OrderModel.findByIdAndDelete(id);
  if (!deleteOrder) {
    res.status(200).json({ message: 'Order not found!', success: true });
  }
  res
    .status(200)
    .json({ success: true, message: 'Order Deleted Successfully' });
});
