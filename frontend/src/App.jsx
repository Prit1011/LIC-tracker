

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
  User, CreditCard, Phone, Calendar, DollarSign, FileText, Users, CheckCircle, XCircle, Banknote, ClipboardList,
  Sheet,
  CloudCog,
  FileDown,
  Check,
  TrendingUp,
  Loader2,
  ArrowLeft,
  Edit,
  UserPen,
  UserRoundPen,
  UserRoundX
} from 'lucide-react'; // Importing icons
import InstallBtn from './components/InstallBtn';


// Base URL for your API
const API_URL = ' http://localhost:5000/api';

// Main App Component
const App = () => {
  // State to manage the current view: 'userList', 'userDetails'
  const [currentPage, setCurrentPage] = useState('userList');
  const [isLoading, setIsLoading] = useState(false)  // State to store the list of all users
  const [users, setUsers] = useState([]);
  // State to store the currently selected user for details view
  const [selectedUser, setSelectedUser] = useState(null);
  // State to store installments for the selected user
  const [installments, setInstallments] = useState([]);
  // State to control the visibility of the Add User modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  // State to control the visibility of the Edit Installment modal
  const [showEditInstallmentModal, setShowEditInstallmentModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  // State for the form data when adding a new user
  const [userForm, setUserForm] = useState({
    userId: '', // ✅ Added userId
    firstName: '',
    secondName: '',
    accountNumber1: '',
    accountNumber2: '',
    cifNumber1: '',
    cifNumber2: '',
    mobileNumber: '',
    nomineeName: '',
    monthlyAmount: '',
    accountType: 'After 15 days',
    totalInvestmentAmount: '',
    leftInvestmentAmount: '',
    maturityAmount: ' ',
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
  const [showEditUserModel, setShowEditUserModel] = useState(false);

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
      console.log(userForm)
      // Convert date strings to ISO format for backend
      const payload = {
        ...userForm,
        accountType: userForm.accountType || 'After 15 days', // ✅ ensure always present
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
    const totalPaid = installments.reduce((acc, inst) => {
      return acc + ((inst.paid ? inst.amount : 0) || 0);
    }, 0);
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

  const handleSubmit = async () => {
    console.log("Month:", month);
    console.log("Year:", year);

    if (!month || !year) {
      alert("Please select both month and year");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/installments/download?month=${month}&year=${year}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Optional: you can name the file better using the same logic as server
      a.download = `Installments_${month}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed: " + err.message);
    } finally {
      setIsOpen(false);
      setMonth("");
      setYear("");
    }
  };

  const downloadFullReport = async (userId) => {
    try {
      setIsLoading(true);

      // Validate userId
      if (!userId) {
        throw new Error('User ID is required');
      }

      const apiUrl = `${API_URL}/users/${userId}/full-report`;

      const response = await axios.get(apiUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Only resolve for 2xx status codes
        }
      });

      // Handle potential errors in the response
      if (response.headers['content-type'].includes('text/html')) {
        // This means we got an HTML error page instead of the Excel file
        const errorText = await new Response(response.data).text();
        throw new Error('Server returned an error page');
      }

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from headers
      let fileName = 'UserReport.xlsx';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/) ||
          contentDisposition.match(/filename=([^;]+)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Download error:', error);

      let errorMessage = 'Download failed';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'User not found or report endpoint unavailable';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error while generating report';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showSnackbar(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle editing a user
  const handleEditUser = (e, user) => {
    e.stopPropagation();
    // console.log("Editing user:", user);
    setShowEditUserModel(true);

    // Prefill the form with selected user data
    setUserForm({
      userId: user._id, // ✅ Set userId here
      firstName: user.firstName || "",
      secondName: user.secondName || "",
      accountNumber1: user.accountNumber1 || "",
      accountNumber2: user.accountNumber2 || "",
      cifNumber1: user.cifNumber1 || "",
      cifNumber2: user.cifNumber2 || "",
      mobileNumber: user.mobileNumber || "",
      nomineeName: user.nomineeName || "",
      monthlyAmount: user.monthlyAmount || "",
      totalInvestmentAmount: user.totalInvestmentAmount || "",
      leftInvestmentAmount: user.leftInvestmentAmount || 0,
      maturityAmount: user.maturityAmount || "",
      accountOpenDate: user.accountOpenDate
        ? new Date(user.accountOpenDate).toISOString().split("T")[0]
        : "",
      accountCloseDate: user.accountCloseDate
        ? new Date(user.accountCloseDate).toISOString().split("T")[0]
        : "",
    });

    // Show modal

  };

  const updateUser = async () => {
    if (!userForm.userId) {
      showSnackbar('User ID is missing', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/users/${userForm.userId}`,
        userForm
      );

      showSnackbar(response.data.message || 'User updated successfully', 'success');
      setShowEditUserModel(false);

      // Update the users state with the updated user
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userForm.userId ? { ...user, ...userForm } : user
        )
      );



      // Close the modal
      setSelectedUser(null);

    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage =
        error.response?.data?.error || 'Failed to update user';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE USER HANDLER
  const handleDeleteUser = async (event, userId, firstName) => {
    // Stop click from reaching parent onClick
    event.stopPropagation();

    const isConfirmed = window.confirm(`Are you sure you want to delete user "${firstName}"?`);
    if (!isConfirmed) return;

    try {
      console.log(`🗑 Deleting user with ID: ${userId} (${firstName})`);
      const response = await axios.delete(`${API_URL}/users/${userId}`);
      console.log("✅ Delete Response:", response.data);

      showSnackbar(response.data.message || "User deleted successfully", "success");
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));

    } catch (error) {
      console.error("❌ Error deleting user:", error);
      showSnackbar(error.response?.data?.error || "Failed to delete user", "error");
    }
  };

  return (
    // Main container with gradient background and responsive padding
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 text-gray-800 p-2 font-sans antialiased">
      <div className="container  p-1">
        {/* Application Title */}
        <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-700 tracking-wide drop-shadow-md">
          Investment Tracker
        </h1>

        {currentPage === 'userList' && (
          <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 rounded-xl shadow-2xl p-4 md:p-6 lg:p-8 text-gray-900 border border-blue-200/60 w-full mx-auto backdrop-blur-sm">
            {/* Enhanced Header */}
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-8 border-b-2 border-gradient-to-r from-blue-200 to-indigo-200 pb-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">All Users</h2>
                <p className="text-gray-600 text-sm md:text-base">Manage and track user accounts</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsOpen(true)}
                  className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 flex items-center justify-center text-sm md:text-base"
                >
                  <Sheet className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Excel Download</span>
                </button>
                <button
                  onClick={() => {
                    resetUserForm();
                    setShowAddUserModal(true);
                  }}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center justify-center text-sm md:text-base"
                >
                  <User className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Add New User</span>
                </button>
              </div>
            </div>

            {/* Enhanced Loading State */}
            {loading && users.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-semibold">Loading users...</p>
                  <p className="text-gray-500 text-sm">Please wait a moment</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mobile Stats Cards - Only show on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:hidden">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Users</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                      <User className="h-8 w-8 text-blue-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Active</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                      <div className="h-8 w-8 bg-green-400 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Table/Card Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50">
                        <tr>
                          <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span>Name</span>
                            </div>
                          </th>
                          <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Account Number</th>
                          <th className="py-4 px-6 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Monthly Amount</th>
                          <th className="py-4 px-6 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total Investment</th>
                          <th className="py-4 px-6 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-12">
                              <div className="flex flex-col items-center space-y-4">
                                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                                  <User className="h-8 w-8 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-gray-700 mb-1">No users found</p>
                                  <p className="text-gray-500">Add a new user to get started!</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          users.map((user, index) => (
                            <tr
                              key={user._id}
                              onClick={() => handleUserSelect(user)}
                              className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer"
                            >
                              <td className="py-5 px-6 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user.firstName.charAt(0)}{user.secondName?.charAt(0) || ''}
                                  </div>
                                  <div>
                                    <div className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                      {user.firstName} {user.secondName}
                                    </div>
                                    <div className="text-sm text-gray-500">User #{index + 1}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 px-6 whitespace-nowrap">
                                <div className="text-sm font-mono font-medium text-gray-900">{user.accountNumber1}</div>
                                <div className="text-xs text-gray-500">Primary Account</div>
                              </td>
                              <td className="py-5 px-6 text-right whitespace-nowrap">
                                <div className="text-lg font-bold text-green-600">₹{user.monthlyAmount.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">per month</div>
                              </td>
                              <td className="py-5 px-6 text-right whitespace-nowrap">
                                <div className="text-lg font-bold text-blue-600">₹{user.totalInvestmentAmount.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">total amount</div>
                              </td>
                              <td className="py-5 px-6 text-right whitespace-nowrap">
                                <button
                                  onClick={(e) => handleEditUser(e, user)}
                                  className="bg-cyan-500 hover:bg-yellow-600 text-white mx-3 px-3 py-1 rounded-lg text-sm shadow-sm"
                                >
                                  <UserRoundPen />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteUser(e, user._id, user.firstName)}
                                  className="bg-red-600 hover:bg-red-400 text-white px-3 py-1 rounded-lg text-sm shadow-sm"
                                >
                                  <UserRoundX />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="sm:hidden">
                    {users.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-10 w-10 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-6">Add a new user to get started!</p>
                            <button
                              onClick={() => {
                                resetUserForm();
                                setShowAddUserModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-colors duration-200"
                            >
                              Add First User
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {users.map((user, index) => (
                          <div
                            key={user._id}
                            onClick={() => handleUserSelect(user)}
                            className="bg-gradient-to-r from-white to-blue-50/30 rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
                          >
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {user.firstName.charAt(0)}{user.secondName?.charAt(0) || ''}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {user.firstName} {user.secondName}
                                </h3>
                                <p className="text-sm text-gray-500 font-mono">{user.accountNumber1}</p>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Monthly</p>
                                <p className="text-lg font-bold text-green-600 mt-1">₹{user.monthlyAmount.toLocaleString()}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
                                <p className="text-lg font-bold text-blue-600 mt-1">₹{user.totalInvestmentAmount.toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
                              <div className="flex items-center justify-center text-sm text-blue-600 font-medium">
                                <span>Tap to view details</span>
                                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              <button
                                onClick={(e) => handleEditUser(e, user)}
                                className="bg-cyan-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm shadow-sm"
                              >
                                <UserRoundPen />
                              </button>
                              <button
                                onClick={(e) => handleDeleteUser(e, user._id, user.firstName)}
                                className="bg-red-600 hover:bg-red-400 text-white px-3 py-1 rounded-lg text-sm shadow-sm"
                              >
                                <UserRoundX />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* User Details Page */}
        {currentPage === 'userDetails' && selectedUser && (
          <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 lg:p-8 text-gray-900 border border-blue-100 w-full mx-auto">
            {/* User Profile Header with Avatar */}
            <div className="flex flex-col items-center mb-8 sm:flex-row sm:items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
                    {selectedUser.firstName.charAt(0)}{selectedUser.secondName.charAt(0)}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-2 border-white">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1">
                  {selectedUser.firstName} {selectedUser.secondName}
                </h1>
                <p className="text-gray-600 mb-2 flex items-center justify-center sm:justify-start">
                  <CreditCard className="h-4 w-4 mr-1 text-blue-500" />
                  {selectedUser.accountNumber1}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                  <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-3 py-1 rounded-full flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" /> ₹{selectedUser.monthlyAmount}/month
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs sm:text-sm px-3 py-1 rounded-full flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> ₹{selectedUser.totalInvestmentAmount}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs sm:text-sm px-3 py-1 rounded-full flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(parseISO(selectedUser.accountCloseDate), 'MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Improved responsive layout */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-6 gap-4">
              <div className="grid grid-cols-2 sm:flex sm:space-x-3 gap-3 w-full sm:w-auto">
                <button
                  onClick={() => downloadFullReport(selectedUser._id)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-full shadow transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-2" />
                  )}
                  Full Report
                </button>
                <button
                  onClick={() => generateInstallments()}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-full shadow transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ClipboardList className="h-4 w-4 mr-2" />
                  )}
                  Generate
                </button>
                <button
                  onClick={() => setCurrentPage('userList')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-full shadow transition-all duration-200 hover:scale-[1.02] flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
              </div>
            </div>

            {/* User Information Grid - Improved responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 bg-blue-50 p-4 md:p-6 rounded-lg shadow-inner border border-blue-100">
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                    Account Details
                  </h3>
                  <p className="text-gray-800">
                    <span className="font-medium">Primary:</span> {selectedUser.accountNumber1}
                    {selectedUser.cifNumber1 && ` (CIF: ${selectedUser.cifNumber1})`}
                  </p>
                  {selectedUser.accountNumber2 && (
                    <p className="text-gray-800 mt-1">
                      <span className="font-medium">Secondary:</span> {selectedUser.accountNumber2}
                      {selectedUser.cifNumber2 && ` (CIF: ${selectedUser.cifNumber2})`}
                    </p>
                  )}
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    Contact
                  </h3>
                  <p className="text-gray-800">{selectedUser.mobileNumber}</p>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    Nominee
                  </h3>
                  <p className="text-gray-800">{selectedUser.nomineeName || 'Not specified'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    Investment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Monthly</p>
                      <p className="text-gray-800 font-medium">₹{selectedUser.monthlyAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-gray-800 font-medium">₹{selectedUser.totalInvestmentAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="text-gray-800 font-medium">₹{calculateLeftInvestment(selectedUser.totalInvestmentAmount, installments)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Maturity</p>
                      <p className="text-gray-800 font-medium">₹{selectedUser.maturityAmount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                    Account Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Account Type</p>
                      <p className="text-gray-800">{selectedUser.accountType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Opened</p>
                      <p className="text-gray-800">{format(parseISO(selectedUser.accountOpenDate), 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Matures</p>
                      <p className="text-gray-800">{format(parseISO(selectedUser.accountCloseDate), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Installments Section */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Installments</h3>
              <div className="flex items-center text-sm text-gray-500">
                <div className="flex items-center mr-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span>Paid</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span>Pending</span>
                </div>
              </div>
            </div>

            {/* Installments Table */}
            {loading && installments.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {installments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">
                          No installments found. Click "Generate Installments" to create.
                        </td>
                      </tr>
                    ) : (
                      installments.map((installment) => (
                        <tr key={installment._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {installment.month} {installment.year}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-right text-gray-500">
                            ₹{installment.amount}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${installment.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {installment.paid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                            {installment.updatedAt && new Date(installment.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleInstallmentSelect(installment)}
                              disabled={loading}
                              className="text-yellow-600 hover:text-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Edit className="h-4 w-4" />
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
                    <label htmlFor="accountType" className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">
                      Account Type
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                      <select
                        id="accountType"
                        value={userForm.accountType}
                        onChange={(e) => setUserForm({ ...userForm, accountType: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-lg focus:outline-none text-gray-900"
                        required
                      >
                        <option value="After 15 days">After 15 days</option>
                        <option value="Before 15 days">Before 15 days</option>
                      </select>
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

        {showEditUserModel && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"> {/* Changed opacity to 90 */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 md:p-8 relative text-gray-900 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">Add New User</h2>
              <form onSubmit={(e) => { e.preventDefault(); updateUser(); }}>
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
                    onClick={() => setShowEditUserModel(false)}
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
        {/* open for downkload excle file  */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h2 className="text-xl font-semibold mb-4">Select Month & Year</h2>

              <div className="mb-3">
                <label className="block text-sm font-medium">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                >
                  <option value="">-- Select Month --</option>
                  {[
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                  ].map((m, i) => (
                    <option key={i} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  placeholder="e.g. 2025"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"

                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 w-full sm:w-auto flex items-center justify-center"

                >
                  Submit
                </button>
              </div>
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
      <InstallBtn />
    </div>
  );
};

export default App;


