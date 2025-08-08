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
app.use(express.json());

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
  accountType: { type: String}, // ✅ New field
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
    console.log("📥 Incoming Data:", req.body);
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
    const { filter } = req.query;
    let query = {};

    if (filter === "After 15 days") {
      query.accountType = "After 15 days";
    } else if (filter === "Before 15 days") {
      query.accountType = "Before 15 days";
    }

    const users = await User.find(query);
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

  // Update selected user's profile
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Check for valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      //  console.log("firstname:", req.body.firstName)

      // Optional: Validate body fields if needed (you can add more validation)
      const allowedFields = [
        'firstName', 'secondName', 'accountNumber1', 'accountNumber2',
        'cifNumber1', 'cifNumber2', 'mobileNumber', 'nomineeName',
        'monthlyAmount', 'totalInvestmentAmount', 'accountType',
        'maturityAmount', 'accountOpenDate', 'accountCloseDate'
      ];

      const updates = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }

      // Prevent empty update
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User profile updated successfully',
        user: updatedUser
      });

    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Server error while updating user' });
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
      const month = currentDate.toLocaleString('default', { month: 'short' });
      const year = currentDate.getFullYear();

      // Check if installment already exists for this user/month/year
      const exists = await Installment.findOne({
        userId: user._id,
        month,
        year
      });

      if (!exists) {
        installments.push({
          userId: user._id,
          month,
          year,
          amount: 0,
          paid: false
        });
      }

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    if (installments.length > 0) {
      await Installment.insertMany(installments);
    }

    res.status(201).json({
      message: 'Installments generated successfully',
      inserted: installments.length
    });
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



