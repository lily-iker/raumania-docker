package com.fragrance.raumania.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryResponse {
    private long totalOrders;
    private long totalProducts;
    private long totalUsers;
    private long newOrders;
    private long newProducts;
    private long newUsers;
    private double orderGrowth;
    private double productGrowth;
    private double userGrowth;
}