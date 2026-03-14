package com.pravp.backend.utils;

public class AppConstants {
    public static final String API_V1 = "/api/v1";
    public static final String AUTH_BASE = API_V1 + "/auth";

    public static final String SUCCESS_MESSAGE = "Operation successful";
    public static final String ERROR_MESSAGE = "An error occurred";
    public static final String UNAUTHORIZED_MESSAGE = "You are not authorized to access this resource";

    public static final long JWT_TOKEN_VALIDITY = 24 * 60 * 60; // 24 hours
}
