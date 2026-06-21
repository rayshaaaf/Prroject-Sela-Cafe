package com.selacafe.core_service.service.impl;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.selacafe.core_service.client.OrderServiceClient;
import com.selacafe.core_service.payload.res.BestSellingMenuRes;
import com.selacafe.core_service.payload.res.DashboardAnalyticsRes;
import com.selacafe.core_service.payload.res.DashboardSummaryRes;
import com.selacafe.core_service.service.DashboardService;
import com.selacafe.core_service.service.PdfReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PdfReportServiceImpl implements PdfReportService {

    private final DashboardService dashboardService;
    private final OrderServiceClient orderServiceClient;

    @Override
    public ByteArrayOutputStream generateDailyReport() {

        try {

            DashboardSummaryRes summary =
                    dashboardService.getSummary();

            DashboardAnalyticsRes analytics =
                    orderServiceClient.getAnalytics();

            List<BestSellingMenuRes> bestSelling =
                    orderServiceClient.getBestSellingMenus();

            ByteArrayOutputStream out =
                    new ByteArrayOutputStream();

            Document document =
                    new Document(PageSize.A4);

            PdfWriter.getInstance(
                    document,
                    out);

            document.open();

            Font titleFont =
                    new Font(
                            Font.HELVETICA,
                            20,
                            Font.BOLD);

            Font sectionFont =
                    new Font(
                            Font.HELVETICA,
                            14,
                            Font.BOLD);

            Paragraph title =
                    new Paragraph(
                            "SELA CAFE DAILY BUSINESS REPORT",
                            titleFont);

            title.setAlignment(
                    Element.ALIGN_CENTER);

            document.add(title);

            document.add(
                    new Paragraph(
                            "Generated Date : "
                                    + LocalDate.now()));

            document.add(
                    new Paragraph(
                            " "));

            document.add(
                    new Paragraph(
                            "EXECUTIVE SUMMARY",
                            sectionFont));

            document.add(
                    new Paragraph(
                            "Total Revenue : Rp "
                                    + analytics.getTotalRevenue()));

            document.add(
                    new Paragraph(
                            "Total Orders : "
                                    + analytics.getTotalOrders()));

            document.add(
                    new Paragraph(
                            "Completed Orders : "
                                    + analytics.getCompletedOrders()));

            document.add(
                    new Paragraph(
                            "Dine In Orders : "
                                    + analytics.getDineInOrders()));

            document.add(
                    new Paragraph(
                            "Delivery Orders : "
                                    + analytics.getDeliveryOrders()));

            document.add(
                    new Paragraph(
                            " "));

            document.add(
                    new Paragraph(
                            "BUSINESS OVERVIEW",
                            sectionFont));

            document.add(
                    new Paragraph(
                            "Total Users : "
                                    + summary.getTotalUsers()));

            document.add(
                    new Paragraph(
                            "Active Users : "
                                    + summary.getActiveUsers()));

            document.add(
                    new Paragraph(
                            "Inactive Users : "
                                    + summary.getInactiveUsers()));

            document.add(
                    new Paragraph(
                            "Total Menus : "
                                    + summary.getTotalMenus()));

            document.add(
                    new Paragraph(
                            "Total Categories : "
                                    + summary.getTotalCategories()));

            document.add(
                    new Paragraph(
                            "Total Reviews : "
                                    + summary.getTotalReviews()));

            document.add(
                    new Paragraph(
                            "Total Favorites : "
                                    + summary.getTotalFavorites()));

            document.add(
                    new Paragraph(
                            " "));

            document.add(
                    new Paragraph(
                            "TOP SELLING MENUS",
                            sectionFont));

            PdfPTable table =
                    new PdfPTable(3);

            table.setWidthPercentage(100);

            table.addCell("Rank");
            table.addCell("Menu");
            table.addCell("Sold");

            int rank = 1;

            for (BestSellingMenuRes menu : bestSelling) {

                table.addCell(
                        String.valueOf(rank++));

                table.addCell(
                        menu.getMenuName());

                table.addCell(
                        String.valueOf(
                                menu.getTotalSold()));
            }

            document.add(table);

            document.add(
                    new Paragraph(
                            " "));

            document.add(
                    new Paragraph(
                            "MANAGEMENT INSIGHT",
                            sectionFont));

            double completionRate =
                    analytics.getTotalOrders() == 0
                            ? 0
                            : ((double) analytics.getCompletedOrders()
                                    / analytics.getTotalOrders())
                                    * 100;

            document.add(
                    new Paragraph(
                            "Completion Rate : "
                                    + String.format(
                                            "%.2f",
                                            completionRate)
                                    + "%"));

            if (!bestSelling.isEmpty()) {

                document.add(
                        new Paragraph(
                                "Best Selling Product : "
                                        + bestSelling
                                                .get(0)
                                                .getMenuName()));
            }

            document.add(
                    new Paragraph(
                            "Revenue Performance : Rp "
                                    + analytics.getTotalRevenue()));

            document.add(
                    new Paragraph(
                            " "));

            document.add(
                    new Paragraph(
                            "Generated Automatically by Sela Cafe Management System"));

            document.close();

            return out;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate PDF report",
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