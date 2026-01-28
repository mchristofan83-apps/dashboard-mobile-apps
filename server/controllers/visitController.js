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

// MD VISIT CONTROLLERS

// Get all MD visits
const getAllMdVisits = async (req, res) => {
  try {
    const { username, datevisit, status } = req.query;

    let query = 'SELECT * FROM datavisitmd WHERE 1=1';
    const params = [];

    if (username) {
      query += ' AND username = ?';
      params.push(username);
    }

    if (datevisit) {
      query += ' AND datevisit = ?';
      params.push(datevisit);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY datevisit DESC';

    const visits = await getAllRows(query, params);

    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    console.error('Get MD visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MD visits',
      error: error.message
    });
  }
};

// Get MD visit by ID
const getMdVisitById = async (req, res) => {
  try {
    const { id } = req.params;

    const visit = await getRow('SELECT * FROM datavisitmd WHERE id = ?', [id]);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'MD visit not found'
      });
    }

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    console.error('Get MD visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MD visit',
      error: error.message
    });
  }
};

// Add MD visit
const addMdVisit = async (req, res) => {
  try {
    const { username, amo, warehouse, idoutlet, namaoutlet, datevisit } = req.body;

    if (!username || !idoutlet || !namaoutlet || !datevisit) {
      return res.status(400).json({
        success: false,
        message: 'Username, idoutlet, namaoutlet, and datevisit are required'
      });
    }

    const result = await runQuery(
      'INSERT INTO datavisitmd (username, amo, warehouse, idoutlet, namaoutlet, datevisit, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, amo, warehouse, idoutlet, namaoutlet, datevisit, 'scheduled']
    );

    res.status(201).json({
      success: true,
      message: 'MD visit added successfully',
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error('Add MD visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add MD visit',
      error: error.message
    });
  }
};

// Edit MD visit
const editMdVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, amo, warehouse, idoutlet, namaoutlet, datevisit, status } = req.body;

    const visit = await getRow(
      'SELECT * FROM datavisitmd WHERE id = ?',
      [id]
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'MD visit not found'
      });
    }

    await runQuery(
      'UPDATE datavisitmd SET username = ?, amo = ?, warehouse = ?, idoutlet = ?, namaoutlet = ?, datevisit = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        username || visit.username,
        amo || visit.amo,
        warehouse || visit.warehouse,
        idoutlet || visit.idoutlet,
        namaoutlet || visit.namaoutlet,
        datevisit || visit.datevisit,
        status || visit.status,
        id
      ]
    );

    res.json({
      success: true,
      message: 'MD visit updated successfully'
    });
  } catch (error) {
    console.error('Edit MD visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update MD visit',
      error: error.message
    });
  }
};

// Delete MD visit
const deleteMdVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const visit = await getRow(
      'SELECT * FROM datavisitmd WHERE id = ?',
      [id]
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'MD visit not found'
      });
    }

    await runQuery(
      'DELETE FROM datavisitmd WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'MD visit deleted successfully'
    });
  } catch (error) {
    console.error('Delete MD visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete MD visit',
      error: error.message
    });
  }
};

