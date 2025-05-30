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
  Drawer,
  Toolbar,
  AppBar,
  ListItemIcon,
  Avatar,
  Tooltip,
  Fab,
  Zoom,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SearchIcon from '@mui/icons-material/Search';
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
  const [sidebarIndex, setSidebarIndex] = useState(0);
  const drawerWidth = 240;
  const [jobSearch, setJobSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

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
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#f3f6fa',
            borderRight: '1px solid #e0e7ef',
            boxShadow: 2,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            top: 64,
            height: 'calc(100vh - 64px)',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
          <Typography variant="h6" fontWeight={800} color="primary" sx={{ mb: 2 }}>
            Admin Panel
          </Typography>
        </Box>
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {[
              { label: 'Analytics & Reports', icon: <BarChartIcon /> },
              { label: 'Job Management', icon: <WorkIcon /> },
              { label: 'User Management', icon: <PeopleIcon /> },
            ].map((item, idx) => (
              <ListItem
                button
                key={item.label}
                selected={sidebarIndex === idx}
                onClick={() => setSidebarIndex(idx)}
                sx={{
                  my: 1,
                  mx: 2,
                  borderRadius: 2,
                  bgcolor: sidebarIndex === idx ? 'primary.100' : 'transparent',
                  color: sidebarIndex === idx ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: 'primary.50',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: sidebarIndex === idx ? 'primary.main' : 'text.secondary',
                    minWidth: 36,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: sidebarIndex === idx ? 700 : 500,
                    fontSize: 17,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 4,
          ml: `${drawerWidth}px`,
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        {/* Decorative SVG Blob */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -120,
            width: 320,
            height: 320,
            zIndex: 0,
            opacity: 0.12,
            pointerEvents: 'none',
          }}
        >
          <svg viewBox="0 0 400 400" fill="none" width="100%" height="100%">
            <ellipse cx="200" cy="200" rx="180" ry="180" fill="#2563eb" />
            <ellipse cx="320" cy="120" rx="60" ry="60" fill="#7c3aed" />
            <ellipse cx="100" cy="320" rx="40" ry="40" fill="#60a5fa" />
          </svg>
        </Box>
        {sidebarIndex === 0 && (
          // Analytics & Reports Dashboard
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
                  {[
                    { label: 'Users', value: stats.user_count, icon: <PeopleIcon />, color: 'primary' },
                    { label: 'CVs', value: stats.cv_count, icon: <DescriptionRoundedIcon />, color: 'secondary' },
                    { label: 'Jobs', value: stats.job_count, icon: <WorkIcon />, color: 'success' },
                    { label: 'Matches', value: stats.recommendation_count, icon: <BarChartIcon />, color: 'info' },
                  ].map((stat, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={stat.label}>
                      <Card sx={{
                        bgcolor: `${stat.color}.main`,
                        color: `${stat.color}.contrastText`,
                        borderRadius: 4,
                        boxShadow: 3,
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        minHeight: 90,
                      }}>
                        <Avatar sx={{ bgcolor: `${stat.color}.light`, mr: 2 }}>
                          {stat.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{stat.label}</Typography>
                          <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" fontWeight={700} mb={1}>Recent Users</Typography>
                    <List dense>
                      {stats.recent.users.map((u: any) => (
                        <ListItem key={u.id} sx={{ borderRadius: 2, '&:hover': { bgcolor: 'primary.50' } }}>
                          <ListItemText primary={u.username} secondary={u.created_at ? new Date(u.created_at).toLocaleString() : ''} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" fontWeight={700} mb={1}>Recent CVs</Typography>
                    <List dense>
                      {stats.recent.cvs.map((c: any) => (
                        <ListItem key={c.id} sx={{ borderRadius: 2, '&:hover': { bgcolor: 'secondary.50' } }}>
                          <ListItemText primary={c.filename} secondary={c.created_at ? new Date(c.created_at).toLocaleString() : ''} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" fontWeight={700} mb={1}>Recent Jobs</Typography>
                    <List dense>
                      {stats.recent.jobs.map((j: any) => (
                        <ListItem key={j.id} sx={{ borderRadius: 2, '&:hover': { bgcolor: 'success.50' } }}>
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {stats.top_skills.length === 0 ? (
                        <Chip label="No data" />
                      ) : (
                        stats.top_skills.map(([skill, count]: [string, number]) => (
                          <Chip key={skill} label={`${skill} (${count})`} color="primary" variant="outlined" />
                        ))
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={700} mb={1}>Top Locations</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {stats.top_locations.length === 0 ? (
                        <Chip label="No data" />
                      ) : (
                        stats.top_locations.map(([loc, count]: [string, number]) => (
                          <Chip key={loc} label={`${loc} (${count})`} color="secondary" variant="outlined" />
                        ))
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </>
            ) : null}
          </Box>
        )}
        {sidebarIndex === 1 && (
          // Job Management Section
          <Box position="relative">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1">
                Admin Panel - Job Management
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search jobs..."
                value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{ width: 300, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}
              />
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 3 }}>
              <Table sx={{ minWidth: 650 }} stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.100' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.filter(job =>
                    job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                    job.description.toLowerCase().includes(jobSearch.toLowerCase())
                  ).map((job, idx) => (
                    <TableRow
                      key={job.id}
                      sx={{
                        bgcolor: idx % 2 === 0 ? 'grey.50' : 'background.paper',
                        '&:hover': { bgcolor: 'primary.50', boxShadow: 2 },
                        borderRadius: 3,
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: 'primary.light', fontWeight: 700 }}>
                            {job.title[0]}
                          </Avatar>
                          <Typography fontWeight={600}>{job.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{job.description}</TableCell>
                      <TableCell>
                        <Chip label={new Date(job.created_at).toLocaleDateString()} color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit" arrow TransitionComponent={Zoom}>
                          <span>
                            <IconButton color="primary" onClick={() => handleOpenDialog(job)}>
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete" arrow TransitionComponent={Zoom}>
                          <span>
                            <IconButton color="error" onClick={() => handleDelete(job.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Tooltip title="Add New Job" arrow TransitionComponent={Zoom}>
              <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1201 }}
                onClick={() => handleOpenDialog()}
              >
                <EditIcon />
              </Fab>
            </Tooltip>
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
          </Box>
        )}
        {sidebarIndex === 2 && (
          // User Management Section
          <Box mt={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
              <Typography variant="h4" component="h2" gutterBottom>
                User Management
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search users..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{ width: 300, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}
              />
            </Box>
            {usersError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {usersError}
              </Alert>
            )}
            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 3 }}>
              <Table sx={{ minWidth: 650 }} stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.100' }}>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.filter(user =>
                    user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                    user.email.toLowerCase().includes(userSearch.toLowerCase())
                  ).map((user, idx) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        bgcolor: idx % 2 === 0 ? 'grey.50' : 'background.paper',
                        '&:hover': { bgcolor: 'secondary.50', boxShadow: 2 },
                        borderRadius: 3,
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: user.is_admin ? 'secondary.main' : 'primary.light', fontWeight: 700 }}>
                            {user.username[0].toUpperCase()}
                          </Avatar>
                          <Typography fontWeight={600}>{user.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_admin ? 'Admin' : 'User'}
                          color={user.is_admin ? 'secondary' : 'primary'}
                          variant={user.is_admin ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={new Date(user.created_at).toLocaleDateString()} color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit" arrow TransitionComponent={Zoom}>
                          <span>
                            <IconButton color="primary" onClick={() => handleEditUserOpen(user)}>
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete" arrow TransitionComponent={Zoom}>
                          <span>
                            <IconButton color="error" onClick={() => handleDeleteUserOpen(user)}>
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Edit User Dialog */}
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
            {/* Delete User Dialog */}
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
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AdminPanel; 