app.get('/api/users/:userId/full-report', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let installments = await Installment.find({ userId }).lean();

    // Sort months properly (jan-dec)
    const monthOrder = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };
    installments.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return (monthOrder[a.month] || 13) - (monthOrder[b.month] || 13);
    });

    const totalInstallments = installments.length;
    const paidInstallments = installments.filter(i => i.paid);
    const paidInstallmentsCount = paidInstallments.length;

    // 🧮 Correct Logic: leftInstallment = totalInvestmentAmount - sum of paid installments
    const totalPaidAmount = paidInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const leftInstallment = user.totalInvestmentAmount - totalPaidAmount;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Report');

    // Set default row height for better spacing
    worksheet.properties.defaultRowHeight = 20;

    // Add company header with beautiful styling
    const companyRow = worksheet.addRow(['INVESTMENT REPORT']);
    worksheet.mergeCells('A1:F1');
    companyRow.getCell(1).font = { 
      bold: true, 
      size: 18, 
      color: { argb: 'FFFFFF' },
      name: 'Calibri'
    };
    companyRow.getCell(1).alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    companyRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2E4A6B' } // Dark blue
    };
    companyRow.height = 35;

    // Add spacing row
    worksheet.addRow([]);

    // User Details Header with beautiful styling
    const userHeaderRow = worksheet.addRow(['USER DETAILS']);
    worksheet.mergeCells(`A${userHeaderRow.number}:F${userHeaderRow.number}`);
    userHeaderRow.getCell(1).font = { 
      bold: true, 
      size: 14, 
      color: { argb: 'FFFFFF' },
      name: 'Calibri'
    };
    userHeaderRow.getCell(1).alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    userHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4A90A4' } // Medium blue
    };
    userHeaderRow.height = 28;

    // User details with improved formatting
    const details = [
      ['First Name', user.firstName],
      ['Second Name', user.secondName || 'N/A'],
      ['Account Number 1', user.accountNumber1],
      ['Account Number 2', user.accountNumber2 || 'N/A'],
      ['CIF Number 1', user.cifNumber1],
      ['CIF Number 2', user.cifNumber2 || 'N/A'],
      ['Mobile Number', user.mobileNumber],
      ['Nominee Name', user.nomineeName],
      ['Monthly Amount', user.monthlyAmount],
      ['Total Investment', user.totalInvestmentAmount],
      ['Left Investment', user.leftInvestmentAmount],
      ['Maturity Amount', user.maturityAmount],
      ['Account Open Date', user.accountOpenDate],
      ['Account Close Date', user.accountCloseDate],
      ['Total Installments Count', totalInstallments],
      ['Paid Installments Count', paidInstallmentsCount],
      ['Total Paid Amount', totalPaidAmount],
      ['Left Installment Amount', leftInstallment],
    ];

    let currentRow = worksheet.lastRow.number + 1;
    details.forEach(detail => {
      const row = worksheet.addRow([detail[0], detail[1]]);
      
      // Style the label column
      row.getCell(1).font = { 
        bold: true, 
        color: { argb: '2E4A6B' },
        name: 'Calibri'
      };
      row.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0F8FF' } // Light blue
      };
      row.getCell(1).alignment = { 
        horizontal: 'left', 
        vertical: 'middle',
        indent: 1
      };
      
      // Style the value column
      row.getCell(2).font = { 
        name: 'Calibri',
        color: { argb: '333333' }
      };
      row.getCell(2).alignment = { 
        horizontal: 'left', 
        vertical: 'middle',
        indent: 1
      };
      
      // Add borders
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'CCCCCC' } },
          left: { style: 'thin', color: { argb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
          right: { style: 'thin', color: { argb: 'CCCCCC' } }
        };
      });

      // Format currency values
      if (detail[0].toLowerCase().includes('amount') || detail[0].toLowerCase().includes('investment')) {
        row.getCell(2).numFmt = '₹#,##0.00';
      }
    });

    // Add spacing rows
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Installments Header with beautiful styling
    const installmentsHeaderRow = worksheet.addRow(['INSTALLMENT DETAILS']);
    worksheet.mergeCells(`A${installmentsHeaderRow.number}:F${installmentsHeaderRow.number}`);
    installmentsHeaderRow.getCell(1).font = { 
      bold: true, 
      size: 14, 
      color: { argb: 'FFFFFF' },
      name: 'Calibri'
    };
    installmentsHeaderRow.getCell(1).alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    installmentsHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4A90A4' } // Medium blue
    };
    installmentsHeaderRow.height = 28;

    // Table headers with beautiful styling
    const headerRow = worksheet.addRow([
      'S.No', 'Month', 'Year', 'Amount (₹)', 'Status', 'Last Updated'
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFF' },
        name: 'Calibri',
        size: 11
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '2E4A6B' } // Dark blue
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    });
    headerRow.height = 25;

    // Installment data rows with alternating colors
    installments.forEach((inst, i) => {
      const row = worksheet.addRow([
        i + 1,
        inst.month,
        inst.year,
        inst.amount,
        inst.paid ? 'Paid' : 'Pending',
        inst.updatedAt ? format(new Date(inst.updatedAt), 'dd/MM/yyyy HH:mm') : 'N/A'
      ]);

      // Alternate row colors
      const isEvenRow = (i + 1) % 2 === 0;
      const rowColor = isEvenRow ? 'F8F9FA' : 'FFFFFF';

      row.eachCell((cell, colNumber) => {
        cell.font = { 
          name: 'Calibri',
          color: { argb: '333333' }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor }
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'DDDDDD' } },
          left: { style: 'thin', color: { argb: 'DDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
          right: { style: 'thin', color: { argb: 'DDDDDD' } }
        };
      });

      // Format amount column
      row.getCell(4).numFmt = '₹#,##0.00';
      
      // Style status column based on paid/pending
      const statusCell = row.getCell(5);
      if (inst.paid) {
        statusCell.font = { 
          bold: true, 
          color: { argb: 'FFFFFF' },
          name: 'Calibri'
        };
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '28A745' } // Green for paid
        };
      } else {
        statusCell.font = { 
          bold: true, 
          color: { argb: 'FFFFFF' },
          name: 'Calibri'
        };
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DC3545' } // Red for pending
        };
      }
    });

    // Auto-fit column widths with minimum widths
    const columnWidths = [8, 12, 8, 15, 12, 20]; // Minimum widths
    worksheet.columns.forEach((column, index) => {
      let maxLength = columnWidths[index] || 10;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 25); // Cap maximum width
    });

    // Add summary footer
    const footerStartRow = worksheet.lastRow.number + 2;
    const summaryRow = worksheet.addRow(['SUMMARY']);
    worksheet.mergeCells(`A${summaryRow.number}:F${summaryRow.number}`);
    summaryRow.getCell(1).font = { 
      bold: true, 
      size: 12, 
      color: { argb: 'FFFFFF' },
      name: 'Calibri'
    };
    summaryRow.getCell(1).alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    summaryRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '6C757D' } // Gray
    };
    summaryRow.height = 25;

    const summaryDetails = [
      ['Total Installments:', totalInstallments],
      ['Paid Installments:', paidInstallmentsCount],
      ['Pending Installments:', totalInstallments - paidInstallmentsCount],
      ['Total Paid Amount:', `₹${totalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ['Remaining Amount:', `₹${leftInstallment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]
    ];

    summaryDetails.forEach(detail => {
      const row = worksheet.addRow([detail[0], detail[1]]);
      row.getCell(1).font = { 
        bold: true, 
        color: { argb: '2E4A6B' },
        name: 'Calibri'
      };
      row.getCell(2).font = { 
        bold: true,
        color: { argb: '333333' },
        name: 'Calibri'
      };
      row.eachCell((cell) => {
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'CCCCCC' } },
          left: { style: 'thin', color: { argb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
          right: { style: 'thin', color: { argb: 'CCCCCC' } }
        };
      });
    });

    const fileName = `UserReport_${user.firstName}_${user.accountNumber1}_${Date.now()}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res); // send workbook to response
    res.end();

  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check for valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all installments associated with this user first
    const installmentDeleteResult = await Installment.deleteMany({ userId: id });
    
    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    res.json({
      message: 'User and associated installments deleted successfully',
      deletedUser: {
        id: deletedUser._id,
        firstName: deletedUser.firstName,
        secondName: deletedUser.secondName,
        accountNumber1: deletedUser.accountNumber1
      },
      deletedInstallments: installmentDeleteResult.deletedCount
    });

  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
});




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
