const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

router.get('/', userCtrl.getAllUsers);
router.get('/:id', userCtrl.getUserById);
router.post('/', userCtrl.createUser);
router.put('/:id', userCtrl.updateUser);
router.delete('/:id', userCtrl.deleteUser);

// Monthly installment routes
router.get('/:id/installments', userCtrl.getInstallments);
router.patch('/:id/pay/:month', userCtrl.updateInstallmentStatus);
router.patch('/:id/pay-all', userCtrl.payAllTillToday);
router.patch('/:id/unpay-all', userCtrl.unpayAll);

module.exports = router;
