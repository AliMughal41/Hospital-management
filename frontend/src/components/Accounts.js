// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { 
//   createRecord,
//   getRecord,
//   updateRecord,
//   deleteRecord
// } from '../firebase/database';
// import { generateExpenseId } from '../utils/idGenerator';
// import './Accounts.css';

// function Accounts({ restrictToMySalary = false }) {
//   const { user, userProfile } = useAuth();
//   const [currentTab, setCurrentTab] = useState('expense-entry');
//   const [expenses, setExpenses] = useState([]);
//   const [filteredExpenses, setFilteredExpenses] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingExpense, setEditingExpense] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [staff, setStaff] = useState([]);
//   const [salaryRole, setSalaryRole] = useState('doctor');
//   const [salaryPersonId, setSalaryPersonId] = useState('');
//   const [newExpense, setNewExpense] = useState({
//     description: '',
//     category: 'EQUIPMENT',
//     amount: '',
//     date: '',
//     paymentMethod: 'Credit Card',
//     vendor: ''
//   });

//   const [stats, setStats] = useState({
//     totalExpenses: 0,
//     thisMonth: 0,
//     totalTransactions: 0
//   });

//   useEffect(() => {
//     if (user?.uid) {
//       loadExpenses();
//       loadStaff();
//     }
//   }, [user?.uid]);

//   useEffect(() => {
//     setFilteredExpenses(expenses);
//   }, [expenses]);

//   useEffect(() => {
//     applyFilters();
//   }, [searchTerm, expenses]);

//   const loadExpenses = async () => {
//     setLoading(true);
//     try {
//       const result = await getRecord('expenses');
//       if (result.success && result.data) {
//         const expensesArray = Object.keys(result.data).map(key => ({
//           id: result.data[key].id || key,
//           ...result.data[key]
//         }));
//         setExpenses(expensesArray);
        
//         // Calculate stats
//         const total = expensesArray.reduce((sum, expense) => sum + (expense.amount || 0), 0);
//         const thisMonth = expensesArray.filter(expense => {
//           const expenseDate = new Date(expense.date);
//           const currentDate = new Date();
//           return expenseDate.getMonth() === currentDate.getMonth() && 
//                  expenseDate.getFullYear() === currentDate.getFullYear();
//         }).reduce((sum, expense) => sum + (expense.amount || 0), 0);
        
//         setStats({
//           totalExpenses: total,
//           thisMonth: thisMonth,
//           totalTransactions: expensesArray.length
//         });
//       } else {
//         setExpenses([]);
//         setStats({
//           totalExpenses: 0,
//           thisMonth: 0,
//           totalTransactions: 0
//         });
//       }
//     } catch (error) {
//       console.log('Using mock data for expenses');
//       setStats({
//         totalExpenses: 0,
//         thisMonth: 0,
//         totalTransactions: 0
//       });
//     }
//     setLoading(false);
//   };

//   const applyFilters = () => {
//     let filtered = expenses;

//     // Apply search filter
//     if (searchTerm) {
//       filtered = filtered.filter(expense =>
//         expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         expense.id?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Restrict to own salary records when requested
//     if (restrictToMySalary || userProfile?.role === 'technician') {
//       const currentName = (userProfile?.displayName || '').toLowerCase();
//       filtered = filtered.filter(expense =>
//         (expense.category?.toUpperCase() === 'SALARY') &&
//         ((expense.vendor || '').toLowerCase() === currentName)
//       );
//     }

//     setFilteredExpenses(filtered);
//   };

//   const loadStaff = async () => {
//     try {
//       const result = await getRecord('staff');
//       if (result.success && result.data) {
//         const staffArray = Object.keys(result.data).map(key => ({ id: key, ...result.data[key] }));
//         setStaff(staffArray);
//       } else {
//         setStaff([]);
//       }
//     } catch (e) {
//       setStaff([]);
//     }
//   };

//   const handleAddExpense = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const expenseId = generateExpenseId(expenses);
      
//       const expenseData = {
//         id: expenseId,
//         ...newExpense,
//         amount: parseFloat(newExpense.amount),
//         createdAt: Date.now(),
//         updatedAt: Date.now()
//       };
      
//       const result = await createRecord('expenses', expenseData);
//       if (result.success) {
//         const newExpenseWithId = {
//           id: expenseId,
//           ...expenseData
//         };
//         setExpenses(prev => [...prev, newExpenseWithId]);
//         setNewExpense({
//           description: '',
//           category: 'EQUIPMENT',
//           amount: '',
//           date: '',
//           paymentMethod: 'Credit Card',
//           vendor: ''
//         });
//         setShowAddModal(false);
        
