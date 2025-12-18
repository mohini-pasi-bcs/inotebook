import React, { useState } from 'react';
import axios from 'axios';
import NoteForm from './NoteForm';

function NoteList({ notes = [], refreshNotes, user }) {
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deletingNote, setDeletingNote] = useState(null);

  const deleteNote = async (id) => {
    if (!id) {
      alert('Note ID missing!');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    setDeletingNote(id);
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      refreshNotes();
    } catch (err) {
      console.error('Delete failed:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to delete note');
    } finally {
      setDeletingNote(null);
    }
  };

  // Safe check for notes
  const safeNotes = notes || [];

  // Get all unique tags
  const allTags = ['all', ...new Set(safeNotes.map(note => note.tag || 'Untagged'))];

  // Filter and sort notes
  const filteredNotes = safeNotes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag === 'all' || (note.tag || 'Untagged') === selectedTag;
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // Group notes by tag for tag view
  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const tag = note.tag || 'Untagged';
    if (!groups[tag]) {
      groups[tag] = [];
    }
    groups[tag].push(note);
    return groups;
  }, {});

  // Add welcome message
  if (safeNotes.length === 0) {
    return (
      <div>
        {editingNote && (
          <NoteForm 
            existingNote={editingNote} 
            refreshNotes={() => {
              refreshNotes();
              setEditingNote(null);
            }} 
            onClose={() => setEditingNote(null)}
          />
        )}
        
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📝</div>
          <h2 style={styles.emptyTitle}>Welcome, {user?.name || 'User'}!</h2>
          <p style={styles.emptyText}>You don't have any notes yet. Create your first note to get started!</p>
          <div style={styles.emptyTips}>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>💡</span>
              Click "Create New Note" above to add your first note
            </div>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>🏷️</span>
              Use tags to organize your notes by category
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {editingNote && (
        <NoteForm 
          existingNote={editingNote} 
          refreshNotes={() => {
            refreshNotes();
            setEditingNote(null);
          }} 
          onClose={() => setEditingNote(null)}
        />
      )}

      {/* Header with stats and controls */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Notes</h2>
          <p style={styles.subtitle}>
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedTag !== 'all' && ` in "${selectedTag}"`}
          </p>
        </div>
        
        <button 
          onClick={refreshNotes}
          style={styles.refreshButton}
          title="Refresh notes"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={styles.clearSearch}
            >
              ✕
            </button>
          )}
        </div>
        
        <div style={styles.filterControls}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filter by tag:</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={styles.filterSelect}
            >
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag === 'all' ? 'All Tags' : tag}
                </option>
              ))}
            </select>
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div style={styles.noResults}>
          <div style={styles.noResultsIcon}>🔍</div>
          <h3 style={styles.noResultsTitle}>No notes found</h3>
          <p style={styles.noResultsText}>
            {searchTerm 
              ? `No notes matching "${searchTerm}"`
              : `No notes in "${selectedTag}" category`
            }
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTag('all');
            }}
            style={styles.clearFiltersButton}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Tag Cloud */}
          {selectedTag === 'all' && (
            <div style={styles.tagCloud}>
              {Object.keys(groupedNotes).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    ...styles.tagButton,
                    backgroundColor: tag === selectedTag ? '#4f46e5' : '#f3f4f6',
                    color: tag === selectedTag ? 'white' : '#374151',
                  }}
                >
                  {tag} ({groupedNotes[tag].length})
                </button>
              ))}
            </div>
          )}

          {/* Notes Grid */}
          <div style={styles.notesGrid}>
            {selectedTag === 'all' && Object.keys(groupedNotes).length > 1 ? (
              // Display grouped by tags
              Object.entries(groupedNotes).map(([tag, tagNotes]) => (
                <div key={tag} style={styles.tagSection}>
                  <div style={styles.tagHeader}>
                    <h3 style={styles.tagTitle}>
                      <span style={styles.tagIcon}>🏷️</span>
                      {tag}
                      <span style={styles.tagCount}>({tagNotes.length})</span>
                    </h3>
                  </div>
                  <div style={styles.tagNotes}>
                    {tagNotes.map(note => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onEdit={setEditingNote}
                        onDelete={deleteNote}
                        isDeleting={deletingNote === note._id}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Display all notes
              <div style={styles.notesGrid}>
                {filteredNotes.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={setEditingNote}
                    onDelete={deleteNote}
                    isDeleting={deletingNote === note._id}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// NoteCard component
function NoteCard({ note, onEdit, onDelete, isDeleting }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formattedDate = note.createdAt 
    ? new Date(note.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <div style={styles.noteCard}>
      <div style={styles.noteHeader}>
        <div style={styles.noteTag}>
          <span style={styles.tagDot}></span>
          {note.tag || 'Untagged'}
        </div>
        <div style={styles.noteDate}>{formattedDate}</div>
      </div>
      
      <h3 style={styles.noteTitle}>{note.title}</h3>
      
      <div style={styles.noteContent}>
        <p style={{
          ...styles.noteDescription,
          maxHeight: isExpanded ? 'none' : '100px',
        }}>
          {note.description}
        </p>
        {note.description.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={styles.expandButton}
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>
      
      <div style={styles.noteActions}>
        <button 
          onClick={() => onEdit(note)} 
          style={styles.editButton}
          title="Edit note"
        >
          <span style={styles.buttonIcon}>✏️</span>
          Edit
        </button>
        <button 
          onClick={() => onDelete(note._id)} 
          disabled={isDeleting}
          style={{
            ...styles.deleteButton,
            backgroundColor: isDeleting ? '#fca5a5' : '#ef4444',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
          }}
          title="Delete note"
        >
          {isDeleting ? (
            <>
              <span style={styles.spinner}></span>
              Deleting...
            </>
          ) : (
            <>
              <span style={styles.buttonIcon}>🗑️</span>
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e5e7eb',
    },
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '32px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'%3E%3C/circle%3E%3Cline x1=\'21\' y1=\'21\' x2=\'16.65\' y2=\'16.65\'%3E%3C/line%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '12px center',
    backgroundSize: '20px',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
    ':hover': {
      color: '#374151',
    },
  },
  filterControls: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    fontSize: '14px',
    color: '#374151',
    minWidth: '150px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  tagCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
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
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  },
  notesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  tagSection: {
    marginBottom: '32px',
  },
  tagHeader: {
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb',
  },
  tagTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tagIcon: {
    fontSize: '18px',
  },
  tagCount: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#6b7280',
    marginLeft: '8px',
  },
  tagNotes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  noteCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
      borderColor: '#d1d5db',
    },
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  noteTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  tagDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#4f46e5',
    borderRadius: '50%',
  },
  noteDate: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  noteTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  noteContent: {
    flex: 1,
    marginBottom: '16px',
  },
  noteDescription: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '0 0 8px 0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
  },
  expandButton: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '4px 0',
    textDecoration: 'underline',
    ':hover': {
      color: '#4338ca',
    },
  },
  noteActions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  editButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e5e7eb',
      transform: 'translateY(-1px)',
    },
  },
  deleteButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    ':hover:not(:disabled)': {
      backgroundColor: '#dc2626',
      transform: 'translateY(-1px)',
    },
  },
  buttonIcon: {
    fontSize: '14px',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 40px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '2px dashed #d1d5db',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 32px 0',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '1.6',
  },
  emptyTips: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  tip: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'left',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  tipIcon: {
    fontSize: '18px',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  noResultsIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  noResultsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  noResultsText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 20px 0',
  },
  clearFiltersButton: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#4338ca',
      transform: 'translateY(-1px)',
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

export default NoteList;