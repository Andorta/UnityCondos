
import { NavLink } from 'react-router-dom';
import {
    Squares2X2Icon,
    CreditCardIcon,
    HandRaisedIcon,
    ClipboardDocumentListIcon,
    SpeakerWaveIcon,
    MegaphoneIcon,
    CogIcon
} from '@heroicons/react/24/outline';
import {
    Squares2X2Icon as Squares2X2IconSolid,
    CreditCardIcon as CreditCardIconSolid,
    HandRaisedIcon as HandRaisedIconSolid,
    ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
    MegaphoneIcon as MegaphoneIconSolid,
    CogIcon as CogIconSolid
} from '@heroicons/react/24/solid';

const navItems = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: Squares2X2Icon,
        iconSolid: Squares2X2IconSolid,
        roles: ['ROLE_ADMIN', 'ROLE_RESIDENT', 'ROLE_GUEST']
    },
    {
        path: '/payments',
        label: 'Payments',
        icon: CreditCardIcon,
        iconSolid: CreditCardIconSolid,
        roles: ['ROLE_ADMIN', 'ROLE_RESIDENT', 'ROLE_GUEST']
    },
    {
        path: '/votings',
        label: 'Votings',
        icon: HandRaisedIcon,
        iconSolid: HandRaisedIconSolid,
        roles: ['ROLE_ADMIN', 'ROLE_RESIDENT']
    },
    {
        path: '/tasks',
        label: 'Tasks',
        icon: ClipboardDocumentListIcon,
        iconSolid: ClipboardDocumentListIconSolid,
        roles: ['ROLE_ADMIN', 'ROLE_RESIDENT', 'ROLE_GUEST']
    },
    {
        path: '/announcements',
        label: 'Announcements',
        icon: MegaphoneIcon,
        iconSolid: MegaphoneIconSolid,
        roles: ['ROLE_ADMIN', 'ROLE_RESIDENT']
    },
    {
        path: '/control-panel',
        label: 'Control Panel',
        icon: CogIcon,
        iconSolid: CogIconSolid,
        roles: ['ROLE_ADMIN']
    }
];

const Sidebar = () => {
    const getUserRole = () => {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return user.role || 'ROLE_USER';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
        return 'ROLE_GUEST';
    };

    const userRole = getUserRole();

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(userRole)
    );

    return (
        <aside className="group fixed h-screen bg-indigo-900 hover:w-48 w-12 transition-all duration-300 shadow-lg overflow-hidden z-10">
            <div className="p-2">
                <div className="mb-8 flex items-center">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">

                        <svg className="w-6 h-6 text-indigo-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.84l6 5.16V20h-2v-6H8v6H6v-9l6-5.16z" />
                        </svg>
                    </div>
                    <span className="ml-3 font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">
                        Residency Mgmt
                    </span>
                </div>

                <nav className="flex flex-col gap-1">
                    {filteredNavItems.map(({ path, label, icon: Icon, iconSolid: IconSolid }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-2 rounded-md transition-all duration-200 relative ${isActive
                                    ? 'bg-white text-indigo-900 shadow-sm'
                                    : 'text-white hover:bg-indigo-800 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                                        {isActive ? (
                                            <IconSolid className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium text-sm">
                                        {label}
                                    </span>
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:hidden hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                        {label}
                                    </div>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;