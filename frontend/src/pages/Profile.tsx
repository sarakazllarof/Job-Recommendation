import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import { useNavigate } from 'react-router-dom';
import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import LinearProgress from '@mui/material/LinearProgress';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

interface CV {
  id: number;
  filename: string;
  file_type: string;
  created_at: string;
}

interface EditData {
  username: string;
  email: string;
  bio: string;
}

function Profile() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<EditData>({ username: '', email: '', bio: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Mock data for new features
  const bio = "Aspiring software engineer passionate about AI and web development. Always learning, always building!";
  const profileCompletion = 80; // percent
  const badges = [
    { icon: <CheckCircleRoundedIcon color="success" />, label: 'CV Uploaded' },
    { icon: <EmojiEventsRoundedIcon color="warning" />, label: 'Profile Complete' },
    { icon: <TimelineRoundedIcon color="info" />, label: 'Active User' },
  ];
  const recentActivity = [
    { text: 'Uploaded a new CV', date: '2024-05-30' },
    { text: 'Updated profile information', date: '2024-05-28' },
    { text: 'Applied to Frontend Developer job', date: '2024-05-25' },
  ];

  useEffect(() => {
    const fetchCVs = async () => {
      if (!user) return;
      try {
        const response = await axios.get('http://localhost:8000/cv/list-cvs/');
        setCvs(response.data);
      } catch (err) {
        setError('Failed to fetch CVs');
      } finally {
        setLoading(false);
      }
    };
    fetchCVs();
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username,
        email: user.email,
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://localhost:8000/cv/upload-cv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess(true);
      // Refresh CV list
      const response = await axios.get('http://localhost:8000/cv/list-cvs/');
      setCvs(response.data);
    } catch (err) {
      setError('Failed to upload CV');
    }
  };

  const handleEditOpen = () => {
    setEditData({ username: user.username, email: user.email, bio: user.bio || '' });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditError('');
  };
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      if (!editData.username || !editData.email) {
        throw new Error('Username and email are required');
      }

      const response = await axios.put('http://localhost:8000/auth/users/me', editData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setEditOpen(false);
      window.location.reload(); // For simplicity, reload to update UI
    } catch (err: any) {
      console.error('Update error:', err.response?.data || err.message);
      // Format the error message properly
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        setEditError(errorDetail.map(err => err.msg).join(', '));
      } else if (typeof errorDetail === 'string') {
        setEditError(errorDetail);
      } else {
        setEditError(err.message || 'Failed to update profile');
      }
    } finally {
      setEditLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          Please log in to view your profile
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box sx={{ position: 'relative', minHeight: '60vh' }}>
        {/* Enhanced SVG Blob Background */}
        <Box sx={{
          position: 'absolute',
          top: { xs: -40, md: -60 },
          left: { xs: -40, md: -80 },
          width: { xs: 180, md: 320 },
          height: { xs: 180, md: 320 },
          zIndex: 0,
          opacity: 0.18,
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <ellipse cx="160" cy="160" rx="140" ry="140" fill="#2563eb" />
            <ellipse cx="220" cy="100" rx="40" ry="40" fill="#7c3aed" />
            <ellipse cx="80" cy="220" rx="30" ry="30" fill="#60a5fa" />
            <rect x="120" y="60" width="80" height="20" rx="10" fill="#fff" opacity="0.7" />
            <rect x="60" y="180" width="60" height="16" rx="8" fill="#fff" opacity="0.5" />
            <rect x="200" y="220" width="40" height="12" rx="6" fill="#fff" opacity="0.4" />
          </svg>
        </Box>
        <Paper elevation={8} sx={{ borderRadius: 6, p: { xs: 2, sm: 3 }, background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', position: 'relative', zIndex: 1, border: '2px solid #2563eb', maxWidth: 700, mx: 'auto' }}>
          {/* Personalized Greeting */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Welcome back, {user.username}!
            </Typography>
            <EmojiEmotionsRoundedIcon color="warning" sx={{ fontSize: 32 }} />
          </Box>
          {/* Profile Completion Progress */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Profile Completion: {profileCompletion}%
            </Typography>
            <LinearProgress variant="determinate" value={profileCompletion} sx={{ height: 10, borderRadius: 5, background: '#e0e7ef', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)' } }} />
          </Box>
          {/* Badges */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {badges.map((badge, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f3f6fa', px: 2, py: 1, borderRadius: 3, boxShadow: 1, fontWeight: 600, fontSize: 15 }}>
                {badge.icon}
                {badge.label}
              </Box>
            ))}
          </Box>
          <Grid container spacing={3} alignItems="stretch">
            {/* User Info */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.97)', mb: 2, boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.10)', borderLeft: '6px solid #2563eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
                <Avatar sx={{ width: 70, height: 70, bgcolor: 'primary.main', fontSize: 32, mb: 2 }}>
                  {user.username ? user.username[0].toUpperCase() : <AccountCircleRoundedIcon fontSize="large" />}
                </Avatar>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditRoundedIcon />}
                  sx={{ position: 'absolute', top: 12, right: 12, borderRadius: 99, fontWeight: 700, fontSize: 14, px: 2, py: 0.5 }}
                  onClick={handleEditOpen}
                >
                  Edit
                </Button>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccountCircleRoundedIcon color="primary" sx={{ fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={800} color="primary.dark" sx={{ letterSpacing: 0.5 }}>
                    User Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, height: 3, border: 'none', background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)', borderRadius: 2 }} />
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BadgeRoundedIcon color="action" sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 600 }}><b>Username:</b> <span style={{ fontWeight: 400 }}>{user.username}</span></Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailRoundedIcon color="action" sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 600 }}><b>Email:</b> <span style={{ fontWeight: 400 }}>{user.email}</span></Typography>
                </Box>
                {/* Bio/About Section */}
                <Divider sx={{ my: 2, height: 2, border: 'none', background: '#e0e7ef', borderRadius: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                  {bio}
                </Typography>
                {/* Edit Profile Dialog */}
                <Dialog open={editOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                      label="Username"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      fullWidth
                    />
                    <TextField
                      label="Bio"
                      name="bio"
                      value={editData.bio}
                      onChange={handleEditChange}
                      fullWidth
                      multiline
                      minRows={2}
                    />
                    {editError && <Alert severity="error">{editError}</Alert>}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleEditClose} disabled={editLoading}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" disabled={editLoading}>
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>
              </Paper>
            </Grid>
            {/* CV Management */}
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.97)', boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.10)', borderLeft: '6px solid #7c3aed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <WorkRoundedIcon color="primary" sx={{ fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={800} color="primary.dark" sx={{ letterSpacing: 0.5 }}>
                    CV Management
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, height: 3, border: 'none', background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)', borderRadius: 2 }} />
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}
                {uploadSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>CV uploaded successfully!</Alert>
                )}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <input
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="cv-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="cv-upload">
                    <Button variant="contained" component="span" startIcon={<InsertDriveFileRoundedIcon />} sx={{ borderRadius: 99, fontWeight: 700, fontSize: 16, px: 3, py: 1, boxShadow: 3, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.05)', boxShadow: 6 } }}>
                      Upload CV
                    </Button>
                  </label>
                </Box>
                {cvs.length > 0 ? (
                  <Stack spacing={2} sx={{ width: '100%' }}>
                    {cvs.map((cv) => (
                      <Card key={cv.id} elevation={2} sx={{ borderRadius: 3, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)', '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.16)' }, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', px: 1 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40, mr: 1 }}>
                            <InsertDriveFileRoundedIcon />
                          </Avatar>
                          <Box>
                            <Typography fontWeight={700} fontSize={16}>{cv.filename}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Uploaded on {new Date(cv.created_at).toLocaleDateString()} | {cv.file_type.toUpperCase()}
                            </Typography>
                          </Box>
                        </CardContent>
                        <Box sx={{ pr: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/cv/${cv.id}`)}
                            sx={{ borderRadius: 99, fontWeight: 700, px: 2, py: 0.5, fontSize: 14, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.07)', boxShadow: 6 } }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">
                    No CVs uploaded yet. Upload your CV to get job recommendations.
                  </Typography>
                )}
              </Paper>
            </Grid>
            {/* Recent Activity */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: '#f3f6fa', boxShadow: '0 1px 6px 0 rgba(31, 38, 135, 0.06)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                  Recent Activity
                </Typography>
                {recentActivity.map((activity, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: 15 }}>
                    <TimelineRoundedIcon color="info" sx={{ fontSize: 18 }} />
                    <span>{activity.text}</span>
                    <span style={{ fontSize: 13, marginLeft: 8, color: '#888' }}>{activity.date}</span>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

export default Profile; 