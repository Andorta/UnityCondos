import React, { useState, useEffect } from 'react';
import {
  MegaphoneIcon,
  XMarkIcon,
  UserIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  createAnnouncement,
  getActiveUsers,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementDetails,
} from '../../servicecall/api';
import { toast } from 'react-toastify';

export const Announcement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setIsAdmin(userData?.role === 'ROLE_ADMIN');
    setCurrentUserId(userData?.id);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = {};
        const users = await getActiveUsers(params);
        const formattedUsers = users.map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: formatRole(user.role || user.designation),
          originalRole: user.role || user.designation,
        }));
        setUserOptions(formattedUsers);
      } catch (error) {
        toast.error('Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const announcementsData = await getAllAnnouncements();
        setAnnouncements(announcementsData);
      } catch (error) {
        toast.error('Failed to fetch announcements');
      }
    };

    fetchAnnouncements();
  }, []);

  const formatRole = (role) => {
    switch (role) {
      case 'ROLE_RESIDENT':
        return 'Resident';
      case 'ROLE_GUEST':
        return 'Guest';
      default:
        return role || 'User';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAnnouncementRead = (announcement) => {
    return announcement.viewedUsers?.some(view => view.viewedBy?.id === currentUserId);
  };

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  const handleCloseModal = () => {
    setTitle('');
    setContent('');
    setSelectedUsers([]);
    setErrors({});
    setSelectAll(false);
    setSearchTerm('');
    setEditingAnnouncement(null);
    setShowModal(false);
  };

  const handleOpenDetailsModal = async (announcement) => {
    const response = await getAnnouncementDetails(announcement.id);
    setSelectedAnnouncement(response);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = async () => {
    setSelectedAnnouncement(null);
    setShowDetailsModal(false);
    const announcements = await getAllAnnouncements();
    setAnnouncements(announcements);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);

    if (announcement.users && announcement.users.length > 0) {
      const announcementUsers = announcement.users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: formatRole(user.role || user.designation),
        originalRole: user.role || user.designation,
      }));
      setSelectedUsers(announcementUsers);
    } else {
      setSelectedUsers([]);
    }

    setShowModal(true);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      try {
        await deleteAnnouncement(announcementId);
        toast.success('Announcement deleted successfully!');
        const announcementsData = await getAllAnnouncements();
        setAnnouncements(announcementsData);
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length > 200) newErrors.title = 'Title must be under 200 characters';

    if (!content.trim()) newErrors.content = 'Content is required';
    else if (content.length > 1000) newErrors.content = 'Content must be under 1000 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        userIds: selectedUsers.map(user => user.id)
      };

      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, payload);
        toast.success("Announcement updated successfully!");
      } else {
        await createAnnouncement(payload);
        toast.success("Announcement published successfully!");
      }

      const announcementsData = await getAllAnnouncements();
      setAnnouncements(announcementsData);
      handleCloseModal();
    } catch (error) {
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = {};
        error.response.data.errors.forEach(errorMessage => {
          if (errorMessage.toLowerCase().includes('title')) {
            backendErrors.title = errorMessage;
          } else if (errorMessage.toLowerCase().includes('content')) {
            backendErrors.content = errorMessage;
          } else if (errorMessage.toLowerCase().includes('userids')) {
            backendErrors.userIds = errorMessage;
          }
        });
        setErrors(backendErrors);
        toast.error("Please fix the validation errors and try again.");
      } else {
        const errorMessage = editingAnnouncement ? "Failed to update announcement" : "Failed to publish announcement";
        toast.error(error?.response?.data?.message || `${errorMessage}. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      setSelectedUsers([...filteredUsers]);
      setSelectAll(true);
    }
  };

  const handleUserSelection = (user) => {
    const isSelected = selectedUsers.some(selected => selected.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(selected => selected.id !== user.id));
      setSelectAll(false);
    } else {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);

      if (newSelectedUsers.length === filteredUsers.length) {
        setSelectAll(true);
      }
    }
  };

  const filteredUsers = userOptions.filter(user =>
    `${user.firstName} ${user.lastName} ${user.role}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length) {
      const allFilteredSelected = filteredUsers.every(user =>
        selectedUsers.some(selected => selected.id === user.id)
      );
      setSelectAll(allFilteredSelected);
    } else {
      setSelectAll(false);
    }
  }, [filteredUsers, selectedUsers]);

  const isFormValid = title.trim().length > 0 && content.trim().length > 0 && !isSubmitting;

  const renderUserAvatars = (viewedUsers, maxDisplay = 10) => {
    const users = viewedUsers.slice(0, maxDisplay);
    const remainingCount = viewedUsers.length - maxDisplay;

    return (
      <div className="flex -space-x-1">
        {users.map((view, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded-full bg-gray-100 text-black flex items-center justify-center text-xs border-2 border-white"
            title={`${view.viewedBy?.firstName} ${view.viewedBy?.lastName}`}
          >
            {view.viewedBy?.firstName?.[0]?.toUpperCase()}{view.viewedBy?.lastName?.[0]?.toUpperCase()}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-gray-100 text-black flex items-center justify-center text-xs border-2 border-white">
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto p-2">
      {isAdmin && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleToggleModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition shadow-md"
          >
            <MegaphoneIcon className="w-4 h-4" />
            Create Announcement
          </button>
        </div>
      )}

      <div className="mb-2">
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const isRead = isAnnouncementRead(announcement);
              const canEditDelete = isAdmin && announcement.totalViews === 0;

              return (
                <div
                  key={announcement.id}
                  className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow p-2 cursor-pointer ${isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
                    }`}
                  onClick={() => handleOpenDetailsModal(announcement)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-md font-semibold text-gray-900 flex-1 pr-4">
                      {(announcement.title)}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canEditDelete && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAnnouncement(announcement);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Edit announcement"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAnnouncement(announcement.id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete announcement"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {announcement.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{announcement.totalViews}</span>
                      </div>
                      {announcement.viewedUsers?.length > 0 && (
                        <div>
                          {renderUserAvatars(announcement.viewedUsers)}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <UserCircleIcon className="w-4 h-4" />
                        <span>{announcement.createdBy?.firstName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{formatDate(announcement.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <MegaphoneIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p>No announcements found.</p>
          </div>
        )}
      </div>

      {showDetailsModal && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseDetailsModal}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Announcement Details</h3>
                <button
                  onClick={handleCloseDetailsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedAnnouncement.title}</h4>
                  <p className="text-gray-700">{selectedAnnouncement.content}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Created by:</span>
                      <p>{selectedAnnouncement.createdBy?.firstName} {selectedAnnouncement.createdBy?.lastName}</p>
                      <p className="text-gray-500">{selectedAnnouncement.createdBy?.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Updated:</span>
                      <p>{formatDate(selectedAnnouncement.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {selectedAnnouncement.viewedUsers?.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Viewed by ({selectedAnnouncement.totalViews}):</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedAnnouncement.viewedUsers.map((viewedUser, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                              {viewedUser.viewedBy?.firstName?.[0]?.toUpperCase()}{viewedUser.viewedBy?.lastName?.[0]?.toUpperCase()}
                            </div>
                            <span>{viewedUser.viewedBy?.firstName} {viewedUser.viewedBy?.lastName}</span>
                          </div>
                          <span className="text-gray-500">{formatDate(viewedUser.viewedAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>
            <div className="max-h-[450px] inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title ({title.length}/200)
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Enter announcement title..."
                      disabled={isSubmitting}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content ({content.length}/1000)
                    </label>
                    <textarea
                      maxLength={1000}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.content ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Enter announcement content..."
                      disabled={isSubmitting}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipients ({selectedUsers.length} selected)
                    </label>

                    <div className="mb-3 space-y-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search users..."
                        disabled={isSubmitting}
                      />

                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-md hover:bg-blue-100 transition"
                          disabled={isSubmitting}
                        >
                          <UsersIcon className="w-4 h-4" />
                          {selectAll ? 'Deselect All' : 'Select All'} ({filteredUsers.length})
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                          const isSelected = selectedUsers.some(selected => selected.id === user.id);
                          return (
                            <div
                              key={user.id}
                              onClick={() => handleUserSelection(user)}
                              className={`flex items-center p-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => { }}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                              />
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-xs">
                                {user.firstName?.[0]?.toUpperCase() || ''}{user.lastName?.[0]?.toUpperCase() || ''}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  ({user.role})
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          No users found
                        </div>
                      )}
                    </div>
                    {errors.userIds && <p className="text-red-500 text-xs mt-1">{errors.userIds}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4 pt-2 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!isFormValid}
                  className="px-2 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingAnnouncement ? 'Updating...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <MegaphoneIcon className="w-4 h-4" />
                      {editingAnnouncement ? 'Update Announcement' : 'Publish Announcement'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};