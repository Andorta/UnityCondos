import React, { useState, useEffect } from 'react';
import {
  getActiveUsers,
  createTask,
  getAllTasks,
  deleteTask,
  updateTask,
  updateTaskStatus,
} from '../../servicecall/api';
import { toast } from 'react-toastify';
import CountUp from 'react-countup';

export const Task = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('assigned');

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const loggedInUserRole = userData.role;

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [searchText]);

  const fetchTasks = async () => {
    try {
      const data = await getAllTasks({
        titleOrAssignToName: searchText.trim() || undefined,
      });
      setMyTasks(Array.isArray(data.myTasks) ? data.myTasks : []);
      setAssignedTasks(Array.isArray(data.assignedTasks) ? data.assignedTasks : []);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch tasks.';
      toast.error(errorMessage);
      setMyTasks([]);
      setAssignedTasks([]);
    }
  };

  const openModal = async (task = null) => {
    try {
      const result = await getActiveUsers({});
      setUsers(result);

      if (task) {
        setIsEditMode(true);
        setEditTaskId(task.id);
        setTitle(task.title || '');
        setDescription(task.description || '');
        setAssignedToId(task.assignedTo?.id || '');
        setPaymentAmount(task.paymentAmount?.toString() || '');
      } else {
        resetForm();
      }

      setIsOpen(true);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch users.';
      toast.error(errorMessage);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignedToId('');
    setPaymentAmount('');
    setIsEditMode(false);
    setEditTaskId(null);
    setErrors({});
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPaymentAmount(value);
    }
  };

  const handleSubmitTask = async () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    if (description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    } else {
      const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 100) {
        newErrors.description = 'Description must not exceed 100 words';
      }
    }

    if (!assignedToId) {
      newErrors.assignedToId = 'Assigned To is required';
    }

    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      newErrors.paymentAmount = 'Enter a valid payment amount';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const taskData = {
      title,
      description,
      assignedToId,
      paymentAmount: parseFloat(paymentAmount),
    };

    try {
      if (isEditMode) {
        await updateTask(editTaskId, taskData);
        toast.success('Task updated successfully!');
      } else {
        await createTask(taskData);
        toast.success('Task created successfully!');
      }
      closeModal();
      await fetchTasks();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || (isEditMode ? 'Failed to update task.' : 'Failed to create task.');
      toast.error(errorMessage);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;

    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully!');
      await fetchTasks();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete task.';
      toast.error(errorMessage);
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || '?';
  };

  const showEditDeleteButtons = (task) => {
    if (loggedInUserRole === 'ROLE_GUEST') return false;
    if (task.status === 'COMPLETED') return false;
    if (activeTab === 'created' && loggedInUserRole !== 'ROLE_GUEST') return true;
    
  };

  const renderTaskCard = (task) => {
    const assignedTo = task.assignedTo;
    const assignedBy = task.assignedBy;

    return (
      <div
        key={task.id}
        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={(e) => {
          if (e.target.closest('button')) return;
          setSelectedTask(task);
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : task.status === 'INPROGRESS'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
                }`}
            >
              {task.status.replace('_', ' ')}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              ${task.paymentAmount}
            </span>
          </div>

          {showEditDeleteButtons(task) && (
            <div className="flex space-x-1">
              <button
                onClick={() => openModal(task)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="Edit Task"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Delete Task"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate" title={task.title}>
          {task.title}
        </h3>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={task.description} style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}>
            {task.description}
          </p>
        )}

        <div className="flex justify-between items-center">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium bg-gray-400"
            title={assignedBy ? `Created by: ${assignedBy.firstName} ${assignedBy.lastName}` : 'Created by: N/A'}
          >
            {getInitials(assignedBy?.firstName, assignedBy?.lastName)}
          </div>

          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium bg-gray-400"
            title={assignedTo ? `Assigned to: ${assignedTo.firstName} ${assignedTo.lastName}` : 'Assigned to: N/A'}
          >
            {getInitials(assignedTo?.firstName, assignedTo?.lastName)}
          </div>
        </div>

      </div>
    );
  };

  const renderTaskList = (tasks) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-gray-400 text-sm">Tasks will appear here once they are created</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        {tasks.map(renderTaskCard)}
      </div>
    );
  };

  const shouldShowCreateTaskButton = () => {
    return loggedInUserRole === 'ROLE_ADMIN' || loggedInUserRole === 'ROLE_RESIDENT';
  };

  const getTabsToShow = () => {
    if (loggedInUserRole === 'ROLE_ADMIN') {
      return ['created'];
    } else if (loggedInUserRole === 'ROLE_GUEST') {
      return ['assigned'];
    } else {
      return ['assigned', 'created'];
    }
  };

  useEffect(() => {
    if (loggedInUserRole === 'ROLE_ADMIN') {
      setActiveTab('created');
    } else {
      setActiveTab('assigned');
    }
  }, [loggedInUserRole]);

  return (
    <div className="p-2 max-w-full mx-auto bg-gray-50 min-h-screen">

      <div className="flex justify-end items-center mb-[-40px]">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search tasks..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {shouldShowCreateTaskButton() && (
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm"
            >
              + Create Task
            </button>
          )}
        </div>
      </div>

      <div className="mb-2">
        <nav className="flex space-x-8">
          {getTabsToShow().includes('assigned') && (
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'assigned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Assigned to Me
              {myTasks.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                  {myTasks.length}
                </span>
              )}
            </button>
          )}

          {getTabsToShow().includes('created') && (
            <button
              onClick={() => setActiveTab('created')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'created'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Tasks I Created
              {assignedTasks.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                  {assignedTasks.length}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      <div className="rounded-lg">
        {activeTab === 'assigned' && getTabsToShow().includes('assigned') && (
          <div className="p-0">
            {renderTaskList(myTasks)}
          </div>
        )}

        {activeTab === 'created' && getTabsToShow().includes('created') && (
          <div className="p-0">
            {renderTaskList(assignedTasks)}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm mx-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                {isEditMode ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`border px-2 py-1.5 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter task title"
                  maxLength={100}
                />
                <div className="text-right text-xs text-gray-500">
                  {title.length} / 100
                </div>
                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`border px-2 py-1.5 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter task description"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500">
                  {description.length} / 500
                </div>
                {errors.description && (
                  <p className="text-red-500 text-xs">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To *
                </label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className={`border px-2 py-1.5 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.assignedToId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.designation || user.role})
                    </option>
                  ))}
                </select>
                {errors.assignedToId && (
                  <p className="text-red-500 text-xs">{errors.assignedToId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount *
                </label>
                <input
                  type="text"
                  value={paymentAmount}
                  onChange={handlePaymentChange}
                  className={`border px-2 py-1.5 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.paymentAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter amount"
                />
                {errors.paymentAmount && (
                  <p className="text-red-500 text-xs">{errors.paymentAmount}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeModal}
                  className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTask}
                  className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition text-sm"
                >
                  {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100">
          
            <div className="flex justify-between items-center px-2 py-2 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-2 py-2 space-y-2">
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-medium text-gray-500 tracking-wide">Title</label>
                  <p className="text-gray-900 font-medium mt-1 break-words whitespace-normal">
                    {selectedTask.title}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <label className="text-xs font-medium text-gray-500 tracking-wide">Payment</label>
                  <p className="text-emerald-600 font-bold text-lg mt-1 whitespace-nowrap">
                    $
                    <CountUp
                      start={0}
                      end={selectedTask.paymentAmount || 0}
                      duration={1.2}
                      separator=","
                    />
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 tracking-wide">Description</label>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed break-words whitespace-pre-line">
                  {selectedTask.description || 'No description provided'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 tracking-wide">Created</label>
                <p className="text-gray-700 text-sm mt-1">
                  {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div className="flex justify-between items-center py-3 bg-gray-50 rounded-full px-4">
             
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                    title={
                      selectedTask.assignedBy
                        ? `Created by: ${selectedTask.assignedBy.firstName} ${selectedTask.assignedBy.lastName}`
                        : 'Creator: N/A'
                    }
                  >
                    {getInitials(selectedTask.assignedBy?.firstName, selectedTask.assignedBy?.lastName)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Created By</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedTask.assignedBy
                        ? `${selectedTask.assignedBy.firstName} ${selectedTask.assignedBy.lastName}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-300"></div>

                
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold"
                    title={
                      selectedTask.assignedTo
                        ? `Assigned to: ${selectedTask.assignedTo.firstName} ${selectedTask.assignedTo.lastName}`
                        : 'Assignee: N/A'
                    }
                  >
                    {getInitials(selectedTask.assignedTo?.firstName, selectedTask.assignedTo?.lastName)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Assigned To</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedTask.assignedTo
                        ? `${selectedTask.assignedTo.firstName} ${selectedTask.assignedTo.lastName}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 tracking-wide">Status</label>
                <select
                  value={selectedTask.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    try {
                      await updateTaskStatus(selectedTask.id, newStatus);
                      toast.success('Status updated!');
                      await fetchTasks();
                      setSelectedTask(null);
                    } catch (err) {
                      const errorMessage = err?.response?.data?.message || 'Failed to update status.';
                      toast.error(errorMessage);
                    }
                  }}
                  className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="INPROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};