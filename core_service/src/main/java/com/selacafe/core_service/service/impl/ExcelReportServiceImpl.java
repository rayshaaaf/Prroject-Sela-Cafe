package com.selacafe.core_service.service.impl;

import java.io.ByteArrayOutputStream;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.selacafe.core_service.client.OrderServiceClient;
import com.selacafe.core_service.payload.res.BestSellingMenuRes;
import com.selacafe.core_service.payload.res.DashboardAnalyticsRes;
import com.selacafe.core_service.payload.res.DashboardSummaryRes;
import com.selacafe.core_service.service.DashboardService;
import com.selacafe.core_service.service.ExcelReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExcelReportServiceImpl implements ExcelReportService {

    private final DashboardService dashboardService;
    private final OrderServiceClient orderServiceClient;

    @Override
    public ByteArrayOutputStream generateDailyReport() {

        try {

            DashboardSummaryRes summary =
                    dashboardService.getSummary();

            DashboardAnalyticsRes analytics =
                    orderServiceClient.getAnalytics();

            var bestSelling =
                    orderServiceClient.getBestSellingMenus();

            XSSFWorkbook workbook =
                    new XSSFWorkbook();

            // ======================
            // SHEET 1 SUMMARY
            // ======================

            XSSFSheet summarySheet =
                    workbook.createSheet("Summary");

            int rowNum = 0;

            Row row = summarySheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Metric");
            row.createCell(1).setCellValue("Value");

            row = summarySheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Revenue");
            row.createCell(1).setCellValue(analytics.getTotalRevenue());

            row = summarySheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Orders");
            row.createCell(1).setCellValue(analytics.getTotalOrders());

            row = summarySheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Completed Orders");
            row.createCell(1).setCellValue(analytics.getCompletedOrders());

            row = summarySheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Delivery Orders");
            row.createCell(1).setCellValue(analytics.getDeliveryOrders());

            row = summarySheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Dine In Orders");
            row.createCell(1).setCellValue(analytics.getDineInOrders());

            // ======================
            // SHEET 2 BUSINESS
            // ======================

            XSSFSheet businessSheet =
                    workbook.createSheet("Business Overview");

            rowNum = 0;

            row = businessSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Metric");
            row.createCell(1).setCellValue("Value");

            row = businessSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Users");
            row.createCell(1).setCellValue(summary.getTotalUsers());

            row = businessSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Active Users");
            row.createCell(1).setCellValue(summary.getActiveUsers());

            row = businessSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Inactive Users");
            row.createCell(1).setCellValue(summary.getInactiveUsers());

            row = businessSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Menus");
            row.createCell(1).setCellValue(summary.getTotalMenus());

            row = businessSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Categories");
            row.createCell(1).setCellValue(summary.getTotalCategories());

            row = businessSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Reviews");
            row.createCell(1).setCellValue(summary.getTotalReviews());

            row = businessSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Favorites");
            row.createCell(1).setCellValue(summary.getTotalFavorites());

            // ======================
            // SHEET 3 BEST SELLING
            // ======================

            XSSFSheet bestSellingSheet =
                    workbook.createSheet("Best Selling");

            rowNum = 0;

            row = bestSellingSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Rank");
            row.createCell(1).setCellValue("Menu");
            row.createCell(2).setCellValue("Total Sold");

            int rank = 1;

            for (BestSellingMenuRes menu : bestSelling) {

                row = bestSellingSheet.createRow(rowNum++);

                row.createCell(0).setCellValue(rank++);
                row.createCell(1).setCellValue(menu.getMenuName());
                row.createCell(2).setCellValue(menu.getTotalSold());
            }

            ByteArrayOutputStream out =
                    new ByteArrayOutputStream();

            workbook.write(out);

            workbook.close();

            return out;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate Excel report",
                    e);
        }
    }

    @Override
    public ByteArrayOutputStream generateWeeklyReport() {

        return generateDailyReport();
    }

    @Override
    public ByteArrayOutputStream generateMonthlyReport() {

        return generateDailyReport();
    }
}