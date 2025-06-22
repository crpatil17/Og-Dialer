package com.dialerapp;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.telephony.PhoneNumberUtils;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;

import java.util.HashMap;
import java.util.Map;

public class CallerIdentificationModule extends ReactContextBaseJavaModule {
    
    // Demo spam database - in production, this would be a real database or API
    private static final Map<String, SpamInfo> SPAM_DATABASE = new HashMap<>();
    
    static {
        // Demo spam numbers
        SPAM_DATABASE.put("+1234567890", new SpamInfo("Telemarketer", "high", 150, "Sales calls"));
        SPAM_DATABASE.put("+1987654321", new SpamInfo("Scam", "critical", 300, "Fake IRS calls"));
        SPAM_DATABASE.put("+1555123456", new SpamInfo("Robocall", "medium", 75, "Automated messages"));
    }
    
    private static class SpamInfo {
        String category;
        String riskLevel;
        int reportCount;
        String description;
        
        SpamInfo(String category, String riskLevel, int reportCount, String description) {
            this.category = category;
            this.riskLevel = riskLevel;
            this.reportCount = reportCount;
            this.description = description;
        }
    }

    public CallerIdentificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CallerIdentification";
    }

    @ReactMethod
    public void identifyCaller(String phoneNumber, Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            
            // First, check local contacts
            String contactName = getContactName(phoneNumber);
            if (contactName != null) {
                result.putString("name", contactName);
                result.putString("source", "contacts");
                result.putString("type", "contact");
                result.putBoolean("isSpam", false);
                promise.resolve(result);
                return;
            }
            
            // Check spam database
            SpamInfo spamInfo = SPAM_DATABASE.get(phoneNumber);
            if (spamInfo != null) {
                result.putString("name", spamInfo.category);
                result.putString("source", "spam_database");
                result.putString("type", "spam");
                result.putBoolean("isSpam", true);
                result.putString("spamCategory", spamInfo.category);
                result.putString("riskLevel", spamInfo.riskLevel);
                result.putInt("reportCount", spamInfo.reportCount);
                result.putString("description", spamInfo.description);
                promise.resolve(result);
                return;
            }
            
            // Try to identify from phone number patterns
            String identifiedInfo = identifyFromPattern(phoneNumber);
            if (identifiedInfo != null) {
                result.putString("name", identifiedInfo);
                result.putString("source", "pattern_analysis");
                result.putString("type", "business");
                result.putBoolean("isSpam", false);
                promise.resolve(result);
                return;
            }
            
            // Unknown number
            result.putString("name", "Unknown");
            result.putString("source", "unknown");
            result.putString("type", "unknown");
            result.putBoolean("isSpam", false);
            promise.resolve(result);
            
        } catch (Exception e) {
            promise.reject("IDENTIFICATION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void reportSpam(String phoneNumber, ReadableMap reportData, Promise promise) {
        try {
            // In production, this would report to a real spam database
            String category = reportData.hasKey("category") ? reportData.getString("category") : "spam";
            String description = reportData.hasKey("description") ? reportData.getString("description") : "";
            
            // Add to local spam database for demo
            SPAM_DATABASE.put(phoneNumber, new SpamInfo(category, "medium", 1, description));
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Spam report submitted successfully");
            promise.resolve(result);
            
        } catch (Exception e) {
            promise.reject("REPORT_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getSpamStatistics(Promise promise) {
        try {
            WritableMap stats = Arguments.createMap();
            stats.putInt("totalSpamNumbers", SPAM_DATABASE.size());
            stats.putInt("highRiskNumbers", (int) SPAM_DATABASE.values().stream()
                .filter(info -> "high".equals(info.riskLevel) || "critical".equals(info.riskLevel))
                .count());
            promise.resolve(stats);
        } catch (Exception e) {
            promise.reject("STATS_ERROR", e.getMessage());
        }
    }

    private String getContactName(String phoneNumber) {
        try {
            Context context = getReactApplicationContext();
            Uri uri = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, 
                Uri.encode(phoneNumber));
            
            String[] projection = { ContactsContract.PhoneLookup.DISPLAY_NAME };
            
            Cursor cursor = context.getContentResolver().query(uri, projection, null, null, null);
            
            if (cursor != null) {
                if (cursor.moveToFirst()) {
                    String name = cursor.getString(0);
                    cursor.close();
                    return name;
                }
                cursor.close();
            }
        } catch (Exception e) {
            // Handle exception
        }
        return null;
    }

    private String identifyFromPattern(String phoneNumber) {
        // Simple pattern matching for demo
        if (phoneNumber.startsWith("+1800") || phoneNumber.startsWith("+1888") || 
            phoneNumber.startsWith("+1877") || phoneNumber.startsWith("+1866")) {
            return "Toll-free number";
        }
        
        if (phoneNumber.startsWith("+1900")) {
            return "Premium rate number";
        }
        
        // Could add more sophisticated pattern matching
        return null;
    }
}
