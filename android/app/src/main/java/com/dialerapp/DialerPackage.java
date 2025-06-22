package com.dialerapp;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DialerPackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new PermissionManagerModule(reactContext));
        modules.add(new CallManagerModule(reactContext));
        modules.add(new ContactManagerModule(reactContext));
        modules.add(new CallLogManagerModule(reactContext));
        modules.add(new CallRecordingModule(reactContext));
        modules.add(new CallerIdentificationModule(reactContext));
        modules.add(new CallNotificationModule(reactContext));
        modules.add(new SimManagerModule(reactContext));
        return modules;
    }
}
