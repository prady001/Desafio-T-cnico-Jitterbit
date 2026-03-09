const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/', authMiddleware, orderController.create);
router.get('/list', orderController.list);
router.get('/:numeroPedido', orderController.getById);
router.put('/:numeroPedido', authMiddleware, orderController.update);
router.delete('/:numeroPedido', authMiddleware, orderController.remove);

module.exports = router;
