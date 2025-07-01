import React from 'react';
import { LogOut, Database, CheckCircle, Zap, User, List, Share2, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <Database size={28} color="#4a90e2" />
          <span>Task Organizer</span>
          <span className="db-status"><span className="dot-green" /> DB: Connected</span>
        </div>
        <div className="dashboard-user">
          <User size={20} />
          <span>Siddharth</span>
          <button className="btn btn-logout"><LogOut size={16} /> Logout</button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-main-grid">
        {/* Status Cards */}
        <div className="dashboard-status-cards">
          <div className="status-card">
            <h4>Database</h4>
            <div><CheckCircle color="#2ecc71" /> Connected</div>
            <div><Zap color="#f1c40f" /> Realtime: Active</div>
          </div>
          <div className="status-card">
            <h4>System</h4>
            <div><CheckCircle color="#2ecc71" /> API: Running</div>
            <div><CheckCircle color="#2ecc71" /> Auth: Active</div>
          </div>
          <div className="status-card">
            <h4>Features</h4>
            <div><List color="#4a90e2" /> Task CRUD</div>
            <div><Share2 color="#9b59b6" /> Sharing</div>
            <div><Zap color="#e67e22" /> Real-time</div>
          </div>
        </div>

        {/* Task Form & Stats */}
        <div className="dashboard-center-panel">
          <div className="task-form-card">
            <h3>Create New Task</h3>
            <form>
              <div className="form-row">
                <input type="text" placeholder="Task Title" />
                <select>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <textarea placeholder="Description" rows={2} />
              <div className="form-row">
                <input type="date" />
                <select>
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Save Task</button>
            </form>
          </div>
          <div className="stats-panel">
            <h4>Quick Stats</h4>
            <div className="stats-list">
              <div><BarChart2 size={18} /> Total: <span>0</span></div>
              <div><CheckCircle size={18} color="#2ecc71" /> Completed: <span>0</span></div>
              <div><Zap size={18} color="#e67e22" /> In Progress: <span>0</span></div>
              <div><Share2 size={18} color="#9b59b6" /> Shared: <span>0</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 