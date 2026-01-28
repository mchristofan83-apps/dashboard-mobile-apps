const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login with improved security
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Get user from database
    const db = require('../config/database');
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM menulogin WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Compare password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        access_level: user.access_level 
      },
      process.env.JWT_SECRET || 'gis2026-secure-jwt-secret-key',
      { expiresIn: process.env.TOKEN_EXPIRY || '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        access_level: user.access_level
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const db = require('../config/database');
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, username, email, access_level, created_at FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add new user (admin only)
exports.addUser = async (req, res) => {
  try {
    const { username, password, email, access_level = 'user' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    const db = require('../config/database');
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password, email, access_level) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, access_level],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    res.json({
      success: true,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Edit user (admin only)
exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, access_level } = req.body;
    
    const db = require('../config/database');
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET username = ?, email = ?, access_level = ? WHERE id = ?',
        [username, email, access_level, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Edit user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = require('../config/database');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};