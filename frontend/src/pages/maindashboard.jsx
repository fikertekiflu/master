import React from 'react';
import Overview from '../components/overview'; // Import the dynamic Overview component
import Sales from '../components/sales_summary'; // Import the dynamic Overview component
import StockLevels from '../components/inventory'; // Import the dynamic Overview component

export default function MainDashboard({ activeSection }) {
    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <Overview />; 
            case 'sales':
                return <Sales />;
            case 'stock':
                return <StockLevels />;
            case 'activity':
                return <RecentActivity />;
            case 'orders':
                return <Placeholder title="Orders" />;
            case 'transactions':
                return <Placeholder title="Transactions" />;
            case 'low-stock':
                return <Placeholder title="Low Stock Alerts" />;
            default:
                return <Overview />; // Default to the actual Overview component
        }
    };

    return (
        <main className="flex-1 bg-gray-100 p-6">
            <div className="bg-white shadow-md rounded-md p-6">
                {renderContent()}
            </div>
        </main>
    );
}

// Keep these placeholder components for other sections
// const Sales = () => <Section title="📈 Sales Performance" text="Detailed sales trends and analysis." />;
// const StockLevels = () => <Section title="📦 Stock Levels" text="Current voucher inventory and denominations." />;
const RecentActivity = () => <Section title="⏱️ Recent Activity" text="Log of recent purchases and redemptions." />;
const Placeholder = ({ title }) => (
    <Section title={`🚧 ${title}`} text="This section is under development..." />
);

const Section = ({ title, text }) => (
    <div className="mb-6">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">{title}</h2>
        <p className="text-gray-600">{text}</p>
    </div>
);