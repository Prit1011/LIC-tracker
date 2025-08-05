const User = require('../models/User');

// Generate months between 2 dates
const generateInstallments = (startDate, endDate, amount) => {
  const installments = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    const month = current.toLocaleString('default', { month: 'short' });
    const year = current.getFullYear();
    installments.push({
      month: `${month}-${year}`,
      amount,
      status: 'Unpaid'
    });
    current.setMonth(current.getMonth() + 1);
  }

  return installments;
};

// GET all users
exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// GET one user
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
};

// POST create user
exports.createUser = async (req, res) => {
  const {
    name, accountNumber, cifNumber1, cifNumber2,
    mobileNumber, nomineeName, monthlyAmount,
    totalInstallments, maturityAmount, accountOpenDate, accountCloseDate
  } = req.body;

  const installments = generateInstallments(accountOpenDate, accountCloseDate, monthlyAmount);

  const newUser = new User({
    name, accountNumber, cifNumber1, cifNumber2,
    mobileNumber, nomineeName, monthlyAmount,
    totalInstallments, maturityAmount, accountOpenDate,
    accountCloseDate, installments
  });

  await newUser.save();
  res.status(201).json(newUser);
};

// PUT update user
exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
};

// DELETE user
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};

// GET user's installments
exports.getInstallments = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user.installments);
};

// PATCH mark one month as paid/unpaid
exports.updateInstallmentStatus = async (req, res) => {
  const { id, month } = req.params;
  const { status } = req.body;

  const user = await User.findById(id);
  const installment = user.installments.find(i => i.month === month);

  if (installment) {
    installment.status = status;
    await user.save();
    res.json({ message: `Installment marked as ${status}` });
  } else {
    res.status(404).json({ message: 'Month not found' });
  }
};

// PATCH pay all up to today
exports.payAllTillToday = async (req, res) => {
  const user = await User.findById(req.params.id);
  const today = new Date();
  const currentMonth = `${today.toLocaleString('default', { month: 'short' })}-${today.getFullYear()}`;

  user.installments.forEach(inst => {
    if (
      new Date(`${inst.month.split('-')[1]}-${inst.month.split('-')[0]}-01`) <= today
    ) inst.status = 'Paid';
  });

  await user.save();
  res.json({ message: 'All past installments marked Paid' });
};

// PATCH unpay all
exports.unpayAll = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.installments.forEach(inst => inst.status = 'Unpaid');
  await user.save();
  res.json({ message: 'All installments reset to Unpaid' });
};
