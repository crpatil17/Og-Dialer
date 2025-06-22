package com.dialerapp;

import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class PermissionManagerModule extends ReactContextBaseJavaModule {
    private static final String[] REQUIRED_PERMISSIONS = {
        Manifest.permission.CALL_PHONE,
        Manifest.permission.READ_CONTACTS,
        Manifest.permission.WRITE_CONTACTS,
        Manifest.permission.READ_CALL_LOG,
        Manifest.permission.WRITE_CALL_LOG,
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.PROCESS_OUTGOING_CALLS
    };

    public PermissionManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PermissionManager";
    }

    @ReactMethod
    public void requestAllPermissions(Promise promise) {
        try {
            boolean allGranted = true;
            for (String permission : REQUIRED_PERMISSIONS) {
                if (ContextCompat.checkSelfPermission(getCurrentActivity(), permission) 
                    != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }

            if (!allGranted) {
                ActivityCompat.requestPermissions(
                    getCurrentActivity(),
                    REQUIRED_PERMISSIONS,
                    1001
                );
            }

            promise.resolve(allGranted);
        } catch (Exception e) {
            promise.reject("PERMISSION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void checkPermissions(Promise promise) {
        try {
            WritableMap permissions = Arguments.createMap();
            for (String permission : REQUIRED_PERMISSIONS) {
                boolean granted = ContextCompat.checkSelfPermission(
                    getCurrentActivity(), permission) == PackageManager.PERMISSION_GRANTED;
                permissions.putBoolean(permission, granted);
            }
            promise.resolve(permissions);
        } catch (Exception e) {
            promise.reject("PERMISSION_CHECK_ERROR", e.getMessage());
        }
    }
}
