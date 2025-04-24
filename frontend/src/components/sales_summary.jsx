import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { CalendarIcon, ChartBarIcon, ChartPieIcon, UsersIcon, CubeIcon, ArrowPathIcon } from '@heroicons/react/20/solid';

// Import Tailwind CSS (ensure it's configured in your project)
import './styles.css'; // You can create a separate styles.css for more specific styling

const purchaseTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'PRINT', label: 'Print' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'TOPUP', label: 'Topup' },
  { value: 'CASH', label: 'Cash' },
];

function Sales() {
  const currentYear = new Date().getFullYear();
  const defaultStartDate = new Date(currentYear, 0, 1);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPurchaseType, setSelectedPurchaseType] = useState(purchaseTypeOptions[0]);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:4000/api/tmx/performance/sales-data', {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            purchaseType: selectedPurchaseType.value,
          },
        });
        setSalesData(response.data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [startDate, endDate, selectedPurchaseType]);

  const renderSalesTrendChart = () => {
    if (salesData?.salesTrend?.length > 0) {
      const labels = salesData.salesTrend.map(item => new Date(item.sale_date).toLocaleDateString());
      const data = {
        labels: labels,
        datasets: [
          {
            label: 'Sales Value',
            data: salesData.salesTrend.map(item => parseFloat(item.daily_sales_value)),
            borderColor: '#6610f2',
            backgroundColor: 'rgba(102, 16, 242, 0.1)',
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 2,
          },
        ],
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e0e0e0' },
          },
          x: {
            grid: { color: '#e0e0e0' },
          },
        },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true } },
          tooltip: { mode: 'index', intersect: false },
        },
      };
      return <div className="chart-container"><Line data={data} options={options} /></div>;
    }
    return <div className="empty-data"><ChartBarIcon className="h-5 w-5 mr-2 text-gray-400" /> No sales trend data available.</div>;
  };

  const renderSalesByTypeChart = () => {
    if (salesData?.salesByType?.length > 0) {
      const labels = salesData.salesByType.map(item => item.purchase_type);
      const data = {
        labels: labels,
        datasets: [
          {
            data: salesData.salesByType.map(item => parseFloat(item.sales_value)),
            backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'],
            borderColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'],
            borderWidth: 1,
          },
        ],
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true } },
          tooltip: { callbacks: { label: (context) => `${context.label}: ${context.formattedValue}` } },
        },
      };
      return <div className="chart-container"><Pie data={data} options={options} /></div>;
    }
    return <div className="empty-data"><ChartPieIcon className="h-5 w-5 mr-2 text-gray-400" /> No sales by type data available.</div>;
  };

  const renderSalesByAgentTable = () => {
    if (salesData?.salesByAgent?.length > 0) {
      return (
        <div className="table-responsive">
          <table className="modern-table">
            <thead className="bg-gray-100">
              <tr>
                <th>Agent UUID</th>
                <th>Total Sales Value</th>
                <th>Total Vouchers</th>
              </tr>
            </thead>
            <tbody>
              {salesData.salesByAgent.map(agent => (
                <tr key={agent.agent_uuid}>
                  <td>{agent.agent_uuid}</td>
                  <td>{parseFloat(agent.total_sales_value).toFixed(2)}</td>
                  <td>{agent.total_vouchers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <div className="empty-data"><UsersIcon className="h-5 w-5 mr-2 text-gray-400" /> No sales by agent data available.</div>;
  };

  const renderSalesByBatchTable = () => {
    if (salesData?.salesByBatch?.length > 0) {
      return (
        <div className="table-responsive">
          <table className="modern-table">
            <thead className="bg-gray-100">
              <tr>
                <th>Batch Number</th>
                <th>Total Sales Value</th>
                <th>Total Vouchers Sold</th>
              </tr>
            </thead>
            <tbody>
              {salesData.salesByBatch.map(batch => (
                <tr key={batch.batch_number}>
                  <td>{batch.batch_number}</td>
                  <td>{parseFloat(batch.total_sales_value).toFixed(2)}</td>
                  <td>{batch.total_vouchers_sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <div className="empty-data"><CubeIcon className="h-5 w-5 mr-2 text-gray-400" /> No sales by batch data available.</div>;
  };

  return (
    <div className="sales-dashboard">
      <h2 className="dashboard-title">
        <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-500" /> Sales Performance Dashboard
      </h2>

      <div className="filter-section">
        <div className="filter-item">
          <label><CalendarIcon className="h-4 w-4 mr-1 text-gray-500" /> Start Date:</label>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="modern-datepicker" />
        </div>
        <div className="filter-item">
          <label><CalendarIcon className="h-4 w-4 mr-1 text-gray-500" /> End Date:</label>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="modern-datepicker" />
        </div>
        <div className="filter-item">
          <label>Purchase Type:</label>
          <Select
            value={selectedPurchaseType}
            onChange={(option) => setSelectedPurchaseType(option)}
            options={purchaseTypeOptions}
            className="modern-select"
            classNamePrefix="react-select"
          />
        </div>
        {/* Add Agent UUID and Batch Number filters here if needed */}
      </div>

      {loading ? (
        <div className="loading-indicator">
          <ArrowPathIcon className="animate-spin h-5 w-5 mr-2 text-indigo-500" /> Loading Sales Data...
        </div>
      ) : (
        salesData && (
          <div className="dashboard-content">
            <div className="overview-section">
              <div className="overview-card">
                <h3>Overall Sales Value</h3>
                <p className="overview-value">${parseFloat(salesData.overallTotals.totalsalesvalue).toFixed(2)}</p>
              </div>
              <div className="overview-card">
                <h3>Total Vouchers Sold</h3>
                <p className="overview-value">{salesData.overallTotals.totalvouchers}</p>
              </div>
            </div>

            <div className="chart-grid">
              <div className="chart-card">
                <h3>Sales Trend</h3>
                {renderSalesTrendChart()}
              </div>
              <div className="chart-card">
                <h3>Sales by Purchase Type</h3>
                {renderSalesByTypeChart()}
              </div>
            </div>

            <div className="table-section">
              <div className="table-card">
                <h3>Top Performing Agents</h3>
                {renderSalesByAgentTable()}
              </div>
              <div className="table-card">
                <h3>Sales by Batch Number</h3>
                {renderSalesByBatchTable()}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default Sales;