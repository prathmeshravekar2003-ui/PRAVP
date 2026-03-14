package com.pravp.backend.service;

import com.pravp.backend.dto.StudentResultExportDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    public byte[] exportExamResults(String examTitle, List<StudentResultExportDTO> results) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Exam Results");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Student Name");
            headerRow.createCell(1).setCellValue("Email");
            headerRow.createCell(2).setCellValue("Score");
            headerRow.createCell(3).setCellValue("Total Marks");
            headerRow.createCell(4).setCellValue("Percentage");

            for (int i = 0; i < 5; i++) {
                headerRow.getCell(i).setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 1;
            for (StudentResultExportDTO result : results) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(result.getStudentName());
                row.createCell(1).setCellValue(result.getStudentId());
                row.createCell(2).setCellValue(result.getScore());
                row.createCell(3).setCellValue(result.getTotalMarks());
                row.createCell(4).setCellValue(result.getPercentage() + "%");
            }

            // Auto-size columns
            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
