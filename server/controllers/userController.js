const db = require('../config/database');
const ExcelJS = require('exceljs');
const fs = require('fs');

// Helper functions for database operations
const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const getRow = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getAllRows = (query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { username, jabatan, warehouse } = req.query;

    let query = 'SELECT * FROM datauser WHERE 1=1';
    const params = [];

    if (username) {
      query += ' AND username = ?';
      params.push(username);
    }

    if (jabatan) {
      query += ' AND jabatan = ?';
      params.push(jabatan);
    }

    if (warehouse) {
      query += ' AND warehouse = ?';
      params.push(warehouse);
    }

    query += ' ORDER BY created_at DESC';

    const users = await getAllRows(query, params);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getRow(
      'SELECT * FROM datauser WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// Add user
const addUser = async (req, res) => {
  try {
    const { username, nama, jabatan, amo, warehouse } = req.body;

    if (!username || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Username and nama are required'
      });
    }

    const result = await runQuery(
      'INSERT INTO datauser (username, nama, jabatan, amo, warehouse) VALUES (?, ?, ?, ?, ?)',
      [username, nama, jabatan, amo, warehouse]
    );

    res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add user',
      error: error.message
    });
  }
};

// Edit user
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nama, jabatan, amo, warehouse } = req.body;

    // Check if user exists
    const user = await getRow(
      'SELECT * FROM datauser WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await runQuery(
      'UPDATE datauser SET username = ?, nama = ?, jabatan = ?, amo = ?, warehouse = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [username || user.username, nama || user.nama, jabatan || user.jabatan, amo || user.amo, warehouse || user.warehouse, id]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Edit user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await getRow(
      'SELECT * FROM datauser WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await runQuery(
      'DELETE FROM datauser WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Upload Excel
const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Skip header row
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const username = row.getCell(1).value;
      const nama = row.getCell(2).value;
      const jabatan = row.getCell(3).value;
      const amo = row.getCell(4).value;
      const warehouse = row.getCell(5).value;

      if (!username || !nama) {
        errorCount++;
        errors.push(`Row ${i}: Username and nama are required`);
        continue;
      }

      try {
        await runQuery(
          'INSERT INTO datauser (username, nama, jabatan, amo, warehouse) VALUES (?, ?, ?, ?, ?)',
          [username, nama, jabatan, amo, warehouse]
        );
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Upload complete. ${successCount} records added, ${errorCount} errors`,
      data: {
        successCount,
        errorCount,
        errors: errors.slice(0, 10) // Return first 10 errors
      }
    });
  } catch (error) {
    console.error('Upload Excel error:', error);
    
    // Delete uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload Excel',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  editUser,
  deleteUser,
  uploadExcel
};
