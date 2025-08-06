// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// export default function App() {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [installments, setInstallments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [showInstallments, setShowInstallments] = useState(false);
//   const [form, setForm] = useState({
//     firstName: '',
//     secondName: '',
//     accountNumber: '',
//     secondAccountNumber: '',
//     cifNumber: '',
//     secondCifNumber: '',
//     mobileNumber: '',
//     nomineeName: '',
//     monthlyAmount: '',
//     totalInvestmentAmount: '',
//     leftInvestmentAmount: '',
//     maturityAmount: '',
//     accountOpenDate: '',
//     accountCloseDate: ''
//   });

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get('http://localhost:5000/api/users');
//       setUsers(res.data);
//       setError('');
//     } catch (err) {
//       setError('Failed to fetch users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserDetail = async (id) => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`http://localhost:5000/api/users/${id}`);
//       setSelectedUser(res.data);
//       setInstallments(res.data.installments || []);
//       setError('');
//     } catch (err) {
//       setError('Failed to fetch user detail');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchInstallments = async (id) => {
//     try {
//       const res = await axios.post(`http://localhost:5000/api/users/${id}/installments`);
//       setInstallments(res.data);
//       setShowInstallments(true);
//     } catch (err) {
//       alert('Failed to generate installments');
//     }
//   };

//   const updateInstallment = async (month, amount, paid) => {
//     try {
//       await axios.put(`http://localhost:5000/api/users/${selectedUser._id}/installments/${month}`, {
//         paid,
//         amount: Number(amount)
//       });
//       fetchUserDetail(selectedUser._id);
//     } catch (err) {
//       alert('Failed to update installment');
//     }
//   };


//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('http://localhost:5000/api/users', form);
//       fetchUsers();
//       setShowModal(false);
//       setForm({
//         firstName: '', secondName: '', accountNumber: '', secondAccountNumber: '',
//         cifNumber: '', secondCifNumber: '', mobileNumber: '', nomineeName: '',
//         monthlyAmount: '', totalInvestmentAmount: '', leftInvestmentAmount: '',
//         maturityAmount: '', accountOpenDate: '', accountCloseDate: ''
//       });
//     } catch (err) {
//       alert('Error creating user');
//     }
//   };

//   if (selectedUser) {
//     return (
//       <div className="p-6">
//         <button onClick={() => { setSelectedUser(null); setShowInstallments(false); }} className="mb-4 text-blue-600 underline">⬅ Back</button>
//         <h2 className="text-2xl font-bold mb-4">{selectedUser.firstName} {selectedUser.secondName}</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {Object.entries(selectedUser).filter(([key]) => key !== '_id' && key !== '__v' && key !== 'installments').map(([key, value]) => (
//             <div key={key} className="bg-white p-4 rounded shadow">
//               <p className="font-semibold">{key.replace(/([A-Z])/g, ' $1')}</p>
//               <p className="text-gray-700">{String(value)}</p>
//             </div>
//           ))}
//         </div>
//         <button
//           onClick={() => fetchInstallments(selectedUser._id)}
//           className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//         >
//           📅 Show Monthly Installments
//         </button>

//         {showInstallments && (
//           <div className="mt-6">
//             <h3 className="text-xl font-bold mb-2">Monthly Installments</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               {installments.map((inst, idx) => (
//                 <div key={idx} className={`p-3 rounded shadow ${inst.paid ? 'bg-green-100' : 'bg-yellow-100'}`}>
//                   <p><strong>{inst.month}</strong></p>
//                   <input
//                     type="number"
//                     className="w-full border p-1 rounded my-1"
//                     defaultValue={inst.amount}
//                     onBlur={(e) => {
//                       const newAmount = e.target.value;
//                       if (!isNaN(newAmount)) updateInstallment(inst.month, newAmount, inst.paid);
//                     }}
//                   />

