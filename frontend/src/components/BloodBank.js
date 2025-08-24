import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  createRecord,
  getRecord,
  updateRecord,
  deleteRecord,
  subscribeToRecord
} from '../firebase/database';
import './BloodBank.css';

function BloodBank() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('inventory');
  const [bloodInventory, setBloodInventory] = useState([
    {
      id: 'O-',
      type: 'O-',
      units: 2,
      status: 'Low',
      lastUpdated: '2024-01-15',
      expiryDate: '2024-02-15'
    },
    {
      id: 'B+',
      type: 'B+',
      units: 10,
      status: 'Stable',
      lastUpdated: '2024-01-10',
      expiryDate: '2024-03-10'
    },
    {
      id: 'O+',
      type: 'O+',
      units: 45,
      status: 'Stable',
      lastUpdated: '2024-01-12',
      expiryDate: '2024-03-12'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newBloodType, setNewBloodType] = useState({
    type: '',
    units: 0,
    status: 'Stable',
    expiryDate: ''
  });
  const [newRequest, setNewRequest] = useState({
    bloodType: '',
    units: 0,
    urgency: 'Normal',
    patientName: '',
    doctorName: '',
    reason: ''
  });

  useEffect(() => {
    if (user?.uid) {
      loadBloodInventory();
    }
  }, [user?.uid]);

  const loadBloodInventory = async () => {
    setLoading(true);
    try {
      const result = await getRecord('bloodBank');
      if (result.success && result.data) {
        const inventoryArray = Object.keys(result.data).map(key => ({
          id: key,
          type: result.data[key].type || key,
          units: result.data[key].units || 0,
          status: result.data[key].status || 'Stable',
          lastUpdated: result.data[key].lastUpdated || result.data[key].updatedAt || new Date().toISOString().split('T')[0],
          expiryDate: result.data[key].expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ...result.data[key]
        }));
        setBloodInventory(inventoryArray);
      }
    } catch (error) {
      console.log('Using mock data for blood bank');
    }
    setLoading(false);
  };

  // Function to consolidate blood types by grouping them and summing their units
  const getConsolidatedBloodInventory = () => {
    const consolidated = {};
    
    bloodInventory.forEach(item => {
      const type = item.type;
      if (!consolidated[type]) {
        consolidated[type] = {
          id: type,
          type: type,
          units: 0,
          status: 'Stable',
          lastUpdated: item.lastUpdated,
          expiryDate: item.expiryDate
        };
      }
      consolidated[type].units += item.units || 0;
      
      // Determine overall status based on total units
      if (consolidated[type].units === 0) {
        consolidated[type].status = 'Critical';
      } else if (consolidated[type].units <= 5) {
        consolidated[type].status = 'Low';
      } else if (consolidated[type].units >= 20) {
        consolidated[type].status = 'High';
      } else {
        consolidated[type].status = 'Stable';
      }
    });
    
    // Filter out blood types with 0 units
    return Object.values(consolidated).filter(bloodType => bloodType.units > 0);
  };

  const handleAddBloodType = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const bloodData = {
        ...newBloodType,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const result = await createRecord('bloodBank', bloodData);
      if (result.success) {
        const newBloodTypeWithId = {
          id: result.id,
          ...bloodData
        };
        setBloodInventory(prev => [...prev, newBloodTypeWithId]);
        setNewBloodType({
          type: '',
          units: 0,
          status: 'Stable',
          expiryDate: ''
        });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding blood type:', error);
    }
    setLoading(false);
  };

  const handleUpdateBloodType = async (bloodTypeId, updates) => {
    setLoading(true);
    try {
      const result = await updateRecord(`bloodBank/${bloodTypeId}`, {
        ...updates,
        updatedAt: Date.now()
      });
      if (result.success) {
        setBloodInventory(prev => prev.map(item => 
          item.id === bloodTypeId ? { ...item, ...updates } : item
        ));
      }
    } catch (error) {
      console.error('Error updating blood type:', error);
    }
    setLoading(false);
  };

  const handleDeleteBloodType = async (bloodTypeId) => {
    if (window.confirm('Are you sure you want to delete this blood type?')) {
      setLoading(true);
      try {
        const result = await deleteRecord(`bloodBank/${bloodTypeId}`);
        if (result.success) {
          setBloodInventory(prev => prev.filter(item => item.id !== bloodTypeId));
        }
      } catch (error) {
        console.error('Error deleting blood type:', error);
      }
      setLoading(false);
    }
  };

  const handleRequestBlood = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check if requested blood type exists and has sufficient units
      const requestedBloodType = newRequest.bloodType;
      const requestedUnits = newRequest.units;
      
      // Find all inventory items of the requested blood type
      const matchingInventoryItems = bloodInventory.filter(item => item.type === requestedBloodType);
      
      if (matchingInventoryItems.length === 0) {
        alert(`No ${requestedBloodType} blood type found in inventory.`);
        setLoading(false);
        return;
      }
      
      // Calculate total available units for this blood type
      const totalAvailableUnits = matchingInventoryItems.reduce((total, item) => total + (item.units || 0), 0);
      
      if (totalAvailableUnits < requestedUnits) {
        alert(`Insufficient ${requestedBloodType} blood units. Available: ${totalAvailableUnits}, Requested: ${requestedUnits}`);
        setLoading(false);
        return;
      }
      
      // Create the blood request
      const requestData = {
        ...newRequest,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'Pending'
      };
      
      const result = await createRecord('bloodRequests', requestData);
      if (result.success) {
        // Subtract units from inventory
        let remainingUnitsToSubtract = requestedUnits;
        
        for (const inventoryItem of matchingInventoryItems) {
          if (remainingUnitsToSubtract <= 0) break;
          
          const currentUnits = inventoryItem.units || 0;
          const unitsToSubtract = Math.min(currentUnits, remainingUnitsToSubtract);
          const newUnits = Math.max(0, currentUnits - unitsToSubtract);
          
          // Update the inventory item in Firebase
          await handleUpdateBloodType(inventoryItem.id, { units: newUnits });
          
          remainingUnitsToSubtract -= unitsToSubtract;
        }
        
        setNewRequest({
          bloodType: '',
          units: 0,
          urgency: 'Normal',
          patientName: '',
          doctorName: '',
          reason: ''
        });
        setShowRequestModal(false);
        alert(`Blood request submitted successfully! ${requestedUnits} units of ${requestedBloodType} have been deducted from inventory.`);
      }
    } catch (error) {
      console.error('Error submitting blood request:', error);
      alert('Error submitting blood request. Please try again.');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (!status) return 'status-stable';
    
    switch (status.toLowerCase()) {
      case 'low':
        return 'status-low';
      case 'critical':
        return 'status-critical';
      case 'stable':
        return 'status-stable';
      case 'high':
        return 'status-high';
      default:
        return 'status-stable';
    }
  };

  const renderInventoryCard = (bloodType) => {
    // Safety check to ensure all required properties exist
    if (!bloodType || !bloodType.id) {
      return null;
    }
    
    return (
      <div key={bloodType.id} className="blood-type-card">
        <div className="blood-type-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5"/>
          </svg>
        </div>
        <div className="blood-type-info">
          <h3 className="blood-type-name">{bloodType.type || 'Unknown'}</h3>
          <div className="blood-type-units">{bloodType.units || 0} units</div>
          <div className={`blood-type-status ${getStatusColor(bloodType.status)}`}>
            {bloodType.status || 'Unknown'}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'inventory', label: 'Inventory' },
    { id: 'donors', label: 'Donors' },
    { id: 'requests', label: 'Requests' },
    { id: 'transfusions', label: 'Transfusions' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <div className="blood-bank-page">
      {/* Header */}
      <div className="blood-bank-header">
        <div className="breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span>Blood Bank</span>
        </div>
        <h1 className="blood-bank-title">Blood Bank Management</h1>
      </div>

      {/* Tabs */}
      <div className="blood-bank-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="blood-bank-controls">
        <div className="controls-left">
          <div className="search-container">
            <div className="search-input-wrapper">
              <div className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search Blood Types"
                value=""
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
        
        <div className="controls-right">
          <button
            className="add-blood-type-btn"
            onClick={() => setShowAddModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add New Blood Type
          </button>
          
          <button
            className="request-blood-btn"
            onClick={() => setShowRequestModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Request Blood
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="blood-bank-content">
        {currentTab === 'inventory' && (
          <div className="inventory-section">
            <div className="inventory-grid">
              {loading ? (
                <div className="loading-message">Loading blood inventory...</div>
              ) : getConsolidatedBloodInventory().length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>No blood types found</p>
                </div>
              ) : (
                getConsolidatedBloodInventory().map(renderInventoryCard)
              )}
            </div>
          </div>
        )}

        {currentTab === 'donors' && (
          <div className="donors-section">
            <h2>Donors Management</h2>
            <p>This section will contain donor information and management tools.</p>
          </div>
        )}

        {currentTab === 'requests' && (
          <div className="requests-section">
            <h2>Blood Requests</h2>
            <p>This section will contain blood request management.</p>
          </div>
        )}

        {currentTab === 'transfusions' && (
          <div className="transfusions-section">
            <h2>Transfusions</h2>
            <p>This section will contain transfusion records and management.</p>
          </div>
        )}

        {currentTab === 'reports' && (
          <div className="reports-section">
            <h2>Reports</h2>
            <p>This section will contain blood bank reports and analytics.</p>
          </div>
        )}
      </div>

      {/* Add Blood Type Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Blood Type</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddBloodType} className="blood-type-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bloodType">Blood Type</label>
                  <select
                    id="bloodType"
                    value={newBloodType.type}
                    onChange={(e) => setNewBloodType(prev => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="units">Units</label>
                  <input
                    type="number"
                    id="units"
                    min="0"
                    value={newBloodType.units}
                    onChange={(e) => setNewBloodType(prev => ({ ...prev, units: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={newBloodType.status}
                    onChange={(e) => setNewBloodType(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Stable">Stable</option>
                    <option value="Low">Low</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="date"
                    id="expiryDate"
                    value={newBloodType.expiryDate}
                    onChange={(e) => setNewBloodType(prev => ({ ...prev, expiryDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Blood Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Blood Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Blood</h3>
              <button
                className="modal-close"
                onClick={() => setShowRequestModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleRequestBlood} className="blood-request-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="requestBloodType">Blood Type</label>
                  <select
                    id="requestBloodType"
                    value={newRequest.bloodType}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, bloodType: e.target.value }))}
                    required
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="requestUnits">Units Required</label>
                  <input
                    type="number"
                    id="requestUnits"
                    min="1"
                    value={newRequest.units}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, units: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="urgency">Urgency</label>
                  <select
                    id="urgency"
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, urgency: e.target.value }))}
                    required
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="patientName">Patient Name</label>
                  <input
                    type="text"
                    id="patientName"
                    value={newRequest.patientName}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, patientName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="doctorName">Doctor Name</label>
                  <input
                    type="text"
                    id="doctorName"
                    value={newRequest.doctorName}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, doctorName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="reason">Reason for Request</label>
                  <textarea
                    id="reason"
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Please provide the reason for this blood request..."
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BloodBank;
