const db = require('../config/db');
const express = require('express');
const router = express.Router();
const reminderService = require('../services/reminderService');


// Add new loan
router.post('/', async (req, res) => {
  try {
    const { company_name, loan_amount, due_date } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO loans (company_name, loan_amount, due_date) VALUES (?, ?, ?)',
      [company_name, loan_amount, new Date(due_date)]
    );
    
    res.status(201).json({ 
      message: 'Loan added successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add loan' });
  }
});

// Get all loans
router.get('/', async (req, res) => {
  try {
    const [loans] = await db.query('SELECT * FROM loans WHERE deleted = "0" ORDER BY due_date');
    res.json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Delete a loan
// router.delete('/:id', async (req, res) => {
//   try {
//     const [result] = await db.query('DELETE FROM loans WHERE id = ?', [req.params.id]);
    
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Loan not found' });
//     }
    
//     res.json({ message: 'Loan deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to delete loan' });
//   }
// });

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE loans SET deleted = "1" WHERE id = ? AND deleted = "0"',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Loan not found or already deleted' });
    }

    res.json({ message: 'Loan soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
});


// Add this to your loanController.js
// router.post('/:id/remind', async (req, res) => {
//     try {
//       console.log(`📤 Sending reminder for loan test 1234:`);
//         const [loan] = await db.query('SELECT * FROM loans WHERE id = ?', [req.params.id]);
//         if (!loan) return res.status(404).json({ message: 'Loan not found' });

//         // Reuse the existing reminder function
//         await reminderService.sendReminder(loan[0]);
//         res.json({ success: true });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });


// Send reminder for a loan
router.post('/:id/remind', async (req, res) => {
  try {
    console.log(`📤 Sending reminder for loan ID: ${req.params.id}`);

    const [rows] = await db.query(
      'SELECT * FROM loans WHERE id = ? AND deleted = "0"',
      [req.params.id]
    );
    const loan = rows[0];

    if (!loan) {
      // console.warn(`⚠️ Loan not found or deleted: ID ${req.params.id}`);
      return res.status(404).json({ message: 'Loan not found or already deleted' });
    }

    await reminderService.sendReminder(loan);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error sending reminder:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;