package com.dialerapp;

import android.content.Intent;
import android.net.Uri;
import android.telecom.TelecomManager;
import android.content.Context;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CallManagerModule extends ReactContextBaseJavaModule {
    
    public CallManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CallManager";
    }

    @ReactMethod
    public void makeCall(String phoneNumber, Promise promise) {
        try {
            Intent callIntent = new Intent(Intent.ACTION_CALL);
            callIntent.setData(Uri.parse("tel:" + phoneNumber));
            callIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            
            if (getCurrentActivity() != null) {
                getCurrentActivity().startActivity(callIntent);
                promise.resolve(true);
            } else {
                promise.reject("NO_ACTIVITY", "No current activity available");
            }
        } catch (Exception e) {
            promise.reject("CALL_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void endCall(Promise promise) {
        try {
            TelecomManager telecomManager = (TelecomManager) 
                getReactApplicationContext().getSystemService(Context.TELECOM_SERVICE);
            
            if (telecomManager != null) {
                telecomManager.endCall();
                promise.resolve(true);
            } else {
                promise.reject("TELECOM_ERROR", "TelecomManager not available");
            }
        } catch (Exception e) {
            promise.reject("END_CALL_ERROR", e.getMessage());
        }
    }
}
