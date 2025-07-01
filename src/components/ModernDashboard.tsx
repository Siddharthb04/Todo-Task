import React, { useState, useEffect } from 'react';
import { Home, List, Share2, Settings, LogOut, User, Plus, Database, CheckCircle, Zap, Send } from 'lucide-react';
import { ref, push, onValue, update, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { rtdb, auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const ModernDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTaskId, setShareTaskId] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    desc: '',
    priority: 'Medium',
    status: 'Todo',
    due: ''
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [completingId, setCompletingId] = useState(null);
  const [completeError, setCompleteError] = useState('');

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch tasks from RTDB, scoped to current user
  useEffect(() => {
    if (!user) return;
    const tasksRef = ref(rtdb, 'tasks');
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTasks(
          Object.entries(data)
            .map(([id, t]) => ({ id, ...t }))
            .filter((t) => t.uid === user.uid || (t.sharedWith && t.sharedWith.includes(user.email)))
        );
      } else {
        setTasks([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Filtered tasks for each tab
  const userTasks = tasks.filter(t => t.uid === user.uid);
  const sharedTasks = tasks.filter(t => t.sharedWith && t.sharedWith.includes(user.email));
  let displayedTasks = tasks;
  if (activeTab === 'tasks') displayedTasks = userTasks;
  if (activeTab === 'shared') displayedTasks = sharedTasks;

  // Add Task (with user id)
  const handleAddTask = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!form.title.trim() || !user) {
      setAddError('Missing title or user.');
      return;
    }
    setSubmitting(true);
    const tasksRef = ref(rtdb, 'tasks');
    try {
      console.log('Attempting to add task:', { ...form, uid: user.uid, sharedWith: [] });
      await push(tasksRef, {
        title: form.title,
        desc: form.desc,
        priority: form.priority,
        status: form.status,
        due: form.due,
        uid: user.uid,
        sharedWith: []
      });
      setForm({ title: '', desc: '', priority: 'Medium', status: 'Todo', due: '' });
      setShowModal(false);
    } catch (err) {
      console.error('Add task error:', err, { user, form });
      setAddError('Failed to add task: ' + (err && err.message ? err.message : String(err)));
    }
    setSubmitting(false);
  };

  // Share Task
  const handleShareTask = async (e) => {
    e.preventDefault();
    setShareError('');
    if (!shareEmail.trim() || !shareTaskId) return;
    try {
      const task = tasks.find(t => t.id === shareTaskId);
      if (!task) throw new Error('Task not found');
      const sharedWith = Array.isArray(task.sharedWith) ? [...task.sharedWith] : [];
      if (!sharedWith.includes(shareEmail)) sharedWith.push(shareEmail);
      await update(ref(rtdb, `tasks/${shareTaskId}`), { sharedWith });
      setShowShareModal(false);
      setShareEmail('');
      setShareTaskId(null);
    } catch (err) {
      setShareError('Failed to share task. Please try again.');
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    setDeleteError('');
    setDeletingId(taskId);
    try {
      await remove(ref(rtdb, `tasks/${taskId}`));
    } catch (err) {
      setDeleteError('Failed to delete task: ' + (err && err.message ? err.message : String(err)));
    }
    setDeletingId(null);
  };

  // Complete Task
  const handleCompleteTask = async (taskId) => {
    setCompleteError('');
    setCompletingId(taskId);
    try {
      await update(ref(rtdb, `tasks/${taskId}`), { status: 'Done' });
    } catch (err) {
      setCompleteError('Failed to complete task: ' + (err && err.message ? err.message : String(err)));
    }
    setCompletingId(null);
  };

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="modern-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="modern-sidebar">
        <div className="sidebar-logo">Task Organizer</div>
        <nav className="sidebar-nav">
          <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={e => { e.preventDefault(); setActiveTab('dashboard'); }}><Home size={20} /> Dashboard</a>
          <a href="#" className={activeTab === 'tasks' ? 'active' : ''} onClick={e => { e.preventDefault(); setActiveTab('tasks'); }}><List size={20} /> Tasks</a>
          <a href="#" className={activeTab === 'shared' ? 'active' : ''} onClick={e => { e.preventDefault(); setActiveTab('shared'); }}><Share2 size={20} /> Shared</a>
          <a href="#" className={activeTab === 'settings' ? 'active' : ''} onClick={e => { e.preventDefault(); setActiveTab('settings'); }}><Settings size={20} /> Settings</a>
        </nav>
        <div className="sidebar-user">
          <User size={20} />
          <span>{user?.displayName || user?.email || 'User'}</span>
          <button className="btn btn-logout" onClick={handleLogout}><LogOut size={16} /></button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="modern-main-content">
        {/* Top Bar */}
        <div className="modern-topbar">
          <div className="topbar-stats">
            <span><List size={16} /> Total: <b>{tasks.length}</b></span>
            <span><CheckCircle size={16} color="#2ecc71" /> Completed: <b>{tasks.filter(t => t.status === 'Done').length}</b></span>
            <span><Zap size={16} color="#e67e22" /> In Progress: <b>{tasks.filter(t => t.status === 'In Progress').length}</b></span>
            <span><Share2 size={16} color="#9b59b6" /> Shared: <b>{tasks.filter(t => Array.isArray(t.sharedWith) && t.sharedWith.length > 0).length}</b></span>
          </div>
          <div className="topbar-system">
            <span><Database size={16} color="#4a90e2" /> DB</span>
            <span><CheckCircle size={16} color="#2ecc71" /> Auth</span>
            <span><Zap size={16} color="#e67e22" /> Real-time</span>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="modern-task-grid">
          {displayedTasks.map((task) => (
            <div className="modern-task-card" key={task.id}>
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                <span className={`status ${task.status.replace(' ', '').toLowerCase()}`}>{task.status}</span>
              </div>
              <div className="task-desc">{task.desc}</div>
              {task.due && <div className="task-date">Due: {task.due}</div>}
              <div style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem'}}>
                <button className="btn btn-secondary" onClick={() => { setShareTaskId(task.id); setShowShareModal(true); }}><Share2 size={16}/> Share</button>
                {task.status !== 'Done' && (
                  <button className="btn btn-success" onClick={() => handleCompleteTask(task.id)} disabled={completingId === task.id}>
                    {completingId === task.id ? 'Completing...' : 'Complete'}
                  </button>
                )}
                <button className="btn btn-danger" onClick={() => handleDeleteTask(task.id)} disabled={deletingId === task.id}>
                  {deletingId === task.id ? 'Deleting...' : 'Delete'}
                </button>
                {Array.isArray(task.sharedWith) && task.sharedWith.length > 0 && (
                  <span style={{fontSize: '0.85rem', color: '#6a7ba2'}}>Shared with: {task.sharedWith.join(', ')}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Add Task Button */}
        <button className="modern-add-task-btn" onClick={() => setShowModal(true)}><Plus size={24} /></button>

        {/* Add Task Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Task</h3>
              <form onSubmit={handleAddTask} className="modal-form">
                <input type="text" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                <textarea placeholder="Description" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                <div className="form-row">
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option>Todo</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                  <input type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} />
                </div>
                {addError && <div className="error">{addError}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting || !form.title.trim()}>Add Task</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Share Task Modal */}
        {showShareModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Share Task</h3>
              <form onSubmit={handleShareTask} className="modal-form">
                <input type="email" placeholder="Enter email to share with" value={shareEmail} onChange={e => setShareEmail(e.target.value)} required />
                {shareError && <div className="error">{shareError}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary"><Send size={16}/> Share</button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowShareModal(false); setShareEmail(''); setShareTaskId(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteError && <div className="error">{deleteError}</div>}
        {completeError && <div className="error">{completeError}</div>}
      </div>
    </div>
  );
};

export default ModernDashboard; 