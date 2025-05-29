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
  Alert,
  Chip,
} from '@mui/material';
import EmojiObjectsRoundedIcon from '@mui/icons-material/EmojiObjectsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Recommendation {
  job_id: number;
  title: string;
  description: string;
  similarity_score: number;
}

function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;

      try {
        const response = await axios.get('http://localhost:8000/jobs/recommendations/');
        setRecommendations(response.data);
      } catch (err) {
        setError('Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (!user) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          Please log in to view your job recommendations
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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          No recommendations available. Please upload your CV to get personalized job recommendations.
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
          <EmojiObjectsRoundedIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" component="h1" fontWeight={800} color="primary">
            Your Job Recommendations
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {recommendations.map((recommendation) => (
            <Grid key={recommendation.job_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" alignItems="center" gap={1}>
                      <StarRoundedIcon sx={{ color: '#fbbf24', fontSize: 28 }} />
                      <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
                        {recommendation.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${Math.round(recommendation.similarity_score * 100)}% Match`}
                      color="primary"
                      icon={<StarRoundedIcon sx={{ color: '#fff' }} />}
                      sx={{ fontWeight: 700, fontSize: 16, px: 1.5, py: 0.5, borderRadius: 2 }}
                    />
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
                    {recommendation.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      component={RouterLink}
                      to={`/jobs/${recommendation.job_id}`}
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

export default Recommendations; 