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

// Get all outlets
const getAllOutlets = async (req, res) => {
  try {
    const { username, warehouse, idoutlet } = req.query;

    let query = 'SELECT * FROM dataoutlet WHERE 1=1';
    const params = [];

    if (username) {
      query += ' AND username = ?';
      params.push(username);
    }

    if (warehouse) {
      query += ' AND warehouse = ?';
      params.push(warehouse);
    }

    if (idoutlet) {
      query += ' AND idoutlet = ?';
      params.push(idoutlet);
    }

    query += ' ORDER BY created_at DESC';

    const outlets = await getAllRows(query, params);

    res.json({
      success: true,
      data: outlets
    });
  } catch (error) {
    console.error('Get outlets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get outlets',
      error: error.message
    });
  }
};

// Get outlet by ID
const getOutletById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const outlet = await getRow(
      'SELECT * FROM dataoutlet WHERE id = ?',
      [id]
    );

    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: 'Outlet not found'
      });
    }

    res.json({
      success: true,
      data: outlet
    });
  } catch (error) {
    console.error('Get outlet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get outlet',
      error: error.message
    });
  }
};

// Add new outlet
const addOutlet = async (req, res) => {
  try {
    const { username, amo, warehouse, idoutlet, namaoutlet, alamatoutlet, latitude, longitude } = req.body;

    if (!username || !idoutlet || !namaoutlet || !alamatoutlet || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Username, idoutlet, namaoutlet, alamatoutlet, latitude, and longitude are required'
      });
    }

    // Check if outlet ID already exists
    const existingOutlet = await getRow(
      'SELECT * FROM dataoutlet WHERE idoutlet = ?',
      [idoutlet]
    );

    if (existingOutlet) {
      return res.status(400).json({
        success: false,
        message: 'Outlet ID already exists'
      });
    }

    const result = await runQuery(
      'INSERT INTO dataoutlet (username, amo, warehouse, idoutlet, namaoutlet, alamatoutlet, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, amo, warehouse, idoutlet, namaoutlet, alamatoutlet, latitude, longitude]
    );

    res.status(201).json({
      success: true,
      message: 'Outlet added successfully',
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error('Add outlet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add outlet',
      error: error.message
    });
  }
};

// Edit outlet
const editOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, amo, warehouse, idoutlet, namaoutlet, alamatoutlet, latitude, longitude } = req.body;

    const outlet = await getRow(
      'SELECT * FROM dataoutlet WHERE id = ?',
      [id]
    );

    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: 'Outlet not found'
      });
    }

    await runQuery(
      'UPDATE dataoutlet SET username = ?, amo = ?, warehouse = ?, idoutlet = ?, namaoutlet = ?, alamatoutlet = ?, latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [username || outlet.username, amo || outlet.amo, warehouse || outlet.warehouse, idoutlet || outlet.idoutlet, namaoutlet || outlet.namaoutlet, alamatoutlet || outlet.alamatoutlet, latitude || outlet.latitude, longitude || outlet.longitude, id]
    );

    res.json({
      success: true,
      message: 'Outlet updated successfully'
    });
  } catch (error) {
    console.error('Update outlet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update outlet',
      error: error.message
    });
  }
};

// Delete outlet
const deleteOutlet = async (req, res) => {
  try {
    const { id } = req.params;

    const outlet = await getRow(
      'SELECT * FROM dataoutlet WHERE id = ?',
      [id]
    );

    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: 'Outlet not found'
      });
    }

    await runQuery(
      'DELETE FROM dataoutlet WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Outlet deleted successfully'
    });
  } catch (error) {
    console.error('Delete outlet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete outlet',
      error: error.message
    });
  }
};

// Upload Excel file
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

    if (!worksheet) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid Excel file: No worksheet found'
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Skip header row
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const username = row.getCell(1).value;
      const amo = row.getCell(2).value;
      const warehouse = row.getCell(3).value;
      const idoutlet = row.getCell(4).value;
      const namaoutlet = row.getCell(5).value;
      const alamatoutlet = row.getCell(6).value;
      const latitude = row.getCell(7).value;
      const longitude = row.getCell(8).value;

      if (!username || !idoutlet || !namaoutlet || !alamatoutlet || !latitude || !longitude) {
        errorCount++;
        errors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      try {
        await runQuery(
          'INSERT OR REPLACE INTO dataoutlet (username, amo, warehouse, idoutlet, namaoutlet, alamatoutlet, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [username, amo, warehouse, idoutlet, namaoutlet, alamatoutlet, parseFloat(latitude), parseFloat(longitude)]
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
        errors: errors.slice(0, 10)
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
      message: 'Failed to process Excel file',
      error: error.message
    });
  }
};

module.exports = {
  getAllOutlets,
  getOutletById,
  addOutlet,
  editOutlet,
  deleteOutlet,
  uploadExcel
};
