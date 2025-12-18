import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NoteForm({ refreshNotes, existingNote, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  // Remove unused setTags:
  const tags = ['General', 'Work', 'Personal', 'Ideas', 'Tasks', 'Important'];

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title || '');
      setDescription(existingNote.description || '');
      setTag(existingNote.tag || '');
      setCharCount(existingNote.description?.length || 0);
    } else {
      setTitle('');
      setDescription('');
      setTag('');
      setCharCount(0);
    }
    setError('');
  }, [existingNote]);

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setCharCount(value.length);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  // Validation
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  
  if (!trimmedTitle) {
    setError('Title is required');
    return;
  }
  
  if (!trimmedDescription) {
    setError('Description is required');
    return;
  }

  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    setError('You are not logged in. Please login again.');
    return;
  }

  console.log('Token for request:', token.substring(0, 50) + '...');
  
  setLoading(true);
  
  try {
    const noteId = existingNote?._id;
    const url = noteId 
      ? `http://localhost:5000/api/notes/${noteId}`
      : 'http://localhost:5000/api/notes';
    
    const method = noteId ? 'put' : 'post';
    const data = { 
      title: trimmedTitle, 
      description: trimmedDescription, 
      tag: tag.trim() || 'General' 
    };

    console.log('Sending request to:', url);
    console.log('With data:', data);

    const response = await axios({
      method,
      url,
      data,
      headers: {
        'x-auth-token': token  // Explicitly send token
      }
    });

    console.log('✅ Note saved:', response.data);

    // Clear form
    setTitle('');
    setDescription('');
    setTag('');
    setCharCount(0);
    
    // Refresh notes list
    refreshNotes();
    
    // Close form if in modal/edit mode
    if (onClose) {
      setTimeout(() => onClose(), 300);
    }
    
  } catch (err) {
    console.error('❌ Save error:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
    
    if (err.response?.status === 401) {
      setError('Your session has expired. Please logout and login again.');
    } else if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else if (err.message.includes('Network Error')) {
      setError('Cannot connect to server. Make sure backend is running.');
    } else {
      setError('Failed to save note. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleTagSelect = (selectedTag) => {
    setTag(selectedTag);
  };

  const handleClearForm = () => {
    setTitle('');
    setDescription('');
    setTag('');
    setCharCount(0);
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {existingNote ? '✏️ Edit Note' : '📝 Create New Note'}
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            style={styles.closeButton}
            title="Close"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Title <span style={styles.required}>*</span>
            <span style={styles.charCounter}>
              {title.length}/100
            </span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            required
            disabled={loading}
            maxLength={100}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <div style={styles.descriptionHeader}>
            <label style={styles.label}>
              Description <span style={styles.required}>*</span>
            </label>
            <div style={styles.charCounter}>
              {charCount}/1000 characters
            </div>
          </div>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Write your note here..."
            required
            disabled={loading}
            rows={6}
            maxLength={1000}
            style={styles.textarea}
          />
          <div style={styles.descriptionFooter}>
            <div style={styles.tip}>
              💡 Tip: Keep your notes organized and concise
            </div>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Tag
          </label>
          <div style={styles.tagContainer}>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Type a tag or select below"
              disabled={loading}
              maxLength={20}
              style={styles.tagInput}
            />
            <div style={styles.suggestedTags}>
              <span style={styles.suggestedLabel}>Quick tags:</span>
              {tags.map((tagOption) => (
                <button
                  key={tagOption}
                  type="button"
                  onClick={() => handleTagSelect(tagOption)}
                  style={{
                    ...styles.tagButton,
                    backgroundColor: tag === tagOption ? '#4f46e5' : '#f3f4f6',
                    color: tag === tagOption ? 'white' : '#374151',
                  }}
                >
                  {tagOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.submitButton,
              backgroundColor: loading ? '#ccc' : existingNote ? '#10b981' : '#4f46e5',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                {existingNote ? 'Updating...' : 'Saving...'}
              </div>
            ) : (
              <>
                {existingNote ? '✓ Update Note' : '+ Create Note'}
              </>
            )}
          </button>
          
          <div style={styles.secondaryButtons}>
            <button 
              type="button" 
              onClick={handleClearForm}
              disabled={loading}
              style={styles.clearButton}
            >
              Clear
            </button>
            
            {onClose && (
              <button 
                type="button" 
                onClick={onClose}
                disabled={loading}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    padding: '24px',
    border: '1px solid #e5e7eb',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#6b7280',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f3f4f6',
      color: '#374151',
    },
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  required: {
    color: '#ef4444',
  },
  charCounter: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 'normal',
  },
  descriptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
    ':disabled': {
      backgroundColor: '#f3f4f6',
      cursor: 'not-allowed',
    },
  },
  textarea: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '120px',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
    ':disabled': {
      backgroundColor: '#f3f4f6',
      cursor: 'not-allowed',
    },
  },
  descriptionFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  tip: {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  tagContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tagInput: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
    ':disabled': {
      backgroundColor: '#f3f4f6',
      cursor: 'not-allowed',
    },
  },
  suggestedTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  suggestedLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginRight: '8px',
  },
  tagButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      opacity: '0.9',
      transform: 'translateY(-1px)',
    },
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px',
  },
  submitButton: {
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    transition: 'all 0.2s',
    ':hover:not(:disabled)': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  secondaryButtons: {
    display: 'flex',
    gap: '12px',
  },
  clearButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover:not(:disabled)': {
      backgroundColor: '#f9fafb',
      borderColor: '#9ca3af',
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover:not(:disabled)': {
      backgroundColor: '#f9fafb',
      borderColor: '#9ca3af',
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default NoteForm;