//         const newTotal = stats.totalExpenses + parseFloat(newExpense.amount);
//         const newCount = stats.totalTransactions + 1;
//         setStats(prev => ({
//           ...prev,
//           totalExpenses: newTotal,
//           totalTransactions: newCount
//         }));
//       }
//     } catch (error) {
//       console.error('Error adding expense:', error);
//     }
//     setLoading(false);
//   };

//   const handleEditExpense = async (expenseData) => {
//     setLoading(true);
//     try {
//       const result = await updateRecord(`expenses/${expenseData.id}`, {
//         ...expenseData,
//         amount: parseFloat(expenseData.amount),
//         updatedAt: Date.now()
//       });
//       if (result.success) {
//         setExpenses(prev => prev.map(item => 
//           item.id === expenseData.id ? { ...item, ...expenseData } : item
//         ));
//         setEditingExpense(null);
//         loadExpenses();
//       }
//     } catch (error) {
//       console.error('Error updating expense:', error);
//     }
//     setLoading(false);
//   };

//   const handleDeleteExpense = async (expenseId) => {
//     if (window.confirm('Are you sure you want to delete this expense?')) {
//       setLoading(true);
//       try {
//         const result = await deleteRecord(`expenses/${expenseId}`);
//         if (result.success) {
//           setExpenses(prev => prev.filter(item => item.id !== expenseId));
//           loadExpenses();
//         }
//       } catch (error) {
//         console.error('Error deleting expense:', error);
//       }
//       setLoading(false);
//     }
//   };

//   const getCategoryBadgeClass = (category) => {
//     switch (category?.toUpperCase()) {
//       case 'EQUIPMENT':
//         return 'category-equipment';
//       case 'SUPPLIES':
//         return 'category-supplies';
//       case 'SALARY':
//         return 'category-salary';
//       case 'UTILITIES':
//         return 'category-utilities';
//       case 'MAINTENANCE':
//         return 'category-maintenance';
//       default:
//         return 'category-equipment';
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-PK', {
//       style: 'currency',
//       currency: 'PKR'
//     }).format(amount || 0);
//   };

//   const tabs = [
//     { id: 'expense-entry', label: restrictToMySalary ? 'My Salary Records' : (userProfile?.role === 'technician' ? 'Salary Records' : 'Expense Entry') },
//     { id: 'monthly-bills', label: 'Monthly Bills' }
//   ];

//   const categories = [
//     'EQUIPMENT',
//     'SUPPLIES', 
//     'SALARY',
//     'UTILITIES',
//     'MAINTENANCE'
//   ];

//   const paymentMethods = [
//     'Credit Card',
//     'Bank Transfer',
//     'Cash',
//     'Check'
//   ];

//   return (
//     <div className="accounts-page">
//       {/* Header */}
//       <div className="accounts-header">
//         <div className="accounts-title-section">
//           <h1 className="accounts-title">Accounts & Finance</h1>
//           <p className="accounts-subtitle">Manage hospital expenses and financial records</p>
//         </div>
//       </div>

//       {/* Statistics Cards */}
//       {!(restrictToMySalary || ['doctor', 'technician', 'nurse'].includes((userProfile?.role || '').toLowerCase())) && (
//         <div className="accounts-stats">
//           <div className="stat-card">
//             <div className="stat-icon">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             </div>
//             <div className="stat-content">
//               <div className="stat-label">Total Expenses</div>
//               <div className="stat-value">{formatCurrency(stats.totalExpenses)}</div>
//             </div>
//           </div>

//           <div className="stat-card">
//             <div className="stat-icon">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             </div>
//             <div className="stat-content">
//               <div className="stat-label">This Month</div>
//               <div className="stat-value">{formatCurrency(stats.thisMonth)}</div>
//             </div>
//           </div>

//           <div className="stat-card">
//             <div className="stat-icon">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             </div>
//             <div className="stat-content">
//               <div className="stat-label">Total Transactions</div>
//               <div className="stat-value">{stats.totalTransactions}</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="accounts-tabs">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             className={`tab-button ${currentTab === tab.id ? 'active' : ''}`}
//             onClick={() => setCurrentTab(tab.id)}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Content */}
//       <div className="accounts-content">
//         {currentTab === 'expense-entry' ? (
//           <div className="expense-entry-section">
//             <div className="section-header">
//               <h2 className="section-title">
//                 {(restrictToMySalary || userProfile?.role === 'technician') ? 'My Salary Records' : 'Expense Management'}
//               </h2>
//               {!restrictToMySalary && (
//                 <button
//                   className="add-expense-btn"
//                   onClick={() => {
//                     if (userProfile?.role === 'technician') {
//                       setNewExpense(prev => ({
//                         ...prev,
//                         category: 'SALARY',
//                         vendor: userProfile?.displayName || ''
//                       }));
//                     }
//                     setShowAddModal(true);
//                   }}
//                 >
//                   {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg> */}
//                   Add New Expense
//                 </button>
//               )}
//             </div>

