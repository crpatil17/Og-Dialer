package com.dialerapp;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Environment;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class CallRecordingModule extends ReactContextBaseJavaModule {
    private static final String CHANNEL_ID = "call_recording_channel";
    private static final int NOTIFICATION_ID = 1001;
    
    private MediaRecorder mediaRecorder;
    private String currentRecordingPath;
    private boolean isRecording = false;
    private NotificationManager notificationManager;

    public CallRecordingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        createNotificationChannel();
    }

    @Override
    public String getName() {
        return "CallRecording";
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Call Recording",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Notifications for call recording status");
            
            notificationManager = (NotificationManager) getReactApplicationContext()
                .getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @ReactMethod
    public void checkRecordingPermissions(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            boolean hasRecordAudio = ActivityCompat.checkSelfPermission(context, 
                Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
            boolean hasWriteStorage = ActivityCompat.checkSelfPermission(context, 
                Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
            boolean hasForegroundService = ActivityCompat.checkSelfPermission(context, 
                Manifest.permission.FOREGROUND_SERVICE) == PackageManager.PERMISSION_GRANTED;

            WritableMap permissions = Arguments.createMap();
            permissions.putBoolean("recordAudio", hasRecordAudio);
            permissions.putBoolean("writeStorage", hasWriteStorage);
            permissions.putBoolean("foregroundService", hasForegroundService);
            permissions.putBoolean("allGranted", hasRecordAudio && hasWriteStorage && hasForegroundService);
            
            promise.resolve(permissions);
        } catch (Exception e) {
            promise.reject("PERMISSION_CHECK_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void startRecording(ReadableMap options, Promise promise) {
        try {
            if (isRecording) {
                promise.reject("ALREADY_RECORDING", "Recording is already in progress");
                return;
            }

            // Check permissions
            Context context = getReactApplicationContext();
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) 
                != PackageManager.PERMISSION_GRANTED) {
                promise.reject("PERMISSION_DENIED", "Audio recording permission not granted");
                return;
            }

            // Create recording directory
            File recordingsDir = new File(context.getExternalFilesDir(Environment.DIRECTORY_MUSIC), "CallRecordings");
            if (!recordingsDir.exists()) {
                recordingsDir.mkdirs();
            }

            // Generate filename with timestamp
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
            String phoneNumber = options.hasKey("phoneNumber") ? options.getString("phoneNumber") : "unknown";
            String filename = String.format("call_%s_%s.3gp", phoneNumber.replaceAll("[^0-9+]", ""), timestamp);
            
            currentRecordingPath = new File(recordingsDir, filename).getAbsolutePath();

            // Initialize MediaRecorder
            mediaRecorder = new MediaRecorder();
            
            // Configure MediaRecorder with fallback options for different OEMs
            try {
                // Primary configuration (works on most devices)
                mediaRecorder.setAudioSource(MediaRecorder.AudioSource.VOICE_CALL);
            } catch (Exception e) {
                try {
                    // Fallback 1: Use MIC source
                    mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
                } catch (Exception e2) {
                    // Fallback 2: Use VOICE_COMMUNICATION
                    mediaRecorder.setAudioSource(MediaRecorder.AudioSource.VOICE_COMMUNICATION);
                }
            }
            
            mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
            mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);
            mediaRecorder.setOutputFile(currentRecordingPath);

            mediaRecorder.prepare();
            mediaRecorder.start();
            
            isRecording = true;
            showRecordingNotification(phoneNumber);

            WritableMap result = Arguments.createMap();
            result.putString("filePath", currentRecordingPath);
            result.putString("status", "started");
            result.putDouble("startTime", System.currentTimeMillis());
            
            promise.resolve(result);
            
        } catch (IOException e) {
            promise.reject("RECORDING_START_ERROR", "Failed to start recording: " + e.getMessage());
        } catch (Exception e) {
            promise.reject("RECORDING_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void stopRecording(Promise promise) {
        try {
            if (!isRecording || mediaRecorder == null) {
                promise.reject("NOT_RECORDING", "No recording in progress");
                return;
            }

            mediaRecorder.stop();
            mediaRecorder.release();
            mediaRecorder = null;
            isRecording = false;
            
            hideRecordingNotification();

            // Get file info
            File recordingFile = new File(currentRecordingPath);
            
            WritableMap result = Arguments.createMap();
            result.putString("filePath", currentRecordingPath);
            result.putString("status", "stopped");
            result.putDouble("endTime", System.currentTimeMillis());
            result.putDouble("fileSize", recordingFile.length());
            result.putBoolean("fileExists", recordingFile.exists());
            
            promise.resolve(result);
            
        } catch (Exception e) {
            promise.reject("RECORDING_STOP_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getRecordingStatus(Promise promise) {
        try {
            WritableMap status = Arguments.createMap();
            status.putBoolean("isRecording", isRecording);
            status.putString("currentFile", isRecording ? currentRecordingPath : null);
            promise.resolve(status);
        } catch (Exception e) {
            promise.reject("STATUS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getAllRecordings(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            File recordingsDir = new File(context.getExternalFilesDir(Environment.DIRECTORY_MUSIC), "CallRecordings");
            
            WritableArray recordings = Arguments.createArray();
            
            if (recordingsDir.exists()) {
                File[] files = recordingsDir.listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (file.isFile() && file.getName().endsWith(".3gp")) {
                            WritableMap recording = Arguments.createMap();
                            recording.putString("fileName", file.getName());
                            recording.putString("filePath", file.getAbsolutePath());
                            recording.putDouble("fileSize", file.length());
                            recording.putDouble("lastModified", file.lastModified());
                            recordings.pushMap(recording);
                        }
                    }
                }
            }
            
            promise.resolve(recordings);
        } catch (Exception e) {
            promise.reject("GET_RECORDINGS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void deleteRecording(String filePath, Promise promise) {
        try {
            File file = new File(filePath);
            boolean deleted = file.delete();
            promise.resolve(deleted);
        } catch (Exception e) {
            promise.reject("DELETE_ERROR", e.getMessage());
        }
    }

    private void showRecordingNotification(String phoneNumber) {
        Intent intent = new Intent(getReactApplicationContext(), MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            getReactApplicationContext(), 0, intent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(getReactApplicationContext(), CHANNEL_ID)
            .setContentTitle("Recording Call")
            .setContentText("Call with " + phoneNumber + " is being recorded")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();

        if (notificationManager != null) {
            notificationManager.notify(NOTIFICATION_ID, notification);
        }
    }

    private void hideRecordingNotification() {
        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }
    }
}
