package com.safran.kpi_qrqc.controllers;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ChatParser {

    public static String extractPilote(String msg) {
        Pattern pattern = Pattern.compile("pilote\\s+(\\w+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(msg);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    public static String extractKpi(String msg) {
        Pattern pattern = Pattern.compile("(qualité|production|performance|efficacité|kpi)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(msg);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    public static LocalDate extractDate(String msg) {
        if (msg.contains("aujourd'hui") || msg.contains("today")) {
            return LocalDate.now();
        }
        Pattern datePattern = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
        Matcher matcher = datePattern.matcher(msg);
        if (matcher.find()) {
            try {
                return LocalDate.parse(matcher.group(), DateTimeFormatter.ISO_DATE);
            } catch (Exception ignored) {}
        }
        return null;
    }
}
