import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Inventory() {
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchStockLevels = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/tmx/inventory/stock'); // Assuming your API Gateway runs on port 8000
                setStockData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load stock levels.');
                setLoading(false);
                console.error('Error fetching stock levels:', err);
            }
        };

        fetchStockLevels();
    }, []);

    if (loading) {
        return <div>Loading stock levels...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!stockData) {
        return <div>No stock data available.</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Stock Levels</h2>

            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Available Vouchers</h3>
                <p className="text-2xl font-bold text-indigo-600">{stockData.totalAvailableVouchers}</p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Stock Levels by Denomination</h3>
                {stockData.stockLevelsByDenomination && stockData.stockLevelsByDenomination.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal shadow-md rounded-lg">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Denomination
                                    </th>
                                    <th className="px-5 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Available Count
                                    </th>
                                    <th className="px-5 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockData.stockLevelsByDenomination.map((item) => (
                                    <tr key={item.denomination} className="border-b border-gray-200">
                                        <td className="px-5 py-5 bg-white text-sm">
                                            ${parseFloat(item.denomination).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-5 bg-white text-sm">
                                            {item.count}
                                        </td>
                                        <td className="px-5 py-5 bg-white text-sm">
                                            {item.isLowStock ? (
                                                <span className="px-2 py-1 font-semibold leading-tight text-orange-700 bg-orange-100 rounded-full">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No stock levels by denomination available.</p>
                )}
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Value of Available Inventory</h3>
                <p className="text-2xl font-bold text-green-600">${stockData.totalValueOfAvailableInventory}</p>
            </div>
        </div>
    );
}

export default Inventory;