import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface JobSearchResult {
  job_id: number;
  employer_name: string;
  employer_profile_url?: string;
  employer_profile_website?: string;
  employer_profile_logo?: string;
  job_title: string;
  job_description: string;
  location_name: string;
  minimum_salary?: number;
  maximum_salary?: number;
  currency: string;
  expiration_date: string;
  date_posted: string;
  job_url: string;
  applications: number;
  job_type: string;
}

function JobSearch() {
  const [jobs, setJobs] = useState<JobSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Search parameters
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState(10);
  const [minSalary, setMinSalary] = useState<number | ''>('');
  const [maxSalary, setMaxSalary] = useState<number | ''>('');

  const searchJobs = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (keywords) params.append('keywords', keywords);
      if (location) params.append('location', location);
      if (distance) params.append('distance_from_location', distance.toString());
      if (minSalary) params.append('minimum_salary', minSalary.toString());
      if (maxSalary) params.append('maximum_salary', maxSalary.toString());

      const response = await axios.get(`http://localhost:8000/job-search/search?${params.toString()}`);
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchJobs();
  }, [user]);

  if (!user) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          Please log in to search for jobs
        </Alert>
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
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <SearchRoundedIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" component="h1" fontWeight={800} color="primary">
            Job Search
          </Typography>
        </Box>
        {/* Search Filters */}
        <Card sx={{ mb: 4, boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.08)', borderRadius: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., Python Developer"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., London"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Distance</InputLabel>
                  <Select
                    value={distance}
                    label="Distance"
                    onChange={(e) => setDistance(Number(e.target.value))}
                  >
                    <MenuItem value={5}>5 miles</MenuItem>
                    <MenuItem value={10}>10 miles</MenuItem>
                    <MenuItem value={20}>20 miles</MenuItem>
                    <MenuItem value={30}>30 miles</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Min Salary"
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g., 30000"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Max Salary"
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g., 50000"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={searchJobs}
                  disabled={loading}
                  sx={{ mt: 2, borderRadius: 99, fontWeight: 700, fontSize: 18, px: 4, py: 1.5, boxShadow: 2 }}
                  startIcon={<SearchRoundedIcon />}
                >
                  Search Jobs
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Job Results */}
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} key={job.job_id}>
              <Card elevation={3} sx={{ borderRadius: 4, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.08)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)' }, bgcolor: '#f8fafc' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <WorkOutlineRoundedIcon color="primary" sx={{ fontSize: 28 }} />
                        <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
                          {job.job_title}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {job.employer_name} • {job.location_name}
                      </Typography>
                    </Box>
                    <Box>
                      {/* Removed Chip that rendered the empty blue circle */}
                    </Box>
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
                    {job.job_description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {job.minimum_salary && (
                      <Chip
                        label={`Min: ${job.minimum_salary} ${job.currency}`}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {job.maximum_salary && (
                      <Chip
                        label={`Max: ${job.maximum_salary} ${job.currency}`}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    <Button
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
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

export default JobSearch; 