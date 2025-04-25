import React, { useState } from 'react';
import {
    HomeIcon,
    ArrowTrendingUpIcon,
    ArchiveBoxIcon,
    ClockIcon,
    ShoppingCartIcon,
    ArrowsRightLeftIcon,
    ExclamationCircleIcon,
    SquaresPlusIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
const Sidebar = ({ onNavigate, activeSection }) => {
    const [expanded, setExpanded] = useState(null);

    const handleGroupClick = (groupKey) => {
        setExpanded(expanded === groupKey ? null : groupKey);
    };

    const handleClick = (key) => {
        onNavigate(key);
        setExpanded(null);
    };
    const navItems = [
        {
            group: 'Performance',
            icon: <ArrowTrendingUpIcon className="h-5 w-5 mr-3 text-emerald-500" />,
            items: [
                { name: 'Overview', key: 'overview' },
                { name: 'Sales', key: 'sales' },
            ],
        },
        {
            group: 'Inventory',
            icon: <ArchiveBoxIcon className="h-5 w-5 mr-3 text-emerald-500" />,
            items: [
                { name: 'Stock Levels', key: 'stock' },
                { name: 'Recent Activity', key: 'activity' },
            ],
        },
        {
            group: 'Management',
            icon: <SquaresPlusIcon className="h-5 w-5 mr-3 text-emerald-500" />,
            items: [
                { name: 'Orders', key: 'orders' },
                { name: 'Transactions', key: 'transactions' },
            ],
            future: true,
        },
    ];
    return (
        <aside className="w-64 bg-emerald-50 shadow-lg h-screen flex flex-col py-8 px-3 border-r border-emerald-200">
            <div className="mb-10 flex items-center justify-center">
                <h2 className="text-xl font-semibold text-emerald-700 tracking-wider">
                    Master Agent
                </h2>
            </div>
            <nav className="flex-grow space-y-0.5">
                {navItems.map((groupItem) => (
                    <div key={groupItem.group}>
                        <div
                            onClick={() => handleGroupClick(groupItem.group)}
                            className={`flex items-center justify-between py-2 px-3 rounded-md text-gray-700 hover:bg-emerald-100 cursor-pointer ${
                                expanded === groupItem.group ? 'bg-emerald-100 font-semibold text-emerald-700' : ''
                            }`}
                        >
                            <div className="flex items-center">
                                {groupItem.icon}
                                <span className="ml-2 text-sm font-medium">{groupItem.group}</span>
                                {groupItem.future && (
                                    <span className="ml-1 text-xs text-gray-500 italic">(Future)</span>
                                )}
                            </div>
                            {groupItem.items ? (
                                expanded === groupItem.group ? (
                                    <ChevronUpIcon className="h-4 w-4 text-gray-600" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                                )
                            ) : null}
                        </div>
                        {groupItem.items && expanded === groupItem.group && (
                            <div className="mt-1 ml-1.5 space-y-0.5">
                                {groupItem.items.map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => handleClick(item.key)}
                                        className={`w-full py-2 px-4 rounded-md text-left text-gray-600 hover:bg-emerald-50 cursor-pointer text-sm transition-colors duration-200 ${
                                            activeSection === item.key ? 'bg-emerald-100 text-emerald-700 font-semibold' : ''
                                        }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
            <div className="mt-auto py-4 text-center text-gray-500 text-xs border-t border-emerald-200">
                <p>&copy; {new Date().getFullYear()} tmx_master Agent</p>
            </div>
        </aside>
    );
};
export default Sidebar;