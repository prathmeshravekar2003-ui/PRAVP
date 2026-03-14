package com.pravp.backend.exception;

public class BaseException extends RuntimeException {
    private final String message;
    private final int status;

    public BaseException(String message, int status) {
        super(message);
        this.message = message;
        this.status = status;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public int getStatus() {
        return status;
    }
}
