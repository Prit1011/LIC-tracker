// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const app = express();
// const PORT = 5000;

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/mern-investment', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('MongoDB connected'))
//   .catch(err => console.error(err));

// // Mongoose Schema
// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   secondName: { type: String },
//   accountNumber: { type: String, required: true },
//   secondAccountNumber: { type: String },
//   cifNumber: { type: String, required: true },
//   secondCifNumber: { type: String },
//   mobileNumber: { type: String, required: true },
//   nomineeName: { type: String, required: true },
//   monthlyAmount: { type: Number, required: true },
//   totalInvestmentAmount: { type: Number, required: true },
//   leftInvestmentAmount: { type: Number, required: true },
//   maturityAmount: { type: Number, required: true },
//   accountOpenDate: { type: Date, required: true },
//   accountCloseDate: { type: Date, required: true },
//   installments: [{
//     month: String,        // e.g., "Aug 2025"
//     amount: Number,       // e.g., 1000
//     paid: { type: Boolean, default: false }
//   }]
// });

// const User = mongoose.model('User', userSchema);

// // Routes

// // 1. Home - Get All Users
// app.get('/api/users', async (req, res) => {
//   const users = await User.find({}, 'firstName secondName mobileNumber totalInvestmentAmount leftInvestmentAmount');
//   res.json(users);
// });

// // 2. Get User Detail by ID
// app.get('/api/users/:id', async (req, res) => {
//   const user = await User.findById(req.params.id);
//   if (!user) return res.status(404).json({ error: 'User not found' });
//   res.json(user);
// });

// // 3. Create New User
// app.post('/api/users', async (req, res) => {
//   try {
//     const {
//       firstName, secondName, accountNumber, secondAccountNumber, cifNumber, secondCifNumber,
//       mobileNumber, nomineeName, monthlyAmount, totalInvestmentAmount, leftInvestmentAmount,
//       maturityAmount, accountOpenDate, accountCloseDate
//     } = req.body;

//     const user = new User({
//       firstName,
//       secondName,
//       accountNumber,
//       secondAccountNumber,
//       cifNumber,
//       secondCifNumber,
//       mobileNumber,
//       nomineeName,
//       monthlyAmount,
//       totalInvestmentAmount,
//       leftInvestmentAmount,
//       maturityAmount,
//       accountOpenDate,
//       accountCloseDate
//     });

//     await user.save();
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ error: 'Error creating user', detail: error.message });
//   }
// });

// // 4. Generate Installment Schedule Between Open and Close Date
// // 4. Generate empty Installments between open and close date
// app.post('/api/users/:id/installments', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const open = new Date(user.accountOpenDate);
//     const close = new Date(user.accountCloseDate);

//     const months = [];
//     let current = new Date(open.getFullYear(), open.getMonth(), 1);

//     while (current <= close) {
//       const monthStr = current.toLocaleString('default', { month: 'short', year: 'numeric' });
//       months.push({
//         month: monthStr,
//         amount: 0,         // initially empty amount
//         paid: false
//       });
//       current.setMonth(current.getMonth() + 1);
//     }

//     user.installments = months;
//     await user.save();
//     res.json(user.installments);
//   } catch (err) {
//     res.status(500).json({ error: 'Error generating installments', detail: err.message });
//   }
// });

// // 5. Update Installment Paid Status
// // 5. Update Installment Paid Status or Amount
// app.put('/api/users/:id/installments/:month', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const { paid, amount } = req.body;

//     const monthIndex = user.installments.findIndex(i => i.month === req.params.month);
//     if (monthIndex === -1) return res.status(404).json({ error: 'Installment not found for the given month' });

//     // Update fields conditionally
//     if (typeof paid === 'boolean') user.installments[monthIndex].paid = paid;
//     if (typeof amount === 'number') user.installments[monthIndex].amount = amount;

//     await user.save();
//     res.json(user.installments[monthIndex]);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update installment', detail: err.message });
//   }
// });


// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/investmentApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  secondName: String,
  accountNumber1: { type: String, required: true },
  accountNumber2: String,
  cifNumber1: { type: String, required: true },
  cifNumber2: String,
  mobileNumber: { type: String, required: true },
  nomineeName: { type: String, required: true },
  monthlyAmount: { type: Number, required: true },
  totalInvestmentAmount: { type: Number, required: true },
  leftInvestmentAmount: { type: Number, required: true },
  maturityAmount: { type: Number, required: true },
  accountOpenDate: { type: String, required: true },
  accountCloseDate: { type: String, required: true },
});

const installmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: String,
  year: Number,
  amount: { type: Number, default: 0 },
  paid: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
const Installment = mongoose.model('Installment', installmentSchema);

// Routes
app.get('/', (req, res) => res.send('Investment App API is running ✅'));

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate Monthly Installments
app.post('/api/installments/generate/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const startDate = new Date(user.accountOpenDate);
    const endDate = new Date(user.accountCloseDate);

    const installments = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      installments.push({
        userId: user._id,
        month: currentDate.toLocaleString('default', { month: 'short' }),
        year: currentDate.getFullYear(),
        amount: 0,
        paid: false
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    await Installment.insertMany(installments);
    res.status(201).json({ message: 'Installments generated successfully', count: installments.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all installments for a user
app.get('/api/installments/:userId', async (req, res) => {
  try {
    const installments = await Installment.find({ userId: req.params.userId });
    res.json(installments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an installment by ID
app.put('/api/installments/:id', async (req, res) => {
  try {
    const installment = await Installment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!installment) return res.status(404).json({ error: 'Installment not found' });
    res.json(installment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
