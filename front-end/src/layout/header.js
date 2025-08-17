import React, { useState, useEffect, useRef } from 'react';
import {
    MdNotifications,
    MdAccountCircle,
    MdKeyboardArrowDown,
    MdLogout
} from 'react-icons/md';
import { logout, getAllNotifications, updateNotificationViewStatus } from '../servicecall/api';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Header = ({ isSidebarExpanded }) => {
    const [notificationCount, setNotificationCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [userData, setUserData] = useState(null);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const stompClientRef = useRef(null);
    const subscriptionsRef = useRef([]);
    const isUpdatingNotifications = useRef(false);

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData);
                setUserData(parsedUserData);
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
            }
        }
    }, []);

    const sanitizeHtml = (html) => {
        if (!html) return '';

        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/data:/gi, '');
    };

    const isHtmlContent = (content) => {
        if (!content) return false;
        const htmlRegex = /<\/?[a-z][\s\S]*>/i;
        return htmlRegex.test(content);
    };

    const fetchAndUpdateNotifications = async () => {
        if (isUpdatingNotifications.current) {
            console.log('Notification update already in progress, skipping...');
            return;
        }

        isUpdatingNotifications.current = true;

        try {
            console.log('Fetching notifications...');
            const data = await getAllNotifications();
            setNotifications(data);
            const unreadCount = data.filter(n => !n.viewStatus).length;
            setNotificationCount(unreadCount);
            console.log('Notifications updated successfully:', data.length, 'total,', unreadCount, 'unread');
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            isUpdatingNotifications.current = false;
        }
    };

    useEffect(() => {
        if (userData?.id) {
            console.log('Initial fetch of notifications on component mount');
            fetchAndUpdateNotifications();
        }
    }, [userData]);

    useEffect(() => {
        if (isNotificationOpen && userData?.id) {
            console.log('Fetching notifications because popover opened');
            const fetchNotifications = async () => {
                try {
                    const data = await getAllNotifications();
                    setNotifications(data);
                    const unreadCount = data.filter(n => !n.viewStatus).length;
                    setNotificationCount(unreadCount);

                } catch (error) {
                    console.error('Failed to fetch notifications:', error);
                }
            };
            fetchNotifications();
        }
    }, [isNotificationOpen, userData]);

    const getTopicsForRole = (role) => {
        const topics = [];

        if (role === 'ROLE_RESIDENT') {
            topics.push('/all/user');
            topics.push(`/announcements/${userData.id}`);
            topics.push(`/task/${userData.id}`);
        } else if (role === 'ROLE_GUEST') {
            topics.push(`/announcements/${userData.id}`);
            topics.push(`/task/${userData.id}`);
        }

        return topics;
    };

    useEffect(() => {
        if (!userData || !userData.id || !userData.role) return;

        const connectWebSocket = () => {
            try {
                const WEBSOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8001/ws';
                console.log('Attempting to connect to WebSocket:', WEBSOCKET_URL);

                const socket = new SockJS(WEBSOCKET_URL);
                const stompClient = Stomp.over(socket);
                stompClientRef.current = stompClient;

                stompClient.configure({
                    debug: (str) => {
                        console.log('STOMP Debug:', str);
                    },
                    reconnectDelay: 5000,
                    heartbeatIncoming: 10000,
                    heartbeatOutgoing: 10000,
                    connectionTimeout: 10000,
                });

                stompClient.activate();

                stompClient.onConnect = (frame) => {
                    const topics = getTopicsForRole(userData.role);
                    console.log('Topics to subscribe for role', userData.role, ':', topics);

                    topics.forEach(topic => {
                        console.log('Subscribing to topic:', topic);

                        const subscription = stompClient.subscribe(topic, (message) => {
                            console.log('Received notification from topic', topic, ':', message.body);

                           
                            console.log('WebSocket message received, fetching all notifications');
                            fetchAndUpdateNotifications();

                            if (Notification.permission === 'granted') {
                                try {
                                    const notificationData = JSON.parse(message.body);
                                    const plainTextMessage = notificationData.message
                                        ? notificationData.message.replace(/<[^>]*>/g, '')
                                        : 'You have a new notification';

                                    new Notification('New Notification', {
                                        body: plainTextMessage,
                                        icon: '/favicon.ico'
                                    });
                                } catch (error) {
                                    console.error('Error parsing notification message:', error);
                                    new Notification('New Notification', {
                                        body: 'You have a new notification',
                                        icon: '/favicon.ico'
                                    });
                                }
                            }
                        });

                        subscriptionsRef.current.push(subscription);
                    });

                    console.log('Successfully subscribed to', topics.length, 'topics');
                };

                stompClient.onStompError = (frame) => {
                    console.error('STOMP error occurred:', frame);
                };

                stompClient.onWebSocketError = (error) => {
                    console.error('WebSocket error:', error);
                };

                stompClient.onWebSocketClose = (event) => {
                    console.log('WebSocket connection closed:', event);
                    if (event.code !== 1000) {
                        console.error('WebSocket closed unexpectedly. Code:', event.code, 'Reason:', event.reason);
                    }
                };

                stompClient.onDisconnect = () => {
                    console.log('Disconnected from WebSocket');
                };
            } catch (error) {
                console.error('Error connecting to WebSocket:', error);
            }
        };

        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }

        connectWebSocket();

        return () => {
            subscriptionsRef.current.forEach(subscription => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            });
            subscriptionsRef.current = [];

            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [userData]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getUserInitials = () => {
        if (!userData) return 'AD';
        const firstInitial = userData.firstName ? userData.firstName.charAt(0).toUpperCase() : '';
        const lastInitial = userData.lastName ? userData.lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    const getUserFullName = () => {
        if (!userData) return 'Admin User';
        return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    };

    const getUserRole = () => {
        if (!userData || !userData.role) return 'Admin';
        switch (userData.role) {
            case 'ROLE_ADMIN':
                return 'Admin';
            case 'ROLE_GUEST':
                return 'Guest';
            case 'ROLE_RESIDENT':
                return 'Resident';
            default:
                return 'User';
        }
    };

    const getNotificationSenderInitials = (from) => {
        if (!from || !from.name) return 'UN';
        const nameParts = from.name.trim().split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }
        const firstInitial = nameParts[0].charAt(0).toUpperCase();
        const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
    };

    const handleNotificationClick = async (notification) => {
        try {
            await updateNotificationViewStatus(notification.id);

            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notification.id
                        ? { ...n, viewStatus: !n.viewStatus }
                        : n
                )
            );

            const updatedNotifications = notifications.map(n =>
                n.id === notification.id
                    ? { ...n, viewStatus: !n.viewStatus }
                    : n
            );
            const unreadCount = updatedNotifications.filter(n => !n.viewStatus).length;
            setNotificationCount(unreadCount);

        } catch (error) {
            console.error('Failed to update notification status:', error);
        }
    };

    const handleLogout = async () => {
        try {
            subscriptionsRef.current.forEach(subscription => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            });
            subscriptionsRef.current = [];

            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.deactivate();
            }
            const response = await logout();
            if (response) {
                window.location.href = '/login';
            }
        } catch (error) {
            localStorage.removeItem('userData');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        setIsNotificationOpen(false);
    };

    const toggleNotification = () => {
        setIsNotificationOpen(!isNotificationOpen);
        setIsDropdownOpen(false);
    };

    const NotificationMessage = ({ message }) => {
        if (!message) {
            return <span className="text-sm text-gray-900">No message content</span>;
        }

        if (isHtmlContent(message)) {
            return (
                <span
                    className="text-sm text-gray-900 notification-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }}
                />
            );
        }

        return <span className="text-sm text-gray-900">{message}</span>;
    };

    return (
        <>
            <style jsx>{`
                .notification-content {
                    display: inline;
                    line-height: 1.4;
                    word-break: break-word;
                }
                .notification-content h1,
                .notification-content h2,
                .notification-content h3,
                .notification-content h4,
                .notification-content h5,
                .notification-content h6 {
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.2;
                    display: inline;
                }
                .notification-content h1 { font-size: 0.875rem; }
                .notification-content h2 { font-size: 0.875rem; }
                .notification-content h3 { font-size: 0.875rem; }
                .notification-content h4,
                .notification-content h5,
                .notification-content h6 { font-size: 0.875rem; }
                .notification-content p {
                    margin: 0;
                    line-height: 1.4;
                    display: inline;
                }
                .notification-content ul,
                .notification-content ol {
                    margin: 0;
                    padding-left: 1rem;
                    display: inline-block;
                }
                .notification-content li {
                    margin: 0;
                    display: list-item;
                }
                .notification-content strong,
                .notification-content b {
                    font-weight: 600;
                }
                .notification-content em,
                .notification-content i {
                    font-style: italic;
                }
                .notification-content a {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .notification-content a:hover {
                    color: #1d4ed8;
                }
                .notification-content code {
                    background-color: #f3f4f6;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-family: monospace;
                    font-size: 0.75rem;
                }
                .notification-content blockquote {
                    border-left: 3px solid #d1d5db;
                    padding-left: 0.5rem;
                    margin: 0;
                    font-style: italic;
                    color: #6b7280;
                    display: inline-block;
                }
                .notification-content img {
                    max-width: 100px;
                    height: auto;
                    border-radius: 0.25rem;
                    margin: 0;
                    display: inline-block;
                    vertical-align: middle;
                }
                .notification-content br {
                    display: none;
                }
                .notification-content div {
                    display: inline;
                }
            `}</style>

            <header
                className={`bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 h-12 transition-all duration-300 ${isSidebarExpanded ? 'ml-48' : 'ml-12'}`}
            >
                <div></div>

                <div className="flex items-center gap-4">
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={toggleNotification}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
                        >
                            <MdNotifications className="h-5 w-5" strokeWidth={1} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30 max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification, index) => (
                                        <div
                                            key={notification.id || index}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors duration-200 ${!notification.viewStatus ? 'bg-red-50' : 'bg-white'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                              
                                                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <span className="text-white text-xs font-medium">
                                                        {getNotificationSenderInitials(notification.from)}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="mb-2">
                                                        <span className="text-sm">
                                                            <span className="font-bold">
                                                                {notification?.from?.name}
                                                            </span>
                                                            {notification.message && (
                                                                <>
                                                                    <span> </span>
                                                                    <NotificationMessage message={notification.message} />
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        {notification.time
                                                            ? new Date(notification.time).toLocaleString()
                                                            : 'No timestamp'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center">
                                        <MdNotifications className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No notifications</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {getUserInitials()}
                                </span>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {getUserFullName()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {getUserRole()}
                                </p>
                            </div>

                            <MdKeyboardArrowDown
                                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                >
                                    <MdLogout className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;