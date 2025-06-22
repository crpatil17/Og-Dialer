package com.dialerapp;

import android.content.ContentResolver;
import android.database.Cursor;
import android.provider.CallLog;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class CallLogManagerModule extends ReactContextBaseJavaModule {
    
    public CallLogManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CallLogManager";
    }

    @ReactMethod
    public void getCallLog(Promise promise) {
        try {
            ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
            WritableArray callLogs = Arguments.createArray();

            String[] projection = {
                CallLog.Calls._ID,
                CallLog.Calls.NUMBER,
                CallLog.Calls.CACHED_NAME,
                CallLog.Calls.TYPE,
                CallLog.Calls.DATE,
                CallLog.Calls.DURATION
            };

            Cursor cursor = contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                projection,
                null,
                null,
                CallLog.Calls.DATE + " DESC"
            );

            if (cursor != null) {
                while (cursor.moveToNext()) {
                    WritableMap callLog = Arguments.createMap();
                    callLog.putString("id", cursor.getString(0));
                    callLog.putString("number", cursor.getString(1));
                    callLog.putString("name", cursor.getString(2));
                    callLog.putInt("type", cursor.getInt(3));
                    callLog.putString("date", cursor.getString(4));
                    callLog.putString("duration", cursor.getString(5));
                    callLogs.pushMap(callLog);
                }
                cursor.close();
            }

            promise.resolve(callLogs);
        } catch (Exception e) {
            promise.reject("CALL_LOG_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void deleteCallLogEntry(String callId, Promise promise) {
        try {
            ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
            int deleted = contentResolver.delete(
                CallLog.Calls.CONTENT_URI,
                CallLog.Calls._ID + "=?",
                new String[]{callId}
            );
            promise.resolve(deleted > 0);
        } catch (Exception e) {
            promise.reject("DELETE_CALL_LOG_ERROR", e.getMessage());
        }
    }
}
