import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Edit, Delete, Upload } from '@mui/icons-material';
import { visitAPI, userAPI, outletAPI } from '../../services/api';

function VisitSchedule() {
  const [tabValue, setTabValue] = useState(0);
  const [mdVisits, setMdVisits] = useState([]);
  const [salesVisits, setSalesVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    amo: '',
    warehouse: '',
    idoutlet: '',
    namaoutlet: '',
    datevisit: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mdResponse, salesResponse, usersResponse, outletsResponse] = await Promise.all([
        visitAPI.getMD(),
        visitAPI.getSales(),
        userAPI.getAll(),
        outletAPI.getAll(),
      ]);
      setMdVisits(mdResponse.data.data);
      setSalesVisits(salesResponse.data.data);
      setUsers(usersResponse.data.data);
      setOutlets(outletsResponse.data.data);
      setError('');
    } catch (error) {
      setError('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVisits = async () => {
    try {
      const [mdResponse, salesResponse] = await Promise.all([
        visitAPI.getMD(),
        visitAPI.getSales(),
      ]);
      setMdVisits(mdResponse.data.data);
      setSalesVisits(salesResponse.data.data);
      setError('');
    } catch (error) {
      setError('Failed to load visits');
      console.error('Error loading visits:', error);
    }
  };

  const handleOpenDialog = (visit = null) => {
    if (visit) {
      setEditingVisit(visit);
      setFormData({
        username: visit.username,
        amo: visit.amo,
        warehouse: visit.warehouse,
        idoutlet: visit.idoutlet,
        namaoutlet: visit.namaoutlet,
        datevisit: visit.datevisit,
      });
    } else {
      setEditingVisit(null);
      setFormData({
        username: '',
        amo: '',
        warehouse: '',
        idoutlet: '',
        namaoutlet: '',
        datevisit: '',
      });
    }
    setOpenDialog(true);
  };

  const handleUsernameChange = (e) => {
    const selectedUsername = e.target.value;
    const selectedUser = users.find(u => u.username === selectedUsername);
    
    setFormData({
      ...formData,
      username: selectedUsername,
      amo: selectedUser?.amo || '',
      warehouse: selectedUser?.warehouse || '',
    });
  };

  const handleOutletChange = (e) => {
    const selectedOutletId = e.target.value;
    const selectedOutlet = outlets.find(o => o.idoutlet === selectedOutletId);
    
    setFormData({
      ...formData,
      idoutlet: selectedOutletId,
      namaoutlet: selectedOutlet?.namaoutlet || '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVisit(null);
  };

  const handleUploadDialogOpen = () => {
    setUploadMessage('');
    setUploadSuccess(false);
    setOpenUploadDialog(true);
  };

  const handleUploadDialogClose = () => {
    setOpenUploadDialog(false);
    setUploadMessage('');
    setUploadSuccess(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadMessage('');

    try {
      const isMD = tabValue === 0;
      const response = isMD
        ? await visitAPI.uploadMDExcel(file)
        : await visitAPI.uploadSalesExcel(file);

      setUploadSuccess(true);
      setUploadMessage(`✓ ${response.data.message}`);
      loadVisits();
      setTimeout(() => {
        handleUploadDialogClose();
      }, 2000);
    } catch (error) {
      setUploadSuccess(false);
      setUploadMessage(`✗ ${error.response?.data?.message || 'Upload failed'}`);
    } finally {
      setUploadLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleSubmit = async () => {
    try {
      const isMD = tabValue === 0;
      if (editingVisit) {
        if (isMD) {
          await visitAPI.updateMD(editingVisit.id, formData);
        } else {
          await visitAPI.updateSales(editingVisit.id, formData);
        }
      } else {
        if (isMD) {
          await visitAPI.createMD(formData);
        } else {
          await visitAPI.createSales(formData);
        }
      }
      handleCloseDialog();
      loadVisits();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save visit');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this visit?')) {
      try {
        const isMD = tabValue === 0;
        if (isMD) {
          await visitAPI.deleteMD(id);
        } else {
          await visitAPI.deleteSales(id);
        }
        loadVisits();
      } catch (error) {
        setError('Failed to delete visit');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const currentVisits = tabValue === 0 ? mdVisits : salesVisits;
  const visitType = tabValue === 0 ? 'MD' : 'Sales';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Visit Schedule</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={handleUploadDialogOpen}
            color="success"
          >
            Upload Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add {visitType} Visit
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="MD Visits" />
          <Tab label="Sales Visits" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>AMO</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell>ID Outlet</TableCell>
                <TableCell>Nama Outlet</TableCell>
                <TableCell>Date Visit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentVisits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{visit.username}</TableCell>
                  <TableCell>{visit.amo}</TableCell>
                  <TableCell>{visit.warehouse}</TableCell>
                  <TableCell>{visit.idoutlet}</TableCell>
                  <TableCell>{visit.namaoutlet}</TableCell>
                  <TableCell>{visit.datevisit}</TableCell>
                  <TableCell>{visit.status}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(visit)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(visit.id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVisit ? `Edit ${visitType} Visit` : `Add ${visitType} Visit`}
        </DialogTitle>
        <DialogContent>
          <FormControl margin="normal" fullWidth>
            <InputLabel>Username *</InputLabel>
            <Select
              value={formData.username}
              onChange={handleUsernameChange}
              label="Username *"
            >
              <MenuItem value="">-- Select Username --</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.username} value={user.username}>
                  {user.username} - {user.nama}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            label="AMO"
            value={formData.amo}
            disabled
            helperText="Auto-filled from user"
          />

          <TextField
            margin="normal"
            fullWidth
            label="Warehouse"
            value={formData.warehouse}
            disabled
            helperText="Auto-filled from user"
          />

          <FormControl margin="normal" fullWidth>
            <InputLabel>ID Outlet *</InputLabel>
            <Select
              value={formData.idoutlet}
              onChange={handleOutletChange}
              label="ID Outlet *"
            >
              <MenuItem value="">-- Select Outlet --</MenuItem>
              {outlets.map((outlet) => (
                <MenuItem key={outlet.idoutlet} value={outlet.idoutlet}>
                  {outlet.idoutlet} - {outlet.namaoutlet}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            label="Nama Outlet"
            value={formData.namaoutlet}
            disabled
            helperText="Auto-filled from outlet"
          />

          <TextField
            margin="normal"
            fullWidth
            label="Date Visit"
            type="date"
            value={formData.datevisit}
            onChange={(e) => setFormData({ ...formData, datevisit: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUploadDialog} onClose={handleUploadDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload {visitType} Visits from Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select an Excel file (.xlsx) with the following columns:
            </Typography>
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1, 
              mb: 2,
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              Username | AMO | Warehouse | ID Outlet | Nama Outlet | Date Visit
            </Box>
            
            <input
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              id="visit-file-input"
              type="file"
              onChange={handleFileUpload}
              disabled={uploadLoading}
            />
            <label htmlFor="visit-file-input">
              <Button
                variant="contained"
                component="span"
                fullWidth
                disabled={uploadLoading}
              >
                {uploadLoading ? 'Uploading...' : 'Choose File'}
              </Button>
            </label>

            {uploadMessage && (
              <Alert 
                severity={uploadSuccess ? 'success' : 'error'} 
                sx={{ mt: 2 }}
              >
                {uploadMessage}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VisitSchedule;
