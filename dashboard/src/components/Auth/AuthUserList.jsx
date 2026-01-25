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
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, AdminPanelSettings, Person } from '@mui/icons-material';
import { authAPI } from '../../services/api';

function AuthUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    access_level: 'user',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data.data);
      setError('');
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '',
        access_level: user.access_level,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        access_level: 'user',
      });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Update user
        const updateData = {
          username: formData.username,
          access_level: formData.access_level,
        };
        
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await authAPI.updateUser(editingUser.id, updateData);
        setSuccess('User updated successfully');
      } else {
        // Create new user
        if (!formData.password) {
          setError('Password is required for new users');
          return;
        }
        
        await authAPI.createUser(formData);
        setSuccess('User created successfully');
      }
      
      handleCloseDialog();
      loadUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        await authAPI.deleteUser(id);
        setSuccess('User deleted successfully');
        loadUsers();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete user');
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Login User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Login User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Access Level</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {user.access_level === 'admin' ? (
                        <AdminPanelSettings color="primary" fontSize="small" />
                      ) : (
                        <Person color="action" fontSize="small" />
                      )}
                      {user.username}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.access_level}
                      color={user.access_level === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(user.updated_at).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(user.id, user.username)}
                      color="error"
                      size="small"
                      disabled={user.username === 'admin-gis'}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit Login User' : 'Add Login User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={!!editingUser}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText={editingUser ? 'Leave blank to keep current password' : 'Required for new users'}
            required={!editingUser}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Access Level</InputLabel>
            <Select
              value={formData.access_level}
              label="Access Level"
              onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AuthUserList;
