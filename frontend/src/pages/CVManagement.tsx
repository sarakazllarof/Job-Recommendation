import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Divider } from '@mui/material';
import CVUpload from '../components/CVUpload';
import CVList from '../components/CVList';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

const CVManagement: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: 6,
      position: 'relative',
    }}>
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
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={3} sx={{ borderRadius: 4, p: { xs: 2, sm: 4 }, mb: 4, boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.08)' }}>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <DescriptionRoundedIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h3" fontWeight={800} color="primary">
              CV Management
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {/* Upload Section */}
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={600} mb={2}>
              Upload New CV
            </Typography>
          </Box>
          <CVUpload onUploadSuccess={handleUploadSuccess} />
        </Paper>
        <Paper elevation={2} sx={{ borderRadius: 4, p: { xs: 2, sm: 4 }, boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.06)' }}>
          <Typography variant="h5" fontWeight={600} mb={2}>
            Your CVs
          </Typography>
          <CVList key={refreshTrigger} />
        </Paper>
      </Container>
    </Box>
  );
};

export default CVManagement; 