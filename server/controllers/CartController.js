const User = require('../models/User')
const Transaction = require('../models/Transaction')

class CartController {
  static async getCart(req, res, next) {
    try {
      let cart = await User
        .findById(req.decodedId)
        .populate('cart.productId')
      res.status(200).json(cart)
    } catch (error) {
      next(error)
    }   
  }

  static async add(req, res, next) {
    try {
      await User.findByIdAndUpdate(req.decodedId, {hookEnabled: false})

      let { productId, quantity } = req.body
      let result
      quantity = Number(quantity)
      let user = await User.findById(req.decodedId)
      if (user.cart.length == 0) {
        await user.cart.push({productId, quantity})
        result = await user.save({ validateBeforeSave: false })
      } else {
        for (let product of user.cart) {
          if (product.productId == productId) {
            product.quantity += quantity
            result = await user.save({ validateBeforeSave: false })
            break;
          }
        }
        if (!result) {
          await user.cart.push({productId, quantity})
          result = await user.save({ validateBeforeSave: false })
        }
      }
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async checkout(req, res, next) {
    try {
      const userId = req.decodedId
      const {cart, totalPrice, deliverTo, deliverPrice, status} = req.body
      let transaction = await Transaction
        .create({
          userId, 
          cart: cart, 
          totalPrice, 
          deliverTo, 
          deliverPrice, 
          status
        })

      let user = await User
        .findByIdAndUpdate(
          req.decodedId, 
          {cart: []}, 
          {new:true}
        )
      res.status(200).json(transaction)      
    } catch (error) {
      next(error)
    }
  }
}

module.exports = CartController