// Upload MD Excel
const uploadMdExcel = async (req, res) => {
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
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid Excel file: No worksheet found'
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const username = row.getCell(1).value;
      const amo = row.getCell(2).value;
      const warehouse = row.getCell(3).value;
      const idoutlet = row.getCell(4).value;
      const namaoutlet = row.getCell(5).value;
      const datevisit = row.getCell(6).value;

      if (!username || !idoutlet || !namaoutlet || !datevisit) {
        errorCount++;
        errors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      try {
        await runQuery(
          'INSERT INTO datavisitmd (username, amo, warehouse, idoutlet, namaoutlet, datevisit, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [username, amo, warehouse, idoutlet, namaoutlet, datevisit, 'scheduled']
        );
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Upload complete. ${successCount} records added, ${errorCount} errors`,
      data: { successCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('Upload MD Excel error:', error);
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

// SALES VISIT CONTROLLERS (similar to MD)

const getAllSalesVisits = async (req, res) => {
  try {
    const { username, datevisit, status } = req.query;

    let query = 'SELECT * FROM datavisitsales WHERE 1=1';
    const params = [];

    if (username) {
      query += ' AND username = ?';
      params.push(username);
    }

    if (datevisit) {
      query += ' AND datevisit = ?';
      params.push(datevisit);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY datevisit DESC';

    const db = getDatabase('datavisitsales');
    const visits = await getAllRows(db, query, params);

    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    console.error('Get Sales visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Sales visits',
      error: error.message
    });
  }
};

const getSalesVisitById = async (req, res) => {
  try {
    const { id } = req.params;

    const db = getDatabase('datavisitsales');
    const visit = await getRow(
      db,
      'SELECT * FROM datavisitsales WHERE id = ?',
      [id]
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Sales visit not found'
      });
    }

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    console.error('Get Sales visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Sales visit',
      error: error.message
    });
  }
};

const addSalesVisit = async (req, res) => {
  try {
    const { username, amo, warehouse, idoutlet, namaoutlet, datevisit } = req.body;

    if (!username || !idoutlet || !namaoutlet || !datevisit) {
      return res.status(400).json({
        success: false,
        message: 'Username, idoutlet, namaoutlet, and datevisit are required'
      });
    }

    const db = getDatabase('datavisitsales');
    const result = await runQuery(
      db,
      'INSERT INTO datavisitsales (username, amo, warehouse, idoutlet, namaoutlet, datevisit, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, amo, warehouse, idoutlet, namaoutlet, datevisit, 'scheduled']
    );

    res.status(201).json({
      success: true,
      message: 'Sales visit added successfully',
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error('Add Sales visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add Sales visit',
      error: error.message
    });
  }
};

const editSalesVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, amo, warehouse, idoutlet, namaoutlet, datevisit, status } = req.body;

    const db = getDatabase('datavisitsales');
    
    const visit = await getRow(
      db,
      'SELECT * FROM datavisitsales WHERE id = ?',
      [id]
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Sales visit not found'
      });
    }

    await runQuery(
      db,
      'UPDATE datavisitsales SET username = ?, amo = ?, warehouse = ?, idoutlet = ?, namaoutlet = ?, datevisit = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        username || visit.username,
        amo || visit.amo,
        warehouse || visit.warehouse,
        idoutlet || visit.idoutlet,
        namaoutlet || visit.namaoutlet,
        datevisit || visit.datevisit,
        status || visit.status,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Sales visit updated successfully'
    });
  } catch (error) {
    console.error('Edit Sales visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Sales visit',
      error: error.message
    });
  }
};

const deleteSalesVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const db = getDatabase('datavisitsales');
    
    const visit = await getRow(
      db,
      'SELECT * FROM datavisitsales WHERE id = ?',
      [id]
    );

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Sales visit not found'
      });
    }

    await runQuery(
      db,
      'DELETE FROM datavisitsales WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Sales visit deleted successfully'
    });
  } catch (error) {
    console.error('Delete Sales visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Sales visit',
      error: error.message
    });
  }
};

const uploadSalesExcel = async (req, res) => {
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
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid Excel file: No worksheet found'
      });
    }

    const db = getDatabase('datavisitsales');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const username = row.getCell(1).value;
      const amo = row.getCell(2).value;
      const warehouse = row.getCell(3).value;
      const idoutlet = row.getCell(4).value;
      const namaoutlet = row.getCell(5).value;
      const datevisit = row.getCell(6).value;

      if (!username || !idoutlet || !namaoutlet || !datevisit) {
        errorCount++;
        errors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      try {
        await runQuery(
          db,
          'INSERT INTO datavisitsales (username, amo, warehouse, idoutlet, namaoutlet, datevisit, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [username, amo, warehouse, idoutlet, namaoutlet, datevisit, 'scheduled']
        );
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Upload complete. ${successCount} records added, ${errorCount} errors`,
      data: { successCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('Upload Sales Excel error:', error);
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
  getAllMdVisits,
  getMdVisitById,
  addMdVisit,
  editMdVisit,
  deleteMdVisit,
  uploadMdExcel,
  getAllSalesVisits,
  getSalesVisitById,
  addSalesVisit,
  editSalesVisit,
  deleteSalesVisit,
  uploadSalesExcel
};
