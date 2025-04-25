import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Pie, Bar } from 'react-chartjs-2';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, 
  BarElement, 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const monthOptions = [
    { value: '2025-01', label: 'January 2025' },
    { value: '2025-02', label: 'February 2025' },
    { value: '2025-03', label: 'March 2025' },
    { value: '2025-04', label: 'April 2025' },
    { value: '2025-05', label: 'May 2025' },
    { value: '2025-06', label: 'June 2025' },
    { value: '2025-07', label: 'July 2025' },
    { value: '2025-08', label: 'August 2025' },
    { value: '2025-09', label: 'September 2025' },
    { value: '2025-10', label: 'October 2025' },
    { value: '2025-11', label: 'November 2025' },
    { value: '2025-12', label: 'December 2025' },
];

function Overview() {
    const [overviewData, setOverviewData] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(monthOptions.find(option => option.value === '2025-04')); // Default to April 2025

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/tmx/performance/kpis?period=specific_month&specificDate=${selectedMonth.value}`);
                setOverviewData(response.data);
                console.log('Overview Data:', response.data); // For debugging
            } catch (error) {
                console.error('Error fetching overview data:', error);
                setOverviewData(null);
            }
        };
        fetchOverviewData();
    }, [selectedMonth]);
    const handleMonthChange = (selectedOption) => {
        setSelectedMonth(selectedOption);
    };
    const salesTrendChartData = overviewData?.salesTrend ? {
        labels: overviewData.salesTrend.map(item => new Date(item.sale_date).toLocaleDateString()),
        datasets: [{
            label: 'Daily Sales',
            data: overviewData.salesTrend.map(item => parseFloat(item.daily_sales)),
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
        }],
    } : { labels: [], datasets: [] };
    const salesByTypeChartData = overviewData?.salesByType ? {
        labels: overviewData.salesByType.map(item => item.purchase_type),
        datasets: [{
            data: overviewData.salesByType.map(item => parseFloat(item.sales_amount)),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        }],
    } : { labels: [], datasets: [] };

    const topAgentsChartData = overviewData?.topAgents ? {
        labels: overviewData.topAgents.map(item => `Agent ${item.agent_id}`),
        datasets: [{
            label: 'Total Sales',
            data: overviewData.topAgents.map(item => parseFloat(item.total_sales)),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
        }],
    } : { labels: [], datasets: [] };
    return (
        <div className="p-6">
            <div className="mb-4">
                <label htmlFor="month-select" className="block text-gray-700 text-sm font-bold mb-2">
                    Select Month:
                </label>
                <Select
                    id="month-select"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    options={monthOptions}
                    className="basic-single"
                    classNamePrefix="select"
                />
            </div>
            {overviewData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className=" shadow rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
                        <p className="text-2xl font-bold text-indigo-600"> Birr{overviewData.totalSalesValue}</p>
                    </div>
                    <div className=" shadow rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-700">Total Vouchers Sold</h3>
                        <p className="text-2xl font-bold text-blue-600">{overviewData.totalVouchersSold}</p>
                    </div>
                    <div className=" shadow rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-700">Total Active Vouchers</h3>
                        <p className="text-2xl font-bold text-yellow-600">{overviewData.totalActiveVouchers}</p>
                    </div>
                    <div className=" shadow rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-700">Redemption Rate</h3>
                        <p className="text-2xl font-bold text-green-600">{overviewData.redemptionRate}%</p>
                    </div>
                </div>
            ) : (
                <div>Loading Overview Data...</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="shadow rounded p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sales Trend</h3>
                    {overviewData?.salesTrend && overviewData.salesTrend.length > 0 ? (
                        <Line data={salesTrendChartData} />
                    ) : (
                        <p className="text-gray-500">No sales trend data for the selected month.</p>
                    )}
                </div>
                <div className="shadow rounded p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sales by Purchase Type</h3>
                    {overviewData?.salesByType && overviewData.salesByType.length > 0 ? (
                        <Pie data={salesByTypeChartData} />
                    ) : (
                        <p className="text-gray-500">No sales by purchase type data for the selected month.</p>
                    )}
                </div>
            </div>
            {overviewData?.topAgents && overviewData.topAgents.length > 0 && (
                <div className=" shadow rounded p-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Top Performing Agents</h3>
                    <Bar data={topAgentsChartData} options={{ indexAxis: 'y' }} />
                </div>
            )}
            {overviewData?.topAgents && overviewData.topAgents.length === 0 && (
                <div className=" shadow rounded p-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Top Performing Agents</h3>
                    <p className="text-gray-500">No top performing agents data for the selected month.</p>
                </div>
            )}
        </div>
    );
}
export default Overview;