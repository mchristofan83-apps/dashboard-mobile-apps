const db = require('../config/database');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM datauser', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const totalOutlets = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM dataoutlet', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // MD Visit stats
    const totalMdVisits = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM datavisitmd', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const completedMdVisits = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM datavisitmd WHERE status = 'completed'", [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const scheduledMdVisits = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM datavisitmd WHERE status = 'scheduled'", [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Sales Visit stats
    const totalSalesVisits = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM datavisitsales', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const completedSalesVisits = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM datavisitsales WHERE status = 'completed'", [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const scheduledSalesVisits = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM datavisitsales WHERE status = 'scheduled'", [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Visit actions
    const totalVisitActions = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM visitaction', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const completedActions = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM visitaction WHERE checkout_time IS NOT NULL", [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Get recent activities
    const recentActions = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM visitaction ORDER BY created_at DESC LIMIT 10', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get visits by date (last 7 days)
    const mdVisitsByDate = await new Promise((resolve, reject) => {
      db.all(
        `SELECT DATE(datevisit) as date, COUNT(*) as count 
         FROM datavisitmd 
         WHERE datevisit >= DATE('now', '-7 days')
         GROUP BY DATE(datevisit)
         ORDER BY date`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const salesVisitsByDate = await new Promise((resolve, reject) => {
      db.all(
        `SELECT DATE(datevisit) as date, COUNT(*) as count 
         FROM datavisitsales 
         WHERE datevisit >= DATE('now', '-7 days')
         GROUP BY DATE(datevisit)
         ORDER BY date`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Get visits by warehouse
    const mdVisitsByWarehouse = await new Promise((resolve, reject) => {
      db.all(
        `SELECT warehouse, COUNT(*) as count 
         FROM datavisitmd 
         GROUP BY warehouse`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const salesVisitsByWarehouse = await new Promise((resolve, reject) => {
      db.all(
        `SELECT warehouse, COUNT(*) as count 
         FROM datavisitsales 
         GROUP BY warehouse`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Get POSM status distribution
    const posmStats = await new Promise((resolve, reject) => {
      db.all(
        `SELECT status_posm, COUNT(*) as count 
         FROM visitaction 
         WHERE status_posm IS NOT NULL
         GROUP BY status_posm`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers: totalUsers.count,
          totalOutlets: totalOutlets.count,
          totalMdVisits: totalMdVisits.count,
          completedMdVisits: completedMdVisits.count,
          scheduledMdVisits: scheduledMdVisits.count,
          totalSalesVisits: totalSalesVisits.count,
          completedSalesVisits: completedSalesVisits.count,
          scheduledSalesVisits: scheduledSalesVisits.count,
          totalVisitActions: totalVisitActions.count,
          completedActions: completedActions.count
        },
        charts: {
          mdVisitsByDate,
          salesVisitsByDate,
          mdVisitsByWarehouse,
          salesVisitsByWarehouse,
          posmStats
        },
        recentActivities: recentActions
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
};

// Get user-specific dashboard
const getUserDashboard = async (req, res) => {
  try {
    const { username } = req.user;

    // Get user's visits
    const myMdVisits = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM datavisitmd WHERE username = ? ORDER BY datevisit DESC LIMIT 10', [username], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const mySalesVisits = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM datavisitsales WHERE username = ? ORDER BY datevisit DESC LIMIT 10', [username], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get user's visit actions
    const myActions = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM visitaction WHERE username = ? ORDER BY created_at DESC LIMIT 10', [username], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get user's stats
    const myMdVisitsCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM datavisitmd WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const mySalesVisitsCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM datavisitsales WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const myCompletedVisits = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM visitaction WHERE username = ? AND checkout_time IS NOT NULL', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const myTodayVisits = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM visitaction WHERE username = ? AND DATE(created_at) = DATE('now')", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      success: true,
      data: {
        stats: {
          myMdVisitsCount: myMdVisitsCount.count,
          mySalesVisitsCount: mySalesVisitsCount.count,
          myCompletedVisits: myCompletedVisits.count,
          myTodayVisits: myTodayVisits.count
        },
        myMdVisits,
        mySalesVisits,
        myActions
      }
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user dashboard',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getUserDashboard
};
