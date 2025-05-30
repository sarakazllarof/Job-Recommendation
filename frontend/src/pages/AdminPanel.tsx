import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Alert,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Job {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

function AdminPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', is_admin: false });
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userActionError, setUserActionError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/jobs');
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const response = await axios.get('http://localhost:8000/auth/users');
      setUsers(response.data);
    } catch (err) {
      setUsersError('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const response = await axios.get('http://localhost:8000/auth/admin/stats');
      setStats(response.data);
    } catch (err) {
      setStatsError('Failed to fetch analytics');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchUsers();
    fetchStats();
  }, []);

  const handleOpenDialog = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        description: job.description,
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingJob) {
        await axios.put(`http://localhost:8000/jobs/${editingJob.id}`, formData);
      } else {
        await axios.post('http://localhost:8000/jobs', formData);
      }
      handleCloseDialog();
      fetchJobs();
    } catch (err) {
      setError('Failed to save job');
    }
  };

  const handleDelete = async (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`http://localhost:8000/jobs/${jobId}`);
        fetchJobs();
      } catch (err) {
        setError('Failed to delete job');
      }
    }
  };

  const handleEditUserOpen = (user: User) => {
    setSelectedUser(user);
    setEditUserForm({ username: user.username, email: user.email, is_admin: user.is_admin });
    setEditUserDialogOpen(true);
    setUserActionError('');
  };

  const handleEditUserClose = () => {
    setEditUserDialogOpen(false);
    setSelectedUser(null);
    setUserActionError('');
  };

  const handleEditUserSubmit = async () => {
    if (!selectedUser) return;
    setUserActionLoading(true);
    setUserActionError('');
    try {
      await axios.put(`http://localhost:8000/auth/users/${selectedUser.id}`, editUserForm);
      setEditUserDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setUserActionError('Failed to update user');
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUserOpen = (user: User) => {
    setSelectedUser(user);
    setDeleteUserDialogOpen(true);
    setUserActionError('');
  };

  const handleDeleteUserClose = () => {
    setDeleteUserDialogOpen(false);
    setSelectedUser(null);
    setUserActionError('');
  };

  const handleDeleteUserConfirm = async () => {
    if (!selectedUser) return;
    setUserActionLoading(true);
    setUserActionError('');
    try {
      await axios.delete(`http://localhost:8000/auth/users/${selectedUser.id}`);
      setDeleteUserDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setUserActionError('Failed to delete user');
    } finally {
      setUserActionLoading(false);
    }
  };

  if (!user?.is_admin) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          You do not have permission to access this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      {/* Analytics & Reports Dashboard */}
      <Box mb={6}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Analytics & Reports
        </Typography>
        {statsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
        ) : statsError ? (
          <Alert severity="error">{statsError}</Alert>
        ) : stats ? (
          <>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#f3f6fa' }}>
                  <CardContent>
                    <Typography variant="h6">Users</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.user_count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#f3f6fa' }}>
                  <CardContent>
                    <Typography variant="h6">CVs</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.cv_count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#f3f6fa' }}>
                  <CardContent>
                    <Typography variant="h6">Jobs</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.job_count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#f3f6fa' }}>
                  <CardContent>
                    <Typography variant="h6">Matches</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.recommendation_count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700} mb={1}>Recent Users</Typography>
                <List dense>
                  {stats.recent.users.map((u: any) => (
                    <ListItem key={u.id}>
                      <ListItemText primary={u.username} secondary={u.created_at ? new Date(u.created_at).toLocaleString() : ''} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700} mb={1}>Recent CVs</Typography>
                <List dense>
                  {stats.recent.cvs.map((c: any) => (
                    <ListItem key={c.id}>
                      <ListItemText primary={c.filename} secondary={c.created_at ? new Date(c.created_at).toLocaleString() : ''} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700} mb={1}>Recent Jobs</Typography>
                <List dense>
                  {stats.recent.jobs.map((j: any) => (
                    <ListItem key={j.id}>
                      <ListItemText primary={j.title} secondary={j.created_at ? new Date(j.created_at).toLocaleString() : ''} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} mb={1}>Top Skills</Typography>
                <List dense>
                  {stats.top_skills.length === 0 ? <ListItem><ListItemText primary="No data" /></ListItem> :
                    stats.top_skills.map(([skill, count]: [string, number]) => (
                      <ListItem key={skill}>
                        <ListItemText primary={skill} secondary={`Count: ${count}`} />
                      </ListItem>
                    ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} mb={1}>Top Locations</Typography>
                <List dense>
                  {stats.top_locations.length === 0 ? <ListItem><ListItemText primary="No data" /></ListItem> :
                    stats.top_locations.map(([loc, count]: [string, number]) => (
                      <ListItem key={loc}>
                        <ListItemText primary={loc} secondary={`Count: ${count}`} />
                      </ListItem>
                    ))}
                </List>
              </Grid>
            </Grid>
          </>
        ) : null}
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Admin Panel - Job Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.description}</TableCell>
                <TableCell>
                  {new Date(job.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(job)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(job.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={6}>
        <Typography variant="h4" component="h2" gutterBottom>
          User Management
        </Typography>
        {usersError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {usersError}
          </Alert>
        )}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Is Admin</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditUserOpen(user)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeleteUserOpen(user)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingJob ? 'Edit Job' : 'Add New Job'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingJob ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editUserDialogOpen} onClose={handleEditUserClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={editUserForm.username}
            onChange={e => setEditUserForm({ ...editUserForm, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={editUserForm.email}
            onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
          />
          <Box mt={2}>
            <label>
              <input
                type="checkbox"
                checked={editUserForm.is_admin}
                onChange={e => setEditUserForm({ ...editUserForm, is_admin: e.target.checked })}
              />{' '}
              Is Admin
            </label>
          </Box>
          {userActionError && <Alert severity="error" sx={{ mt: 2 }}>{userActionError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditUserClose}>Cancel</Button>
          <Button onClick={handleEditUserSubmit} variant="contained" color="primary" disabled={userActionLoading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteUserDialogOpen} onClose={handleDeleteUserClose}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user <b>{selectedUser?.username}</b>?
          {userActionError && <Alert severity="error" sx={{ mt: 2 }}>{userActionError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteUserClose}>Cancel</Button>
          <Button onClick={handleDeleteUserConfirm} variant="contained" color="error" disabled={userActionLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminPanel; 