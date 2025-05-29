import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!cv) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{cv.filename}</h1>
            <p className="text-sm text-gray-500">
              Uploaded on {new Date(cv.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
            {cv.file_type.toUpperCase()}
          </span>
        </div>

        <div className="space-y-6">
          {/* Skills Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Skills</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-800"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {editingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a skill"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveSkills}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cv.parsed_data.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Entities Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Extracted Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(cv.parsed_data.entities).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">{key}</h3>
                  <p className="text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Content Preview</h2>
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              {cv.parsed_data.sentences.map((sentence, index) => (
                <p key={index} className="text-gray-700 mb-2">
                  {sentence}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVView; 