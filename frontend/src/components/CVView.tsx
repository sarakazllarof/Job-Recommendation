import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Box, Typography, Chip, Button, Paper, Grid } from '@mui/material';

interface CV {
  id: number;
  filename: string;
  file_type: string;
  parsed_data: {
    entities: Record<string, string>;
    skills: string[];
    sentences: string[];
  };
  created_at: string;
}

const CVView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cv, setCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSkills, setEditingSkills] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/cv/get-cv/${id}/`, {
          withCredentials: true,
        });
        setCV(response.data);
        setEditingSkills(response.data.parsed_data.skills);
      } catch (error) {
        console.error('Error fetching CV:', error);
        toast.error('Failed to load CV details');
        navigate('/cvs');
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [id, navigate]);

  const handleSaveSkills = async () => {
    if (!cv) return;

    try {
      await axios.put(
        `http://localhost:8000/cv/update-cv/${id}/`,
        {
          skills: editingSkills,
        },
        {
          withCredentials: true,
        }
      );

      setCV({
        ...cv,
        parsed_data: {
          ...cv.parsed_data,
          skills: editingSkills,
        },
      });
      setIsEditing(false);
      toast.success('Skills updated successfully');
    } catch (error) {
      console.error('Error updating skills:', error);
      toast.error('Failed to update skills');
    }
  };

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !editingSkills.includes(skill.trim())) {
      setEditingSkills([...editingSkills, skill.trim()]);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditingSkills(editingSkills.filter((skill) => skill !== skillToRemove));
  };

  const handleDownloadCV = async () => {
    if (!cv) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/cv/download-cv/${cv.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        toast.error('Failed to download file');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cv.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </Box>
    );
  }

  if (!cv) {
    return null;
  }

  return (
    <Box maxWidth="md" mx="auto" py={4}>
      <Paper elevation={3} sx={{ borderRadius: 4, p: { xs: 2, sm: 5 }, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
              {cv.filename}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Uploaded on {new Date(cv.created_at).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip label={cv.file_type.toUpperCase()} color="primary" sx={{ fontWeight: 700, fontSize: 16 }} />
        </Box>

        {/* Skills Section */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={700} color="primary">
              Skills
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => setIsEditing(!isEditing)}
              sx={{ borderRadius: 99, fontWeight: 600 }}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </Box>
          {isEditing ? (
            <Box>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {editingSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    onDelete={() => handleRemoveSkill(skill)}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
              <Box display="flex" gap={2}>
                <input
                  type="text"
                  placeholder="Add a skill"
                  style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e0e7ef' }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveSkills}
                  sx={{ borderRadius: 99, fontWeight: 600 }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {cv.parsed_data.skills.map((skill, index) => (
                <Chip key={index} label={skill} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
              ))}
            </Box>
          )}
        </Box>

        {/* Entities Section */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight={700} color="primary" mb={2}>
            Extracted Information
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(cv.parsed_data.entities).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 3, bgcolor: '#f3f6fa' }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1}>
                    {key}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Content Preview */}
        <Box>
          <Typography variant="h6" fontWeight={700} color="primary" mb={2}>
            Content Preview
          </Typography>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#fafdff', border: '1px solid #e0e7ef', maxHeight: 320, overflowY: 'auto' }}>
            {(() => {
              const text = cv.parsed_data.sentences.join(' ');
              const paragraphs = text.split(/\n\s*\n|(?<=\.)\s{2,}/g).filter(p => p.trim().length > 0);
              return paragraphs.map((para, idx) => {
                const sectionHeader = /^(WORK EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CONTACT|PROFILE|SUMMARY|TRAINING|CERTIFICATES|LANGUAGES|ACHIEVEMENTS|EXPERIENCE|EDUCATION AND TRAINING)/i;
                const lines = para.split(/\n|(?<=\.) /g);
                return (
                  <Box key={idx} mb={3}>
                    {lines.map((line, lidx) =>
                      sectionHeader.test(line.trim()) ? (
                        <Typography key={lidx} variant="subtitle1" fontWeight={700} color="primary" mt={lidx > 0 ? 2 : 0} sx={{ mb: 1 }}>
                          {line.trim()}
                        </Typography>
                      ) : (
                        <Typography key={lidx} variant="body1" color="text.secondary" sx={{ lineHeight: 2, fontSize: 17, mb: 1.5 }}>
                          {line.trim()}
                        </Typography>
                      )
                    )}
                  </Box>
                );
              });
            })()}
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default CVView; 