//                   <button
//                     onClick={() => updateInstallment(inst.month, inst.amount, !inst.paid)}
//                     className={`mt-1 w-full py-1 rounded text-white ${inst.paid ? 'bg-red-500' : 'bg-green-600'}`}
//                   >
//                     Mark as {inst.paid ? 'Unpaid' : 'Paid'}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold mb-4 text-center">User Dashboard</h1>

//       {loading ? (
//         <p className="text-center text-blue-500">Loading users...</p>
//       ) : error ? (
//         <p className="text-center text-red-500">{error}</p>
//       ) : users.length === 0 ? (
//         <p className="text-center text-gray-500">No users found</p>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-3">
//           {users.map((user) => (
//             <div
//               key={user._id}
//               onClick={() => fetchUserDetail(user._id)}
//               className="bg-white shadow-md p-4 rounded cursor-pointer hover:shadow-lg transition"
//             >
//               <h2 className="text-xl font-semibold">{user.firstName} {user.secondName}</h2>
//               <p className="text-gray-600">📞 {user.mobileNumber}</p>
//               <p className="text-green-700 font-medium">💰 Total: ₹{user.totalInvestmentAmount}</p>
//               <p className="text-red-700 font-medium">🕒 Left: ₹{user.leftInvestmentAmount}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       <button
//         onClick={() => setShowModal(true)}
//         className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700"
//       >
//         ➕ Add User
//       </button>

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
//             <h2 className="text-xl font-bold mb-4">Create New User</h2>
//             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {Object.entries(form).map(([key, value]) => (
//                 <input
//                   key={key}
//                   name={key}
//                   value={value}
//                   onChange={handleChange}
//                   placeholder={key.replace(/([A-Z])/g, ' $1')}
//                   type={key.toLowerCase().includes('date') ? 'date' : 'text'}
//                   className="border p-2 rounded w-full"
//                   required={!(key.includes('second') || key === 'secondName')}
//                 />
//               ))}
//               <button
//                 type="submit"
//                 className="col-span-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
//               >
//                 Save User
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowModal(false)}
//                 className="col-span-full text-red-500 underline mt-2"
//               >
//                 Cancel
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
  User, CreditCard, Phone, Calendar, DollarSign, FileText, Users, CheckCircle, XCircle, Banknote, ClipboardList
} from 'lucide-react'; // Importing icons


// Base URL for your API
const API_URL = 'http://localhost:5000/api';

