package com.dialerapp;

import android.content.Context;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.telephony.TelephonyManager;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.util.List;

public class SimManagerModule extends ReactContextBaseJavaModule {
    
    public SimManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SimManager";
    }

    @ReactMethod
    public void getAvailableSimCards(Promise promise) {
        try {
            if (ActivityCompat.checkSelfPermission(getReactApplicationContext(), 
                Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                promise.reject("PERMISSION_DENIED", "READ_PHONE_STATE permission not granted");
                return;
            }

            SubscriptionManager subscriptionManager = (SubscriptionManager) 
                getReactApplicationContext().getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
            
            if (subscriptionManager == null) {
                promise.reject("SUBSCRIPTION_MANAGER_NULL", "SubscriptionManager not available");
                return;
            }

            List<SubscriptionInfo> subscriptionInfos = subscriptionManager.getActiveSubscriptionInfoList();
            WritableArray simCards = Arguments.createArray();

            if (subscriptionInfos != null) {
                for (SubscriptionInfo info : subscriptionInfos) {
                    WritableMap simCard = Arguments.createMap();
                    simCard.putInt("subscriptionId", info.getSubscriptionId());
                    simCard.putInt("simSlotIndex", info.getSimSlotIndex());
                    simCard.putString("displayName", info.getDisplayName().toString());
                    simCard.putString("carrierName", info.getCarrierName().toString());
                    simCard.putString("number", info.getNumber());
                    simCard.putString("countryIso", info.getCountryIso());
                    simCards.pushMap(simCard);
                }
            }

            promise.resolve(simCards);
        } catch (Exception e) {
            promise.reject("SIM_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getDefaultSimForCalls(Promise promise) {
        try {
            if (ActivityCompat.checkSelfPermission(getReactApplicationContext(), 
                Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                promise.reject("PERMISSION_DENIED", "READ_PHONE_STATE permission not granted");
                return;
            }

            SubscriptionManager subscriptionManager = (SubscriptionManager) 
                getReactApplicationContext().getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
            
            if (subscriptionManager == null) {
                promise.reject("SUBSCRIPTION_MANAGER_NULL", "SubscriptionManager not available");
                return;
            }

            int defaultSubId = subscriptionManager.getDefaultVoiceSubscriptionId();
            promise.resolve(defaultSubId);
        } catch (Exception e) {
            promise.reject("SIM_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isDualSimDevice(Promise promise) {
        try {
            TelephonyManager telephonyManager = (TelephonyManager) 
                getReactApplicationContext().getSystemService(Context.TELEPHONY_SERVICE);
            
            if (telephonyManager == null) {
                promise.resolve(false);
                return;
            }

            // Check if device supports dual SIM
            int phoneCount = telephonyManager.getPhoneCount();
            promise.resolve(phoneCount > 1);
        } catch (Exception e) {
            promise.reject("SIM_ERROR", e.getMessage());
        }
    }
}
