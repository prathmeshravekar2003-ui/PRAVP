package com.pravp.backend.service;

import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class CExecutionService {

    private static final long TIMEOUT_SECONDS = 5;

    public String runCCode(String code, String input) throws IOException, InterruptedException {
        String uuid = UUID.randomUUID().toString();
        Path tempDir = Files.createTempDirectory("c_exec_" + uuid);
        Path sourceFile = tempDir.resolve("solution.c");
        Files.writeString(sourceFile, code);

        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
        String executableName = isWindows ? "solution.exe" : "./solution";
        Path executablePath = tempDir.resolve(isWindows ? "solution.exe" : "solution");

        try {
            // Compilation
            ProcessBuilder compilePb = new ProcessBuilder("gcc", "solution.c", "-o", isWindows ? "solution.exe" : "solution");
            compilePb.directory(tempDir.toFile());
            Process compileProcess = compilePb.start();
            boolean compileCompleted = compileProcess.waitFor(10, TimeUnit.SECONDS);

            if (!compileCompleted || compileProcess.exitValue() != 0) {
                String error = readStream(compileProcess.getErrorStream());
                return "COMPILATION_ERROR: " + error;
            }

            // Execution
            ProcessBuilder runPb = new ProcessBuilder(isWindows ? executablePath.toString() : "./solution");
            runPb.directory(tempDir.toFile());
            Process runProcess = runPb.start();

            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                    writer.write(input);
                    writer.flush();
                }
            }

            boolean runCompleted = runProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!runCompleted) {
                runProcess.destroyForcibly();
                return "RUNTIME_ERROR: Timeout exceeded (5s)";
            }

            if (runProcess.exitValue() != 0) {
                String error = readStream(runProcess.getErrorStream());
                return "RUNTIME_ERROR: Exit code " + runProcess.exitValue() + "\n" + error;
            }

            return readStream(runProcess.getInputStream());

        } finally {
            // Cleanup
            deleteDirectory(tempDir.toFile());
        }
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString().trim();
    }

    private void deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directoryToBeDeleted.delete();
    }
}
