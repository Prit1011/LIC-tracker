const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { format } = require('date-fns');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://pritgandhi0902:prit1011@trackerapp.qrco0zf.mongodb.net/?retryWrites=true&w=majority&appName=trackerapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));


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
}, {
  timestamps: true // ✅ This adds createdAt and updatedAt fields
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

app.get('/api/installments/download', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // Find all installments for the specified month and year
    const installments = await Installment.find({
      month: month,
      year: parseInt(year)
    }).populate('userId', 'firstName secondName accountNumber1 accountNumber2 cifNumber1 cifNumber2 mobileNumber nomineeName monthlyAmount totalInvestmentAmount maturityAmount');

    if (installments.length === 0) {
      return res.status(404).json({ error: 'No installments found for the specified month and year' });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Installments ${month} ${year}`);

    // Define only the desired columns
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Second Name', key: 'secondName', width: 15 },
      { header: 'Monthly Amount', key: 'monthlyAmount', width: 15 },
      { header: 'Installment Month', key: 'month', width: 15 },
      { header: 'Installment Year', key: 'year', width: 15 },
      { header: 'Installment Amount', key: 'installmentAmount', width: 20 },
      { header: 'Payment Status', key: 'paymentStatus', width: 18 },
      { header: 'Last Updated', key: 'lastUpdated', width: 20 },
    ];

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    installments.forEach((installment, index) => {
      const user = installment.userId;
      const row = worksheet.addRow({
        sno: index + 1,
        firstName: user.firstName || '',
        secondName: user.secondName || '',
        monthlyAmount: user.monthlyAmount || 0,
        month: installment.month,
        year: installment.year,
        installmentAmount: installment.amount || 0,
        paymentStatus: installment.paid ? 'Paid' : 'Pending',
        lastUpdated: installment.updatedAt ? new Date(installment.updatedAt).toLocaleString() : ''
      });

      // Style data rows
      row.eachCell((cell, cellNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Color coding for payment status
        if (cellNumber === 8) { // Payment Status column
          if (installment.paid) {
            cell.font = { color: { argb: '00AA00' }, bold: true };
          } else {
            cell.font = { color: { argb: 'FF0000' }, bold: true };
          }
        }

        // Right align numeric columns
        if ([4, 7].includes(cellNumber)) {
          cell.alignment = { horizontal: 'right' };
          cell.numFmt = '#,##0.00';
        }
      });
    });

    // Add summary row
    const summaryRowIndex = installments.length + 3;
    worksheet.mergeCells(`A${summaryRowIndex}:E${summaryRowIndex}`);
    const summaryCell = worksheet.getCell(`A${summaryRowIndex}`);
    summaryCell.value = `Total Records: ${installments.length} | Generated on: ${new Date().toLocaleString()}`;
    summaryCell.font = { bold: true, italic: true };
    summaryCell.alignment = { horizontal: 'center' };

    // Set up the response headers for file download
    const fileName = `Installments_${month}_${year}_${new Date().getTime()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Error generating Excel file:', err);
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

// Add this route to your backend (server.js or routes file)
// Add this route to your existing backend code
app.get('/api/users/:userId/full-report', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all installments for the user
    const installments = await Installment.find({ userId: userId }).sort({ year: 1, month: 1 });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Report');

    // Add user details section
    worksheet.addRow(['User Details']).font = { bold: true, size: 14 };
    worksheet.addRow(['First Name', user.firstName]);
    worksheet.addRow(['Second Name', user.secondName || '']);
    worksheet.addRow(['Account Number 1', user.accountNumber1]);
    worksheet.addRow(['Account Number 2', user.accountNumber2 || '']);
    worksheet.addRow(['CIF Number 1', user.cifNumber1]);
    worksheet.addRow(['CIF Number 2', user.cifNumber2 || '']);
    worksheet.addRow(['Mobile Number', user.mobileNumber]);
    worksheet.addRow(['Nominee Name', user.nomineeName]);
    worksheet.addRow(['Monthly Amount', user.monthlyAmount]);
    worksheet.addRow(['Total Investment', user.totalInvestmentAmount]);
    worksheet.addRow(['Left Investment', user.leftInvestmentAmount]);
    worksheet.addRow(['Maturity Amount', user.maturityAmount]);
    worksheet.addRow(['Account Open Date', user.accountOpenDate]);
    worksheet.addRow(['Account Close Date', user.accountCloseDate]);
    worksheet.addRow([]); // Empty row for spacing

    // Add installments section
    worksheet.addRow(['Installments']).font = { bold: true, size: 14 };
    const headerRow = worksheet.addRow([
      'S.No', 'Month', 'Year', 'Amount', 'Status', 'Last Updated'
    ]);

    // Style headers
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D3D3D3' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add installment data
    installments.forEach((installment, index) => {
      const row = worksheet.addRow([
        index + 1,
        installment.month,
        installment.year,
        installment.amount,
        installment.paid ? 'Paid' : 'Pending',
        installment.updatedAt ? format(new Date(installment.updatedAt), 'dd/MM/yyyy HH:mm') : ''
      ]);
      
      // Format amount column
      row.getCell(4).numFmt = '#,##0.00';
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (column.values) {
        const lengths = column.values.map(v => v ? v.toString().length : 0);
        const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
        column.width = maxLength + 5;
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const fileName = `UserReport_${user.firstName}_${user.accountNumber1}_${new Date().getTime()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Send the workbook
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
