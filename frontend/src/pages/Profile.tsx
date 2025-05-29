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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';

interface CV {
  id: number;
  filename: string;
  file_type: string;
  created_at: string;
}

function Profile() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ position: 'relative' }}>
        {/* Playful SVG Illustration */}
        <Box sx={{
          position: 'absolute',
          top: { xs: 0, md: -40 },
          right: { xs: -40, md: -80 },
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
        <Paper elevation={6} sx={{ borderRadius: 6, p: { xs: 2, sm: 5 }, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)', position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 4, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <BadgeRoundedIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h3" fontWeight={900} color="primary" gutterBottom letterSpacing={1}>
              Profile
            </Typography>
          </Box>
          <Grid container spacing={5} alignItems="stretch">
            {/* User Info */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', mb: 2, boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.06)' }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccountCircleRoundedIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={800} color="primary.dark" sx={{ letterSpacing: 0.5 }}>
                    User Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, height: 4, border: 'none', background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)', borderRadius: 2 }} />
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BadgeRoundedIcon color="action" sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 600 }}><b>Username:</b> <span style={{ fontWeight: 400 }}>{user.username}</span></Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailRoundedIcon color="action" sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 600 }}><b>Email:</b> <span style={{ fontWeight: 400 }}>{user.email}</span></Typography>
                </Box>
              </Paper>
            </Grid>
            {/* CV Management */}
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.06)' }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <WorkRoundedIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={800} color="primary.dark" sx={{ letterSpacing: 0.5 }}>
                    CV Management
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, height: 4, border: 'none', background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)', borderRadius: 2 }} />
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}
                {uploadSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>CV uploaded successfully!</Alert>
                )}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <input
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="cv-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="cv-upload">
                    <Button variant="contained" component="span" startIcon={<InsertDriveFileRoundedIcon />} sx={{ borderRadius: 99, fontWeight: 700, fontSize: 18, px: 4, py: 1.5, boxShadow: 3 }}>
                      Upload CV
                    </Button>
                  </label>
                </Box>
                {cvs.length > 0 ? (
                  <Stack spacing={3}>
                    {cvs.map((cv) => (
                      <Card key={cv.id} elevation={2} sx={{ borderRadius: 4, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.08)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)' }, bgcolor: '#f8fafc' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2}>
                            <InsertDriveFileRoundedIcon color="primary" sx={{ fontSize: 36 }} />
                            <Box>
                              <Typography fontWeight={700} fontSize={18}>{cv.filename}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Uploaded on {new Date(cv.created_at).toLocaleDateString()} | {cv.file_type.toUpperCase()}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
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
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

export default Profile; 