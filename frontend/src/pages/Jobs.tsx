import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import axios from 'axios';

interface Job {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', py: 6 }}>
      {/* Playful SVG Illustration */}
      <Box sx={{
        position: 'absolute',
        top: { xs: 20, md: 0 },
        right: { xs: -40, md: -120 },
        width: { xs: 200, md: 400 },
        height: { xs: 200, md: 400 },
        zIndex: 0,
        opacity: 0.18,
        pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <ellipse cx="200" cy="200" rx="180" ry="180" fill="#2563eb" />
          <ellipse cx="320" cy="120" rx="60" ry="60" fill="#7c3aed" />
          <ellipse cx="100" cy="320" rx="40" ry="40" fill="#60a5fa" />
          <rect x="180" y="80" width="120" height="30" rx="15" fill="#fff" opacity="0.7" />
          <rect x="60" y="260" width="80" height="20" rx="10" fill="#fff" opacity="0.5" />
          <rect x="300" y="320" width="60" height="16" rx="8" fill="#fff" opacity="0.4" />
        </svg>
      </Box>
      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <WorkOutlineRoundedIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" fontWeight={800} color="primary">
              Available Jobs
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/job-search"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SearchRoundedIcon />}
            sx={{ borderRadius: 99, fontWeight: 700, px: 3, py: 1.2, boxShadow: 2 }}
          >
            Search Jobs
          </Button>
        </Box>
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} key={job.id}>
              <Card elevation={3} sx={{ borderRadius: 4, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.08)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)' }, bgcolor: '#f8fafc' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <WorkOutlineRoundedIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
                      {job.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {job.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      component={RouterLink}
                      to={`/jobs/${job.id}`}
                      variant="contained"
                      color="primary"
                      startIcon={<InfoRoundedIcon />}
                      sx={{ borderRadius: 99, fontWeight: 700, px: 3, py: 1 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Jobs; 