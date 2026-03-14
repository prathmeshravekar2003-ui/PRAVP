package com.pravp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResultExportDTO {
    private String studentId;
    private String studentName;
    private Integer score;
    private Integer totalMarks;
    private Double percentage;
}
