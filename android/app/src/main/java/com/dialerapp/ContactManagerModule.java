package com.dialerapp;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class ContactManagerModule extends ReactContextBaseJavaModule {
    
    public ContactManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ContactManager";
    }

    @ReactMethod
    public void getAllContacts(Promise promise) {
        try {
            ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
            WritableArray contacts = Arguments.createArray();

            String[] projection = {
                ContactsContract.CommonDataKinds.Phone.CONTACT_ID,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Phone.NUMBER,
                ContactsContract.CommonDataKinds.Phone.TYPE
            };

            Cursor cursor = contentResolver.query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                projection,
                null,
                null,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " ASC"
            );

            if (cursor != null) {
                while (cursor.moveToNext()) {
                    WritableMap contact = Arguments.createMap();
                    contact.putString("id", cursor.getString(0));
                    contact.putString("name", cursor.getString(1));
                    contact.putString("phoneNumber", cursor.getString(2));
                    contact.putInt("type", cursor.getInt(3));
                    contacts.pushMap(contact);
                }
                cursor.close();
            }

            promise.resolve(contacts);
        } catch (Exception e) {
            promise.reject("CONTACTS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void addContact(ReadableMap contactData, Promise promise) {
        try {
            ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
            
            ContentValues values = new ContentValues();
            values.put(ContactsContract.RawContacts.ACCOUNT_TYPE, (String) null);
            values.put(ContactsContract.RawContacts.ACCOUNT_NAME, (String) null);
            
            Uri rawContactUri = contentResolver.insert(ContactsContract.RawContacts.CONTENT_URI, values);
            long rawContactId = Long.parseLong(rawContactUri.getLastPathSegment());

            // Add name
            values.clear();
            values.put(ContactsContract.Data.RAW_CONTACT_ID, rawContactId);
            values.put(ContactsContract.Data.MIMETYPE, ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE);
            values.put(ContactsContract.CommonDataKinds.StructuredName.DISPLAY_NAME, contactData.getString("name"));
            contentResolver.insert(ContactsContract.Data.CONTENT_URI, values);

            // Add phone number
            values.clear();
            values.put(ContactsContract.Data.RAW_CONTACT_ID, rawContactId);
            values.put(ContactsContract.Data.MIMETYPE, ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE);
            values.put(ContactsContract.CommonDataKinds.Phone.NUMBER, contactData.getString("phoneNumber"));
            values.put(ContactsContract.CommonDataKinds.Phone.TYPE, ContactsContract.CommonDataKinds.Phone.TYPE_MOBILE);
            contentResolver.insert(ContactsContract.Data.CONTENT_URI, values);

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ADD_CONTACT_ERROR", e.getMessage());
        }
    }
}