// Main App Component
const App = () => {
  // State to manage the current view: 'userList', 'userDetails'
  const [currentPage, setCurrentPage] = useState('userList');
  // State to store the list of all users
  const [users, setUsers] = useState([]);
  // State to store the currently selected user for details view
  const [selectedUser, setSelectedUser] = useState(null);
  // State to store installments for the selected user
  const [installments, setInstallments] = useState([]);
  // State to control the visibility of the Add User modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  // State to control the visibility of the Edit Installment modal
  const [showEditInstallmentModal, setShowEditInstallmentModal] = useState(false);
  // State for the form data when adding a new user
  const [userForm, setUserForm] = useState({
    firstName: '',
    secondName: '',
    accountNumber1: '',
    accountNumber2: '',
    cifNumber1: '',
    cifNumber2: '',
    mobileNumber: '',
    nomineeName: '',
    monthlyAmount: 0,
    totalInvestmentAmount: 0,
    leftInvestmentAmount: 0,
    maturityAmount: 0,
    // Format dates for HTML input type="date"
    accountOpenDate: format(new Date(), 'yyyy-MM-dd'),
    accountCloseDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd')
  });
  // State for the form data when editing an installment
  const [installmentForm, setInstallmentForm] = useState(null); // Null initially, set when an installment is selected
  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // State for global loading indicators
  const [loading, setLoading] = useState(false);

  // --- API Calls ---

  /**
   * Fetches all users from the backend API.
   * Updates the `users` state and manages loading/error states.
   */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches installments for a specific user from the backend API.
   * @param {string} userId - The ID of the user whose installments are to be fetched.
   * Updates the `installments` state and manages loading/error states.
   */
  const fetchInstallments = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/installments/${userId}`);
      setInstallments(response.data);
    } catch (error) {
      console.error('Error fetching installments:', error);
      showSnackbar('Failed to fetch installments', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates installments for a specific user via the backend API.
   * @param {string} userId - The ID of the user for whom installments are to be generated.
   * Refreshes the installments list after successful generation.
   */
  const generateInstallments = async () => { // Removed userId parameter, now uses selectedUser._id
    if (!selectedUser) return; // Ensure a user is selected

    setLoading(true);
    try {
      await axios.post(`${API_URL}/installments/generate/${selectedUser._id}`);
      await fetchInstallments(selectedUser._id); // Refresh installments after generation
      showSnackbar('Installments generated successfully', 'success');
    } catch (error) {
      console.error('Error generating installments:', error);
      showSnackbar('Failed to generate installments', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new user by sending `userForm` data to the backend API.
   * Adds the new user to the `users` list, closes the modal, resets the form,
   * and navigates back to the user list page.
   */
  const createUser = async () => {
    setLoading(true);
    try {
      // Convert date strings to ISO format for backend
      const payload = {
        ...userForm,
        accountOpenDate: new Date(userForm.accountOpenDate).toISOString(),
        accountCloseDate: new Date(userForm.accountCloseDate).toISOString(),
      };
      const response = await axios.post(`${API_URL}/users`, payload);
      setUsers([...users, response.data]);
      setShowAddUserModal(false);
      resetUserForm();
      showSnackbar('User created successfully', 'success');
      setCurrentPage('userList'); // Go back to user list after creating
    } catch (error) {
      console.error('Error creating user:', error);
      showSnackbar('Failed to create user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateLeftInvestment = (totalInvestmentAmount, installments) => {
    const totalPaid = installments.reduce((acc, inst) => acc + (inst.amount || 0), 0);
    return totalInvestmentAmount - totalPaid;
  };


  /**
   * Updates an existing installment by sending `installmentForm` data to the backend API.
   * Refreshes the installments list for the current user after successful update.
   */
  const updateInstallment = async () => {
    if (!installmentForm) return; // Prevent action if no installment is selected

    setLoading(true);
    try {
      await axios.put(`${API_URL}/installments/${installmentForm._id}`, installmentForm);
      await fetchInstallments(selectedUser._id); // Refresh installments for the current user
      setShowEditInstallmentModal(false);
      showSnackbar('Installment updated successfully', 'success');
    } catch (error) {
      console.error('Error updating installment:', error);
      showSnackbar('Failed to update installment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions ---

  /**
   * Displays a snackbar notification with a given message and severity.
   * @param {string} message - The message to display.
   * @param {'success' | 'error' | 'info' | 'warning'} severity - The type of notification.
   */
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Closes the currently open snackbar notification.
   */
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * Resets the user creation form to its initial empty state.
   */
  const resetUserForm = () => {
    setUserForm({
      firstName: '',
      secondName: '',
      accountNumber1: '',
      accountNumber2: '',
      cifNumber1: '',
      cifNumber2: '',
      mobileNumber: '',
      nomineeName: '',
      monthlyAmount: 0,
      totalInvestmentAmount: 0,
      leftInvestmentAmount: 0,
      maturityAmount: 0,
      accountOpenDate: format(new Date(), 'yyyy-MM-dd'),
      accountCloseDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd')
    });
  };

  /**
   * Handles the selection of a user from the list.
   * Sets the selected user, fetches their installments, and navigates to the user details page.
   * @param {object} user - The user object that was selected.
   */
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchInstallments(user._id);
    setCurrentPage('userDetails');
  };

  /**
   * Handles the selection of an installment for editing.
   * Sets the installment data to the form state and opens the edit modal.
   * @param {object} installment - The installment object to be edited.
   */
  const handleInstallmentSelect = (installment) => {
    setInstallmentForm(installment);
    setShowEditInstallmentModal(true);
  };

  // --- Effects ---

  // Fetch users on initial component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Render Logic ---

  return (
    // Main container with gradient background and responsive padding
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 text-gray-800 p-4 font-sans antialiased">
      <div className="container mx-auto p-4">
        {/* Application Title */}
        <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-700 tracking-wide drop-shadow-md">
          Investment Tracker
        </h1>

        {/* Conditional Rendering based on currentPage state */}
        {currentPage === 'userList' && (
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-gray-900 border border-blue-100">
            {/* Header for User List */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4 sm:mb-0">All Users</h2>
              <button
                onClick={() => {
                  resetUserForm(); // Reset form when opening for new user
                  setShowAddUserModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 w-full sm:w-auto flex items-center justify-center"
              >
                <User className="mr-2 h-5 w-5" /> Add New User
              </button>
            </div>

            {/* Loading State for User List */}
            {loading && users.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              // Display Users Table or No Users Message
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                <table className="min-w-full bg-white rounded-lg shadow-md border border-gray-200">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">Name</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Account Number</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">Monthly Amount</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Total Investment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-gray-500">No users found. Add a new user to get started!</td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr
                          key={user._id}
                          onClick={() => handleUserSelect(user)}
                          className="border-b border-gray-200 last:border-b-0 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                        >
                          <td className="py-3 px-4 whitespace-nowrap text-gray-800">{user.firstName} {user.secondName}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-700">{user.accountNumber1}</td>
                          <td className="py-3 px-4 text-right whitespace-nowrap text-gray-700">₹{user.monthlyAmount}</td>
                          <td className="py-3 px-4 text-right whitespace-nowrap text-gray-700">₹{user.totalInvestmentAmount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* User Details Page */}
        {currentPage === 'userDetails' && selectedUser && (
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-gray-900 border border-blue-100">
            {/* Header for User Details */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4 sm:mb-0">
                {selectedUser.firstName} {selectedUser.secondName}'s Details
              </h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => generateInstallments()}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </span>
                  ) : (
                    <>
                      <ClipboardList className="mr-2 h-5 w-5" /> Generate Installments
                    </>
                  )}
                </button>
                <button
                  onClick={() => setCurrentPage('userList')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto flex items-center justify-center"
                >
                  <User className="mr-2 h-5 w-5" /> Back to Users
                </button>
              </div>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-blue-50 p-6 rounded-lg shadow-inner border border-blue-100">
              <div className="space-y-3">
                <p className="text-gray-700 flex items-center"><CreditCard className="mr-2 h-5 w-5 text-blue-500" /><strong className="text-gray-900">Account Number 1:</strong> {selectedUser.accountNumber1}</p>
                {selectedUser.accountNumber2 && <p className="text-gray-700 flex items-center"><CreditCard className="mr-2 h-5 w-5 text-blue-500" /><strong className="text-gray-900">Account Number 2:</strong> {selectedUser.accountNumber2}</p>}
                <p className="text-gray-700 flex items-center"><FileText className="mr-2 h-5 w-5 text-blue-500" /><strong className="text-gray-900">CIF Number 1:</strong> {selectedUser.cifNumber1}</p>
                {selectedUser.cifNumber2 && <p className="text-gray-700 flex items-center"><FileText className="mr-2 h-5 w-5 text-blue-500" /><strong className="text-gray-900">CIF Number 2:</strong> {selectedUser.cifNumber2}</p>}
                <p className="text-gray-700 flex items-center"><Phone className="mr-2 h-5 w-5 text-blue-500" /><strong className="text-gray-900">Mobile:</strong> {selectedUser.mobileNumber}</p>
                <p className="text-gray-700 flex items-center"><Users className="mr-2 h-5 w-5 text-blue-500" /><strong className="text-gray-900">Nominee:</strong> {selectedUser.nomineeName}</p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-600" /><strong className="text-gray-900">Monthly Amount:</strong> ₹{selectedUser.monthlyAmount}</p>
                <p className="text-gray-700 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-600" /><strong className="text-gray-900">Total Investment:</strong> ₹{selectedUser.totalInvestmentAmount}</p>
                <p className="text-gray-700 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-red-600" /><strong className="text-gray-900">Left Investment:</strong> ₹{calculateLeftInvestment(selectedUser.totalInvestmentAmount, installments)}</p>
                <p className="text-gray-700 flex items-center"><Banknote className="mr-2 h-5 w-5 text-purple-600" /><strong className="text-gray-900">Maturity Amount:</strong> ₹{selectedUser.maturityAmount}</p>
                <p className="text-gray-700 flex items-center"><Calendar className="mr-2 h-5 w-5 text-orange-500" /><strong className="text-gray-900">Account Open Date:</strong> {format(parseISO(selectedUser.accountOpenDate), 'dd/MM/yyyy')}</p>
                <p className="text-gray-700 flex items-center"><Calendar className="mr-2 h-5 w-5 text-orange-500" /><strong className="text-gray-900">Account Close Date:</strong> {format(parseISO(selectedUser.accountCloseDate), 'dd/MM/yyyy')}</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Installments</h3>

            {/* Loading State for Installments */}
            {loading && installments.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              // Installments Table
              <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                <table className="min-w-full bg-white rounded-lg shadow-md border border-gray-200">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">Month/Year</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-gray-500">No installments generated yet. Click "Generate Installments" above.</td>
                      </tr>
                    ) : (
                      installments.map((installment) => (
                        <tr key={installment._id} className="border-b border-gray-200 last:border-b-0 hover:bg-blue-50 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-gray-800">{installment.month} {installment.year}</td>
                          <td className="py-3 px-4 text-right whitespace-nowrap text-gray-700">₹{installment.amount}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`font-bold flex items-center ${installment.paid ? 'text-green-600' : 'text-red-600'}`}>
                              {installment.paid ? <CheckCircle className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
                              {installment.paid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-500 text-sm italic">
                            {installment.updatedAt && new Date(installment.updatedAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleInstallmentSelect(installment)}
                              disabled={loading}
                              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-1 px-3 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"> {/* Changed opacity to 90 */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 md:p-8 relative text-gray-900 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">Add New User</h2>
              <form onSubmit={(e) => { e.preventDefault(); createUser(); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <label htmlFor="firstName" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">First Name</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <User className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="firstName"
                        type="text"
                        placeholder=" "
                        value={userForm.firstName}
                        onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="secondName" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Second Name</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <User className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="secondName"
                        type="text"
                        placeholder=" "
                        value={userForm.secondName}
                        onChange={(e) => setUserForm({ ...userForm, secondName: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="accountNumber1" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Account Number 1</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <CreditCard className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="accountNumber1"
                        type="text"
                        placeholder=" "
                        value={userForm.accountNumber1}
                        onChange={(e) => setUserForm({ ...userForm, accountNumber1: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="accountNumber2" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Account Number 2 (Optional)</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <CreditCard className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="accountNumber2"
                        type="text"
                        placeholder=" "
                        value={userForm.accountNumber2}
                        onChange={(e) => setUserForm({ ...userForm, accountNumber2: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="cifNumber1" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">CIF Number 1</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <FileText className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="cifNumber1"
                        type="text"
                        placeholder=" "
                        value={userForm.cifNumber1}
                        onChange={(e) => setUserForm({ ...userForm, cifNumber1: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="cifNumber2" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">CIF Number 2 (Optional)</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <FileText className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="cifNumber2"
                        type="text"
                        placeholder=" "
                        value={userForm.cifNumber2}
                        onChange={(e) => setUserForm({ ...userForm, cifNumber2: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="mobileNumber" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Mobile Number</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <Phone className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="mobileNumber"
                        type="tel"
                        placeholder=" "
                        value={userForm.mobileNumber}
                        onChange={(e) => setUserForm({ ...userForm, mobileNumber: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="nomineeName" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Nominee Name</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <Users className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="nomineeName"
                        type="text"
                        placeholder=" "
                        value={userForm.nomineeName}
                        onChange={(e) => setUserForm({ ...userForm, nomineeName: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="monthlyAmount" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Monthly Amount</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <DollarSign className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="monthlyAmount"
                        type="number"
                        placeholder=" "
                        value={userForm.monthlyAmount}
                        onChange={(e) => setUserForm({ ...userForm, monthlyAmount: Number(e.target.value) })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="totalInvestmentAmount" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Total Investment Amount</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <DollarSign className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="totalInvestmentAmount"
                        type="number"
                        placeholder=" "
                        value={userForm.totalInvestmentAmount}
                        onChange={(e) => setUserForm({ ...userForm, totalInvestmentAmount: Number(e.target.value) })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="leftInvestmentAmount" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Left Investment Amount</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <DollarSign className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="leftInvestmentAmount"
                        type="number"
                        placeholder=" "
                        value={userForm.leftInvestmentAmount}
                        onChange={(e) => setUserForm({ ...userForm, leftInvestmentAmount: Number(e.target.value) })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="maturityAmount" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Maturity Amount</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <Banknote className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="maturityAmount"
                        type="number"
                        placeholder=" "
                        value={userForm.maturityAmount}
                        onChange={(e) => setUserForm({ ...userForm, maturityAmount: Number(e.target.value) })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="accountOpenDate" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Account Open Date</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <Calendar className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="accountOpenDate"
                        type="date"
                        value={userForm.accountOpenDate}
                        onChange={(e) => setUserForm({ ...userForm, accountOpenDate: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="accountCloseDate" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Account Close Date</label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <Calendar className="absolute left-3 text-gray-400 h-5 w-5" />
                      <input
                        id="accountCloseDate"
                        type="date"
                        value={userForm.accountCloseDate}
                        onChange={(e) => setUserForm({ ...userForm, accountCloseDate: e.target.value })}
                        className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center justify-center"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <User className="mr-2 h-5 w-5" /> Save User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Installment Modal */}
        {showEditInstallmentModal && installmentForm && (
          <div className="fixed inset-0 bg-black bg-black/60 flex items-center justify-center z-50 p-4"> {/* Changed opacity to 90 */}
            <div className="bg-white rounded-xl shadow-2xl w-full  max-w-lg p-6 md:p-8 relative text-gray-900 overflow-y-auto custom-scrollbar"> {/* Changed max-w-md to max-w-lg and removed max-h */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">Edit Installment</h2>
              <p className="text-gray-700 mb-4 text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" /><strong className="text-gray-900">Month:</strong> {installmentForm.month} {installmentForm.year}
              </p>
              <form onSubmit={(e) => { e.preventDefault(); updateInstallment(); }}>
                <div className="mb-4 relative">
                  <label htmlFor="installmentAmount" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">Amount</label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                    <DollarSign className="absolute left-3 text-gray-400 h-5 w-5" />
                    <input
                      id="installmentAmount"
                      type="number"
                      placeholder=" "
                      value={installmentForm.amount}
                      onChange={(e) => setInstallmentForm({ ...installmentForm, amount: Number(e.target.value) })}
                      className="w-full p-3 pl-10 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6 relative">
                  <label htmlFor="installmentStatus" className="absolute top-2 left-3 text-xs text-gray-500 bg-white px-1">Status</label>
                  <div className="relative">
                    <select
                      id="installmentStatus"
                      value={installmentForm.paid}
                      onChange={(e) => setInstallmentForm({ ...installmentForm, paid: e.target.value === 'true' })}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-8"
                    >
                      <option value={true}>Paid</option>
                      <option value={false}>Pending</option>
                    </select>
                    {/* Custom arrow for select dropdown */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowEditInstallmentModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center justify-center"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" /> Update Installment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Snackbar for notifications */}
        {snackbar.open && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ${snackbar.severity === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {snackbar.message}
            <button onClick={handleSnackbarClose} className="ml-4 font-bold focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;


