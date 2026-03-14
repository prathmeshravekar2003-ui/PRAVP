package com.pravp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringStatsDTO {
    private long totalUsers;
    private long activeSessions;
    private long totalSuspiciousAlerts;
    private double suspiciousRate;
}
