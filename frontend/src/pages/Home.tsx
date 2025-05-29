import React from 'react';
import { Typography, Box, Button, Container, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import EmojiObjectsRoundedIcon from '@mui/icons-material/EmojiObjectsRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <WorkOutlineRoundedIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                    mb: 2,
                    background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Find Your Dream Job
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  mb: 4,
                  color: 'text.secondary',
                  lineHeight: 1.6,
                }}
              >
                Discover personalized job recommendations powered by AI. 
                Upload your CV and let our system match you with the perfect opportunities.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                {user ? (
                  <>
                    <Button
                      component={RouterLink}
                      to="/jobs"
                      variant="contained"
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        boxShadow: 2,
                        fontWeight: 700,
                      }}
                      startIcon={<SearchRoundedIcon />}
                    >
                      Browse Jobs
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/recommendations"
                      variant="outlined"
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                      }}
                      startIcon={<EmojiObjectsRoundedIcon />}
                    >
                      View Recommendations
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="contained"
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        boxShadow: 2,
                        fontWeight: 700,
                      }}
                      startIcon={<PersonAddAltRoundedIcon />}
                    >
                      Get Started
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="outlined"
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                      }}
                      startIcon={<PersonAddAltRoundedIcon />}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative photo/illustration */}
              <Box sx={{ position: 'absolute', top: -30, right: -30, zIndex: 0, opacity: 0.12 }}>
                <img src="https://cdn.pixabay.com/photo/2017/01/31/13/14/job-2021483_1280.png" alt="Job search illustration" width={120} height={120} style={{ borderRadius: '50%' }} />
              </Box>
              <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 600, zIndex: 1, position: 'relative' }}>
                How It Works
              </Typography>
              <Grid container spacing={3}>
                {[
                  {
                    title: 'Create Account',
                    description: 'Sign up and create your professional profile',
                    color: '#2563eb',
                    icon: <PersonAddAltRoundedIcon sx={{ color: '#2563eb' }} fontSize="large" />,
                  },
                  {
                    title: 'Upload CV',
                    description: 'Upload your CV to get personalized recommendations',
                    color: '#7c3aed',
                    icon: <CloudUploadRoundedIcon sx={{ color: '#7c3aed' }} fontSize="large" />,
                  },
                  {
                    title: 'Get Matched',
                    description: 'Receive job recommendations based on your profile',
                    color: '#2563eb',
                    icon: <EmojiObjectsRoundedIcon sx={{ color: '#2563eb' }} fontSize="large" />,
                  },
                ].map((step, index) => (
                  <Grid item xs={12} key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: `${step.color}15`,
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;  
