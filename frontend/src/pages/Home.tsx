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
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

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
          <Grid>
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

          <Grid>
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
              <Box sx={{ position: 'relative', mb: 4 }}>
                {/* Decorative SVG connector */}
                <Box sx={{ position: 'absolute', top: 48, left: 0, right: 0, zIndex: 0, display: { xs: 'none', md: 'block' } }}>
                  <svg width="100%" height="32" viewBox="0 0 900 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="80" y1="16" x2="820" y2="16" stroke="#e0e7ef" strokeWidth="4" strokeDasharray="12 12" />
                  </svg>
                </Box>
                <Grid container spacing={4} justifyContent="center" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
                  {[
                    {
                      icon: <PersonAddAltRoundedIcon sx={{ fontSize: 40, color: 'primary.main', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' } }} />,
                      title: 'Create Account',
                      desc: 'Sign up and create your professional profile',
                      tooltip: 'Start by creating your free account.',
                    },
                    {
                      icon: <CloudUploadRoundedIcon sx={{ fontSize: 40, color: 'secondary.main', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' } }} />,
                      title: 'Upload CV',
                      desc: 'Upload your CV to get personalized recommendations',
                      tooltip: 'Upload your latest CV for best results.',
                    },
                    {
                      icon: <EmojiObjectsRoundedIcon sx={{ fontSize: 40, color: 'info.main', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' } }} />,
                      title: 'Get Matched',
                      desc: 'Receive job recommendations based on your profile',
                      tooltip: 'Our AI matches you with the best jobs.',
                    },
                  ].map((step, idx) => (
                    <Grid key={step.title}>
                      <Fade in timeout={600 + idx * 200}>
                        <Box
                          tabIndex={0}
                          aria-label={`Step ${idx + 1}: ${step.title}`}
                          sx={{
                            bgcolor: 'white',
                            borderRadius: 4,
                            boxShadow: 3,
                            p: 4,
                            textAlign: 'center',
                            transition: 'box-shadow 0.2s, transform 0.2s',
                            outline: 'none',
                            '&:hover, &:focus': {
                              boxShadow: 6,
                              transform: 'translateY(-4px) scale(1.03)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 18,
                                mb: 1,
                              }}
                            >
                              {idx + 1}
                            </Box>
                            <Tooltip title={step.tooltip} arrow>
                              <span>{step.icon}</span>
                            </Tooltip>
                          </Box>
                          <Typography variant="h5" fontWeight={700} gutterBottom>
                            {step.title}
                          </Typography>
                          <Typography color="text.secondary">{step.desc}</Typography>
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Box textAlign="center" mt={4}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ borderRadius: 3, fontWeight: 700, px: 5, py: 1.5 }}
                  component={RouterLink}
                  to="/register"
                >
                  Get Started
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;  
