import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Card, CardContent, Typography, Box, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface CV {
  id: number;
  filename: string;
  file_type: string;
  parsed_data: {
    entities: Record<string, string>;
    skills: string[];
  };
  created_at: string;
}

const CVList: React.FC = () => {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCVs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/cv/list-cvs/', {
        withCredentials: true,
      });
      setCVs(response.data);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      toast.error('Failed to load CVs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:8000/cv/delete-cv/${id}/`, { withCredentials: true });
      toast.success('CV deleted successfully!');
      setCVs((prev) => prev.filter((cv) => cv.id !== id));
    } catch (error) {
      toast.error('Failed to delete CV');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (cvs.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography color="text.secondary">No CVs uploaded yet</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {cvs.map((cv) => (
        <Card key={cv.id} elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
              <Box>
                <Typography variant="h6" fontWeight={700}>{cv.filename}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Uploaded on {new Date(cv.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="primary" fontWeight={600}>
                  {cv.file_type.toUpperCase()}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteId(cv.id)}
                  sx={{ ml: 2, mt: { xs: 2, sm: 0 } }}
                  disabled={deleting}
                >
                  Remove
                </Button>
              </Box>
            </Box>

            {cv.parsed_data.skills && cv.parsed_data.skills.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Skills
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {cv.parsed_data.skills.map((skill, idx) => (
                    <Chip key={idx} label={skill} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.href = `/cv/${cv.id}`}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                View Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Remove CV</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this CV? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteId!)} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CVList; 