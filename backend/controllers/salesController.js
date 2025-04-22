const pool = require('../config/db');

exports.getSalesData = async (req, res) => {
    const { startDate: reqStartDate, endDate: reqEndDate, purchaseType, agentUuid, batchNumber } = req.query;

    
    const currentYear = new Date().getFullYear();
    const defaultStartDate = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0)).toISOString().split('T')[0]; // UTC
    const defaultEndDate = new Date().toISOString().split('T')[0]; // Today

    const startDate = reqStartDate || defaultStartDate;
    const endDate = reqEndDate || defaultEndDate;

    try {
        
        const overallTotalsResult = await pool.query(`
            SELECT SUM(pd.face_value) AS totalSalesValue, COUNT(pd.voucher_id) AS totalVouchers
            FROM purchase_details pd;
        `);
        const overallTotals = overallTotalsResult.rows[0] || { totalSalesValue: 0, totalVouchers: 0 };

        
        let salesTrendQuery = `
            SELECT
                DATE(pd.created_at) AS sale_date,
                SUM(pd.face_value) AS daily_sales_value,
                COUNT(pd.voucher_id) AS daily_vouchers
            FROM purchase_details pd
            LEFT JOIN agent_purchase_summary aps ON pd.purchase_summary_id = aps.id
            LEFT JOIN print_purchase_details ppd ON pd.purchase_summary_id = ppd.purchase_detail_id
            LEFT JOIN download_purchase_details dpd ON pd.purchase_summary_id = dpd.purchase_detail_id
            WHERE pd.created_at >= $1 AND pd.created_at <= $2
            ${purchaseType ? 'AND aps.purchase_type = $3' : ''}
            ${agentUuid ? 'AND pd.agent_uuid = $4' : ''}
            ${batchNumber ? 'AND (aps.batch_number = $5 OR ppd.print_batch_number = $5 OR dpd.download_batch_number = $5)' : ''}
            GROUP BY sale_date
            ORDER BY sale_date;
        `;

        const salesTrendValues = [startDate, endDate];
        if (purchaseType) salesTrendValues.push(purchaseType);
        if (agentUuid) salesTrendValues.push(agentUuid);
        if (batchNumber) salesTrendValues.push(batchNumber);

        const salesTrendResult = await pool.query(salesTrendQuery, salesTrendValues);
        const salesTrend = salesTrendResult.rows;

        
        let salesByTypeQuery = `
            SELECT
                COALESCE(aps.purchase_type, 'PRINT') AS purchase_type,
                SUM(pd.face_value) AS sales_value,
                COUNT(pd.voucher_id) AS voucher_count
            FROM purchase_details pd
            LEFT JOIN agent_purchase_summary aps ON pd.purchase_summary_id = aps.id
            LEFT JOIN print_purchase_details ppd ON pd.purchase_summary_id = ppd.purchase_detail_id
            LEFT JOIN download_purchase_details dpd ON pd.purchase_summary_id = dpd.purchase_detail_id
            WHERE pd.created_at >= $1 AND pd.created_at <= $2
            ${purchaseType ? 'AND aps.purchase_type = $3' : ''}
            ${agentUuid ? 'AND pd.agent_uuid = $4' : ''}
            ${batchNumber ? 'AND aps.batch_number = $5' : ''}
            GROUP BY purchase_type;
        `;

        const salesByTypeValues = [startDate, endDate];
        if (purchaseType) salesByTypeValues.push(purchaseType);
        if (agentUuid) salesByTypeValues.push(agentUuid);
        if (batchNumber) salesByTypeValues.push(batchNumber);

        const salesByTypeResult = await pool.query(salesByTypeQuery, salesByTypeValues);
        const salesByType = salesByTypeResult.rows;

        
        let salesByAgentQuery = `
            SELECT
                pd.agent_uuid,
                SUM(pd.face_value) AS total_sales_value,
                COUNT(pd.voucher_id) AS total_vouchers
            FROM purchase_details pd
            LEFT JOIN agent_purchase_summary aps ON pd.purchase_summary_id = aps.id
            LEFT JOIN print_purchase_details ppd ON pd.purchase_summary_id = ppd.purchase_detail_id
            LEFT JOIN download_purchase_details dpd ON pd.purchase_summary_id = dpd.purchase_detail_id
            WHERE pd.created_at >= $1 AND pd.created_at <= $2
            ${purchaseType ? 'AND aps.purchase_type = $3' : ''}
            ${agentUuid ? 'AND pd.agent_uuid = $4' : ''}
            ${batchNumber ? 'AND aps.batch_number = $5' : ''}
            GROUP BY pd.agent_uuid
            ORDER BY total_sales_value DESC
            LIMIT 10; 
        `;
        const salesByAgentValues = [startDate, endDate];
        if (purchaseType) salesByAgentValues.push(purchaseType);
        if (agentUuid) salesByAgentValues.push(agentUuid);
        if (batchNumber) salesByAgentValues.push(batchNumber);

        const salesByAgentResult = await pool.query(salesByAgentQuery, salesByAgentValues);
        const salesByAgent = salesByAgentResult.rows;

        
        let salesByBatchQuery = `
        SELECT
            COALESCE(aps.batch_number, ppd.print_batch_number, dpd.download_batch_number) AS batch_number,
            SUM(pd.face_value) AS total_sales_value,
            COUNT(pd.voucher_id) AS total_vouchers_sold
        FROM purchase_details pd
        LEFT JOIN agent_purchase_summary aps ON pd.purchase_summary_id = aps.id
        LEFT JOIN print_purchase_details ppd ON pd.purchase_summary_id = ppd.purchase_detail_id
        LEFT JOIN download_purchase_details dpd ON pd.purchase_summary_id = dpd.purchase_detail_id
        WHERE pd.created_at >= $1 AND pd.created_at <= $2
        ${purchaseType ? 'AND aps.purchase_type = $3' : ''}
        ${agentUuid ? 'AND pd.agent_uuid = $4' : ''}
        ${batchNumber ? 'AND (aps.batch_number = $5 OR ppd.print_batch_number = $5 OR dpd.download_batch_number = $5)' : ''}
        GROUP BY COALESCE(aps.batch_number, ppd.print_batch_number, dpd.download_batch_number)
        ORDER BY total_sales_value DESC;
    `;
        const salesByBatchValues = [startDate, endDate];
        if (purchaseType) salesByBatchValues.push(purchaseType);
        if (agentUuid) salesByBatchValues.push(agentUuid);
        if (batchNumber) salesByBatchValues.push(batchNumber);

        const salesByBatchResult = await pool.query(salesByBatchQuery, salesByBatchValues);
        const salesByBatch = salesByBatchResult.rows;

        res.json({
            overallTotals,
            salesTrend,
            salesByType,
            salesByAgent,
            salesByBatch, 
        });

    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Failed to fetch sales data' });
    }
};