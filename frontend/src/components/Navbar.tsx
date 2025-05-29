import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EmojiObjectsRoundedIcon from '@mui/icons-material/EmojiObjectsRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 0 } }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
            <WorkOutlineRoundedIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/" 
              sx={{ 
                textDecoration: 'none', 
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '1.5rem',
                letterSpacing: 1,
                '&:hover': {
                  color: 'primary.dark',
                },
              }}
            >
              JobMatch
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            alignItems: 'center',
          }}>
            {user ? (
              <>
                <Button 
                  color="primary" 
                  component={RouterLink} 
                  to="/jobs"
                  startIcon={<SearchRoundedIcon />}
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  Jobs
                </Button>
                <Button 
                  color="primary" 
                  component={RouterLink} 
                  to="/recommendations"
                  startIcon={<EmojiObjectsRoundedIcon />}
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  Recommendations
                </Button>
                <Button 
                  color="primary" 
                  component={RouterLink} 
                  to="/cvs"
                  startIcon={<DescriptionRoundedIcon />}
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  CV Management
                </Button>
                <Button 
                  color="primary" 
                  component={RouterLink} 
                  to="/profile"
                  startIcon={<PersonRoundedIcon />}
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  Profile
                </Button>
                {user.is_admin && (
                  <Button 
                    color="primary" 
                    component={RouterLink} 
                    to="/admin"
                    startIcon={<AdminPanelSettingsRoundedIcon />}
                    sx={{ 
                      fontWeight: 500,
                      '&:hover': {
                        background: 'rgba(37, 99, 235, 0.1)',
                      },
                    }}
                  >
                    Admin Panel
                  </Button>
                )}
                <Button 
                  variant="outlined"
                  color="primary" 
                  onClick={handleLogout}
                  startIcon={<LogoutRoundedIcon />}
                  sx={{ 
                    fontWeight: 500,
                    borderRadius: '12px',
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="primary" 
                  component={RouterLink} 
                  to="/login"
                  startIcon={<LoginRoundedIcon />}
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  color="primary" 
                  component={RouterLink} 
                  to="/register"
                  startIcon={<PersonAddAltRoundedIcon />}
                  sx={{ 
                    fontWeight: 500,
                    borderRadius: '12px',
                    '&:hover': {
                      background: 'primary.dark',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 