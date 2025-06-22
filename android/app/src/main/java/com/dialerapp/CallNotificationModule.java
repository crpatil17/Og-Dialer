package com.dialerapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class CallNotificationModule extends ReactContextBaseJavaModule {
    private static final String INCOMING_CALL_CHANNEL = "incoming_calls";
    private static final String ONGOING_CALL_CHANNEL = "ongoing_calls";
    private static final int INCOMING_CALL_NOTIFICATION_ID = 2001;
    private static final int ONGOING_CALL_NOTIFICATION_ID = 2002;
    
    private NotificationManager notificationManager;
    private Vibrator vibrator;

    public CallNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        createNotificationChannels();
        vibrator = (Vibrator) reactContext.getSystemService(Context.VIBRATOR_SERVICE);
    }

    @Override
    public String getName() {
        return "CallNotification";
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            notificationManager = (NotificationManager) getReactApplicationContext()
                .getSystemService(Context.NOTIFICATION_SERVICE);

            // Incoming call channel - high priority with sound and vibration
            NotificationChannel incomingChannel = new NotificationChannel(
                INCOMING_CALL_CHANNEL,
                "Incoming Calls",
                NotificationManager.IMPORTANCE_HIGH
            );
            incomingChannel.setDescription("Notifications for incoming calls");
            incomingChannel.enableVibration(true);
            incomingChannel.setVibrationPattern(new long[]{0, 1000, 500, 1000});
            
            Uri ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .build();
            incomingChannel.setSound(ringtoneUri, audioAttributes);
            
            // Ongoing call channel - low priority, no sound
            NotificationChannel ongoingChannel = new NotificationChannel(
                ONGOING_CALL_CHANNEL,
                "Ongoing Calls",
                NotificationManager.IMPORTANCE_LOW
            );
            ongoingChannel.setDescription("Notifications for ongoing calls");
            ongoingChannel.setSound(null, null);
            
            notificationManager.createNotificationChannel(incomingChannel);
            notificationManager.createNotificationChannel(ongoingChannel);
        }
    }

    @ReactMethod
    public void showIncomingCallNotification(ReadableMap callData, Promise promise) {
        try {
            String phoneNumber = callData.getString("phoneNumber");
            String contactName = callData.hasKey("contactName") ? callData.getString("contactName") : phoneNumber;
            boolean isSpam = callData.hasKey("isSpam") && callData.getBoolean("isSpam");
            String spamCategory = callData.hasKey("spamCategory") ? callData.getString("spamCategory") : null;

            // Create answer intent
            Intent answerIntent = new Intent(getReactApplicationContext(), MainActivity.class);
            answerIntent.setAction("ANSWER_CALL");
            answerIntent.putExtra("phoneNumber", phoneNumber);
            answerIntent.putExtra("contactName", contactName);
            PendingIntent answerPendingIntent = PendingIntent.getActivity(
                getReactApplicationContext(), 0, answerIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            // Create decline intent
            Intent declineIntent = new Intent(getReactApplicationContext(), MainActivity.class);
            declineIntent.setAction("DECLINE_CALL");
            declineIntent.putExtra("phoneNumber", phoneNumber);
            PendingIntent declinePendingIntent = PendingIntent.getActivity(
                getReactApplicationContext(), 1, declineIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            // Build notification
            NotificationCompat.Builder builder = new NotificationCompat.Builder(getReactApplicationContext(), INCOMING_CALL_CHANNEL)
                .setContentTitle(isSpam ? "⚠️ " + spamCategory : "Incoming Call")
                .setContentText(contactName)
                .setSubText(phoneNumber)
                .setSmallIcon(android.R.drawable.ic_menu_call)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setFullScreenIntent(answerPendingIntent, true)
                .setOngoing(true)
                .setAutoCancel(false)
                .addAction(android.R.drawable.ic_menu_call, "Answer", answerPendingIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Decline", declinePendingIntent);

            if (isSpam) {
                builder.setColor(0xFFFF5722); // Orange color for spam
                builder.setContentTitle("⚠️ Potential Spam Call");
                builder.setStyle(new NotificationCompat.BigTextStyle()
                    .bigText("Potential " + spamCategory + " from " + phoneNumber + "\n\nThis number has been reported as spam."));
            }

            Notification notification = builder.build();
            
            if (notificationManager != null) {
                notificationManager.notify(INCOMING_CALL_NOTIFICATION_ID, notification);
            }

            // Start vibration pattern
            startCallVibration();

            promise.resolve(true);
            
        } catch (Exception e) {
            promise.reject("NOTIFICATION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void showOngoingCallNotification(ReadableMap callData, Promise promise) {
        try {
            String phoneNumber = callData.getString("phoneNumber");
            String contactName = callData.hasKey("contactName") ? callData.getString("contactName") : phoneNumber;
            String duration = callData.hasKey("duration") ? callData.getString("duration") : "00:00";
            boolean isRecording = callData.hasKey("isRecording") && callData.getBoolean("isRecording");

            // Create return to call intent
            Intent returnIntent = new Intent(getReactApplicationContext(), MainActivity.class);
            returnIntent.setAction("RETURN_TO_CALL");
            PendingIntent returnPendingIntent = PendingIntent.getActivity(
                getReactApplicationContext(), 0, returnIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            // Create end call intent
            Intent endCallIntent = new Intent(getReactApplicationContext(), MainActivity.class);
            endCallIntent.setAction("END_CALL");
            PendingIntent endCallPendingIntent = PendingIntent.getActivity(
                getReactApplicationContext(), 2, endCallIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            String title = "Ongoing Call" + (isRecording ? " • Recording" : "");
            String content = contactName + " • " + duration;

            Notification notification = new NotificationCompat.Builder(getReactApplicationContext(), ONGOING_CALL_CHANNEL)
                .setContentTitle(title)
                .setContentText(content)
                .setSubText(phoneNumber)
                .setSmallIcon(android.R.drawable.ic_menu_call)
                .setContentIntent(returnPendingIntent)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .setAutoCancel(false)
                .addAction(android.R.drawable.ic_menu_revert, "Return", returnPendingIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "End Call", endCallPendingIntent)
                .build();

            if (notificationManager != null) {
                notificationManager.notify(ONGOING_CALL_NOTIFICATION_ID, notification);
            }

            promise.resolve(true);
            
        } catch (Exception e) {
            promise.reject("NOTIFICATION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void hideIncomingCallNotification(Promise promise) {
        try {
            if (notificationManager != null) {
                notificationManager.cancel(INCOMING_CALL_NOTIFICATION_ID);
            }
            stopCallVibration();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("HIDE_NOTIFICATION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void hideOngoingCallNotification(Promise promise) {
        try {
            if (notificationManager != null) {
                notificationManager.cancel(ONGOING_CALL_NOTIFICATION_ID);
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("HIDE_NOTIFICATION_ERROR", e.getMessage());
        }
    }

    private void startCallVibration() {
        if (vibrator != null && vibrator.hasVibrator()) {
            long[] pattern = {0, 1000, 500, 1000, 500, 1000}; // Vibrate pattern
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                VibrationEffect effect = VibrationEffect.createWaveform(pattern, 0); // Repeat
                vibrator.vibrate(effect);
            } else {
                vibrator.vibrate(pattern, 0); // Repeat
            }
        }
    }

    private void stopCallVibration() {
        if (vibrator != null) {
            vibrator.cancel();
        }
    }
}
