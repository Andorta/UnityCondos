import React, { useEffect, useState, useRef } from 'react';
import { getUsers, updateUserStatus as toggleStatusAPI } from '../../servicecall/api';
import { toast } from 'react-toastify';

export const ControlPanel = () => {
    const [searchText, setSearchText] = useState('');
    const [roleType, setRoleType] = useState('ALL');
    const [status, setStatus] = useState('ALL');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingUsers, setUpdatingUsers] = useState(new Set());
    const toastId = useRef(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers(searchText, roleType, status);
            setUsers(response);
        } catch (error) {
            toast.error(error?.response?.data?.message || "An Exception is occurred!");
        }
        setLoading(false);
    };

    const showToastMessage = (message, type = 'success') => {
        if (toastId.current) {
            toast.dismiss(toastId.current);
        }

        if (type === 'success') {
            toastId.current = toast.success(message);
        } else {
            toastId.current = toast.error(message);
        }
    };

    const updateUserStatus = async (userId) => {
        if (updatingUsers.has(userId)) {
            return;
        }
        setUpdatingUsers(prev => new Set([...prev, userId]));

        try {
            await toggleStatusAPI(userId);
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId
                        ? {
                            ...user,
                            status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                        }
                        : user
                )
            );

        } catch (error) {
            showToastMessage(
                error?.response?.data?.message || 'An exception occurred',
                'error'
            );
        } finally {
            setUpdatingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchText, roleType, status]);

    const StatusToggle = ({ isActive, onToggle, userId, isUpdating }) => {
        return (
            <button
                onClick={() => onToggle(userId)}
                disabled={isUpdating}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isUpdating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isActive
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                    }`}
            >
                {isUpdating ? (
                    <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-b-transparent ml-3" />
                ) : (
                    <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'
                            }`}
                    />
                )}
            </button>
        );
    };

    const TruncatedText = ({ text, maxLength = 20, className = "" }) => {
        if (!text) return null;

        const shouldTruncate = text.length > maxLength;
        const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;

        return (
            <span
                className={className}
                title={shouldTruncate ? text : undefined}
            >
                {displayText}
            </span>
        );
    };

    const UserCard = ({ user, index }) => {
        const isActive = user.status === 'ACTIVE';
        const isGuest = user.role === 'ROLE_GUEST';
        const isUpdating = updatingUsers.has(user.id);

        return (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 font-medium text-lg">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate" title={`${user.firstName} ${user.lastName}`}>
                                <TruncatedText
                                    text={`${user.firstName} ${user.lastName}`}
                                    maxLength={15}
                                />
                            </h3>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${isGuest
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                {isGuest ? 'Guest' : 'Resident'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <StatusToggle
                            isActive={isActive}
                            onToggle={updateUserStatus}
                            userId={user.id}
                            isUpdating={isUpdating}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center text-sm min-w-0">
                        <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        <TruncatedText
                            text={user.email}
                            maxLength={25}
                            className="text-gray-600 truncate"
                        />
                    </div>

                    {user.phoneNumber && (
                        <div className="flex items-center text-sm min-w-0">
                            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <TruncatedText
                                text={user.phoneNumber}
                                maxLength={15}
                                className="text-gray-600"
                            />
                        </div>
                    )}

                    {user.designation && (
                        <div className="flex items-center text-sm min-w-0">
                            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2H6a2 2 0 002-2V6" />
                            </svg>
                            <TruncatedText
                                text={user.designation}
                                maxLength={20}
                                className="text-gray-600"
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-2">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, email or designation"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">User Role</label>
                        <select
                            value={roleType}
                            onChange={(e) => setRoleType(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Users</option>
                            <option value="ROLE_RESIDENT">Residents</option>
                            <option value="ROLE_GUEST">Guests</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
            ) : users.length === 0 ? (
                <div className="p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {users.map((user, index) => (
                        <UserCard key={user.id} user={user} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
};