//             {/* Expenses Table */}
//             <div className="expenses-table-container">
//               <div className="table-header">
//                 <h3 className="table-title">Recent Expenses</h3>
//                 <div className="search-container">
//                   <div className="search-input-wrapper">
//                     <div className="search-icon">
//                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                         <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                       </svg>
//                     </div>
//                     <input
//                       type="text"
//                       className="search-input"
//                       placeholder="Search expenses..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="table-wrapper">
//                 <table className="expenses-table">
//                   <thead>
//                     <tr>
//                       <th>ID</th>
//                       <th>DESCRIPTION</th>
//                       <th>CATEGORY</th>
//                       <th>AMOUNT</th>
//                       <th>DATE</th>
//                       <th>PAYMENT METHOD</th>
//                       <th>GIVEN TO</th>
//                       <th>ACTIONS</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading ? (
//                       <tr>
//                         <td colSpan="8" className="loading-cell">
//                           <div className="loading-spinner">Loading...</div>
//                         </td>
//                       </tr>
//                     ) : filteredExpenses.length === 0 ? (
//                       <tr>
//                         <td colSpan="8" className="empty-cell">
//                           <div className="empty-state">
//                             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                               <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                               <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                               <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                             </svg>
//                             <p>No expenses found</p>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredExpenses.map((expense) => (
//                         <tr key={expense.id} className="expense-row">
//                           <td>
//                             <div className="expense-id">{expense.id || 'N/A'}</div>
//                           </td>
//                           <td>
//                             <div className="expense-description">{expense.description || 'N/A'}</div>
//                           </td>
//                           <td>
//                             <span className={`category-badge ${getCategoryBadgeClass(expense.category)}`}>
//                               {expense.category || 'N/A'}
//                             </span>
//                           </td>
//                           <td>
//                             <div className="expense-amount">{formatCurrency(expense.amount)}</div>
//                           </td>
//                           <td>
//                             <div className="expense-date">{formatDate(expense.date)}</div>
//                           </td>
//                           <td>
//                             <div className="payment-method">{expense.paymentMethod || 'N/A'}</div>
//                           </td>
//                           <td>
//                             <div className="vendor">{expense.vendor || 'N/A'}</div>
//                           </td>
//                           <td>
//                             <div className="expense-actions">
//                               <button
//                                 className="edit-btn"
//                                 onClick={() => setEditingExpense(expense)}
//                                 disabled={userProfile?.role === 'technician'}
//                               >
//                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                   <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                   <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                 </svg>
//                               </button>
//                               <button
//                                 className="delete-btn"
//                                 onClick={() => handleDeleteExpense(expense.id)}
//                                 disabled={userProfile?.role === 'technician'}
//                               >
//                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                   <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                   <path d="M19,6V20C19,20.5523 18.5523,21 18,21H6C5.44772,21 5,20.5523 5,20V6M8,6V4C8,3.44772 8.44772,3 9,3H15C15.5523,3 16,3.44772 16,4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                 </svg>
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="monthly-bills-section">
//             <div className="section-header">
//               <h2 className="section-title">Monthly Bills</h2>
//             </div>
//             <div className="coming-soon">
//               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//               <h3>Monthly Bills</h3>
//               <p>This feature is coming soon. You'll be able to manage monthly bills and recurring expenses here.</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Add Expense Modal */}
//       {showAddModal && (
//         <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Add New Expense</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => setShowAddModal(false)}
//               >
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </button>
//             </div>
//             <form onSubmit={handleAddExpense} className="expense-form">
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label htmlFor="description">Description</label>
//                   <input
//                     type="text"
//                     id="description"
//                     value={newExpense.description}
//                     onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="category">Category</label>
//                   {userProfile?.role === 'technician' ? (
//                     <input
//                       type="text"
//                       id="category"
//                       value={newExpense.category || 'SALARY'}
//                       readOnly
//                       className="disabled-input"
//                     />
//                   ) : (
//                     <select
//                       id="category"
//                       value={newExpense.category}
//                       onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
//                       required
//                     >
//                       {categories.map(category => (
//                         <option key={category} value={category}>{category}</option>
//                       ))}
//                     </select>
//                   )}
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="amount">Amount</label>
//                   <input
//                     type="number"
//                     id="amount"
//                     step="0.01"
//                     value={newExpense.amount}
//                     onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="date">Date</label>
//                   <input
//                     type="date"
//                     id="date"
//                     value={newExpense.date}
//                     onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="paymentMethod">Payment Method</label>
//                   <select
//                     id="paymentMethod"
//                     value={newExpense.paymentMethod}
//                     onChange={(e) => setNewExpense(prev => ({ ...prev, paymentMethod: e.target.value }))}
//                     required
//                   >
//                     {paymentMethods.map(method => (
//                       <option key={method} value={method}>{method}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="vendor">Given to</label>
//                   {userProfile?.role === 'technician' || restrictToMySalary ? (
//                     <input
//                       type="text"
//                       id="vendor"
//                       value={userProfile?.displayName || ''}
//                       readOnly
//                       className="disabled-input"
//                     />
//                   ) : (
//                     <>
//                       {newExpense.category === 'SALARY' ? (
//                         <>
//                           <select
//                             id="salaryRole"
//                             value={salaryRole}
//                             onChange={(e) => { 
//                               setSalaryRole(e.target.value); 
//                               setSalaryPersonId(''); 
//                               setNewExpense(prev => ({ ...prev, vendor: '' })); 
//                             }}
//                             required
//                           >
//                             <option value="doctor">Doctor</option>
//                             <option value="nurse">Nurse</option>
//                             <option value="technician">Lab Technician</option>
//                             <option value="receptionist">Receptionist</option>
//                           </select>
//                           <select
//                             id="salaryPerson"
//                             value={salaryPersonId}
//                             onChange={(e) => {
//                               const person = staff.find(s => s.id === e.target.value);
//                               setSalaryPersonId(e.target.value);
//                               setNewExpense(prev => ({ ...prev, vendor: person?.name || '' }));
//                             }}
//                             required
//                           >
//                             <option value="">Select {salaryRole}</option>
//                             {staff
//                               .filter(s => (s.category || '').toLowerCase() === salaryRole)
//                               .map(s => (
//                                 <option key={s.id} value={s.id}>{s.name}</option>
//                               ))}
//                           </select>
//                         </>
//                       ) : (
//                         <select
//                           id="vendor"
//                           value={newExpense.vendor}
//                           onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
//                           required
//                         >
//                           <option value="">SELECT ANY ONE OPTION</option>
//                           {staff.map(s => (
//                             <option key={s.id} value={s.name}>{s.name}</option>
//                           ))}
//                         </select>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="modal-actions">
//                 <button type="button" onClick={() => setShowAddModal(false)}>
//                   Cancel
//                 </button>
//                 <button type="submit" disabled={loading}>
//                   {loading ? 'Adding...' : 'Add Expense'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Expense Modal */}
//       {editingExpense && (
//         <div className="modal-overlay" onClick={() => setEditingExpense(null)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Edit Expense</h3>
//               <button
//                 className="modal-close"
//                 onClick={() => setEditingExpense(null)}
//               >
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </button>
//             </div>
//             <form onSubmit={(e) => { 
//               e.preventDefault(); 
//               handleEditExpense(editingExpense); 
//             }} className="expense-form"
//             >
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label htmlFor="edit-description">Description</label>
//                   <input
//                     type="text"
//                     id="edit-description"
//                     value={editingExpense.description || ''}
//                     onChange={(e) => setEditingExpense(prev => ({ ...prev, description: e.target.value }))}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="edit-category">Category</label>
//                   <select
//                     id="edit-category"
//                     value={editingExpense.category || 'EQUIPMENT'}
//                     onChange={(e) => setEditingExpense(prev => ({ ...prev, category: e.target.value }))}
//                     required
//                   >
//                     {categories.map(category => (
//                       <option key={category} value={category}>{category}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="edit-amount">Amount</label>
//                   <input
//                     type="number"
//                     id="edit-amount"
//                     step="0.01"
//                     value={editingExpense.amount || ''}
//                     onChange={(e) => setEditingExpense(prev => ({ ...prev, amount: e.target.value }))}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="edit-date">Date</label>
//                   <input
//                     type="date"
//                     id="edit-date"
//                     value={editingExpense.date || ''}
//                     onChange={(e) => setEditingExpense(prev => ({ ...prev, date: e.target.value }))}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="edit-paymentMethod">Payment Method</label>
//                   <select
//                     id="edit-paymentMethod"
//                     value={editingExpense.paymentMethod || 'Credit Card'}
//                     onChange={(e) => setEditingExpense(prev => ({ ...prev, paymentMethod: e.target.value }))}
//                     required
//                   >
//                     {paymentMethods.map(method => (
//                       <option key={method} value={method}>{method}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="edit-vendor">Given to</label>
//                   <input
//                     type="text"
//                     id="edit-vendor"
//                     value={editingExpense.vendor || ''}
//                     onChange={(e) => setEditingExpense(prev => ({ ...prev, vendor: e.target.value }))}
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="modal-actions">
//                 <button type="button" onClick={() => setEditingExpense(null)}>
//                   Cancel
//                 </button>
//                 <button type="submit" disabled={loading}>
//                   {loading ? 'Updating...' : 'Update Expense'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Accounts;