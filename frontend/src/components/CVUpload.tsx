import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

interface CVUploadProps {
  onUploadSuccess?: () => void;
}

const CVUpload: React.FC<CVUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file type
    const validTypes = ['.pdf', '.docx', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast.error('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/cv/upload-cv/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      toast.success('CV uploaded successfully!');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  return (
    <Box maxWidth={500} mx="auto">
      <Paper
        {...getRootProps()}
        elevation={isDragActive ? 6 : 2}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'primary.50' : 'background.paper',
          borderRadius: 3,
          p: 6,
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
      >
        <input {...getInputProps()} disabled={isUploading} />
        <Box mb={3} display="flex" justifyContent="center">
          <InsertDriveFileRoundedIcon sx={{ fontSize: 56, color: 'primary.main', boxShadow: 3, borderRadius: 2, bgcolor: 'primary.50', p: 1 }} />
        </Box>
        {isUploading ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <CircularProgress size={28} color="primary" />
            <Typography color="text.secondary" mt={1}>Uploading...</Typography>
          </Box>
        ) : isDragActive ? (
          <Typography color="primary.main" fontWeight={500}>Drop your CV here</Typography>
        ) : (
          <>
            <Typography color="text.secondary">Drag and drop your CV here, or click to select</Typography>
            <Typography color="text.secondary" fontSize={14} mt={1}>
              Supported formats: <b>PDF, DOCX, TXT</b>
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CVUpload; 