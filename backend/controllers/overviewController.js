const pool = require('../config/db');

const getKpis = async (req, res) => {
    const { period, specificDate } = req.query; // Added specificDate for targeting specific months/weeks
    let startDate, endDate;

    const today = new Date();

    const getStartAndEndOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return {
            start: new Date(year, month, 1).toISOString().split('T')[0],
            end: new Date(year, month + 1, 0).toISOString().split('T')[0],
        };
    };

    const getStartAndEndOfWeek = (date) => {
        const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday as start
        const startOfWeek = new Date(date);
        startOfWeek.setDate(diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
            start: startOfWeek.toISOString().split('T')[0],
            end: endOfWeek.toISOString().split('T')[0],
        };
    };

    switch (period) {
        case 'today':
            startDate = today.toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
            break;
        case 'this_week':
            const thisWeek = getStartAndEndOfWeek(today);
            startDate = thisWeek.start;
            endDate = thisWeek.end;
            break;
        case 'last_week':
            const lastWeekDate = new Date();
            lastWeekDate.setDate(today.getDate() - 7);
            const lastWeek = getStartAndEndOfWeek(lastWeekDate);
            startDate = lastWeek.start;
            endDate = lastWeek.end;
            break;
        case 'this_month':
            const thisMonth = getStartAndEndOfMonth(today);
            startDate = thisMonth.start;
            endDate = thisMonth.end;
            break;
        case 'last_month':
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(today.getMonth() - 1);
            const lastMonth = getStartAndEndOfMonth(lastMonthDate);
            startDate = lastMonth.start;
            endDate = lastMonth.end;
            break;
        case 'specific_month':
            if (specificDate) {
                const [year, month] = specificDate.split('-'); // Expected format: YYYY-MM
                if (year && month) {
                    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                    const specificMonth = getStartAndEndOfMonth(date);
                    startDate = specificMonth.start;
                    endDate = specificMonth.end;
                } else {
                    return res.status(400).json({ error: 'Invalid specificDate format. Use YYYY-MM.' });
                }
            } else {
                return res.status(400).json({ error: 'specificDate parameter is required for period "specific_month".' });
            }
            break;
        case 'specific_week':
            if (specificDate) {
                const date = new Date(specificDate); // Expected format: YYYY-MM-DD (can adjust)
                const specificWeek = getStartAndEndOfWeek(date);
                startDate = specificWeek.start;
                endDate = specificWeek.end;
            } else {
                return res.status(400).json({ error: 'specificDate parameter is required for period "specific_week".' });
            }
            break;
        default: // Default to this month
            const defaultMonth = getStartAndEndOfMonth(today);
            startDate = defaultMonth.start;
            endDate = defaultMonth.end;
            break;
    }

    try {
        // Total Sales Value
        const totalSalesResult = await pool.query(
            `SELECT COALESCE(SUM(total_amount), 0) AS total_sales_value
             FROM agent_purchase_summary
             WHERE created_at::date BETWEEN $1 AND $2`,
            [startDate, endDate]
        );
        const totalSalesValue = totalSalesResult.rows[0].total_sales_value;

        // Total Vouchers Sold
        const totalVouchersResult = await pool.query(
            `SELECT COALESCE(SUM(total_vouchers), 0) AS total_vouchers_sold
             FROM agent_purchase_summary
             WHERE created_at::date BETWEEN $1 AND $2`,
            [startDate, endDate]
        );
        const totalVouchersSold = totalVouchersResult.rows[0].total_vouchers_sold;

        // Total Active Vouchers (This might not be date-dependent in the same way)
        const totalActiveVouchersResult = await pool.query(
            `SELECT COUNT(*) AS total_active_vouchers
             FROM purchase_details
             WHERE redeem_status = 'NOT_REDEEMED'`
        );
        const totalActiveVouchers = totalActiveVouchersResult.rows[0].total_active_vouchers;

        // Overall Redemption Rate (Likely not directly date-dependent for the KPI itself)
        const totalPurchasedVouchersResult = await pool.query(
            `SELECT COUNT(*) AS total_purchased
             FROM purchase_details`
        );
        const totalPurchasedVouchers = totalPurchasedVouchersResult.rows[0].total_purchased;

        const redeemedVouchersResult = await pool.query(
            `SELECT COUNT(*) AS total_redeemed
             FROM purchase_details
             WHERE redeem_status = 'REDEEMED'`
        );
        const redeemedVouchers = redeemedVouchersResult.rows[0].total_redeemed;

        const redemptionRate = totalPurchasedVouchers > 0 ? (redeemedVouchers / totalPurchasedVouchers) * 100 : 0;

        // Sales Trend (Adjust to be within the selected period)
        const salesTrendResult = await pool.query(
            `SELECT DATE(created_at) AS sale_date, SUM(total_amount) AS daily_sales
             FROM agent_purchase_summary
             WHERE created_at::date BETWEEN $1 AND $2
             GROUP BY DATE(created_at)
             ORDER BY DATE(created_at)`,
            [startDate, endDate]
        );
        const salesTrendData = salesTrendResult.rows;

        // Sales Breakdown by Purchase Type
        const salesByTypeResult = await pool.query(
            `SELECT purchase_type, SUM(total_amount) AS sales_amount
             FROM agent_purchase_summary
             WHERE created_at::date BETWEEN $1 AND $2
             GROUP BY purchase_type`,
            [startDate, endDate]
        );
        const salesByTypeData = salesByTypeResult.rows;

        // Top Performing Agents
        const topAgentsResult = await pool.query(
            `SELECT agent_id, SUM(total_amount) AS total_sales
             FROM agent_purchase_summary
             WHERE created_at::date BETWEEN $1 AND $2
             GROUP BY agent_id
             ORDER BY SUM(total_amount) DESC
             LIMIT 5`,
            [startDate, endDate]
        );
        const topAgentsData = topAgentsResult.rows;

        res.json({
            totalSalesValue: parseFloat(totalSalesValue),
            totalVouchersSold: parseInt(totalVouchersSold),
            totalActiveVouchers: parseInt(totalActiveVouchers),
            redemptionRate: parseFloat(redemptionRate.toFixed(2)),
            salesTrend: salesTrendData,
            salesByType: salesByTypeData,
            topAgents: topAgentsData,
        });
    } catch (error) {
        console.error('Error fetching Overview data:', error);
        res.status(500).json({ error: 'Failed to fetch Overview data' });
    }
};

module.exports = {
    getKpis,
};