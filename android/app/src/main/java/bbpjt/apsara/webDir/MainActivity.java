package bbpjt.apsara.webDir;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "ApsaraAudio";
    private static final int REQUEST_PERMISSIONS = 100;

    // ====== Semua izin yang dibutuhkan ======
    private static final String[] REQUIRED_PERMISSIONS = {
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.CAMERA,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Minta semua izin saat aplikasi pertama kali dibuka
        if (!hasAllPermissions()) {
            requestAllPermissions();
        }

        // Setup audio routing untuk mikrofon eksternal
        setupAudioRouting();
    }

    // =========================================================
    //  AUDIO ROUTING — Kunci agar mikrofon eksternal terdeteksi
    // =========================================================
    private void setupAudioRouting() {
        AudioManager audioManager = (AudioManager)
            getSystemService(Context.AUDIO_SERVICE);

        if (audioManager == null) {
            Log.e(TAG, "AudioManager tidak tersedia");
            return;
        }

        // List semua device audio input yang tersedia
        AudioDeviceInfo[] devices = audioManager.getDevices(
            AudioManager.GET_DEVICES_INPUTS);

        Log.d(TAG, "===== AUDIO INPUT DEVICES =====");
        AudioDeviceInfo externalMic = null;

        for (AudioDeviceInfo device : devices) {
            String type = getDeviceTypeName(device.getType());
            Log.d(TAG, "Device: " + type
                + " | ID: " + device.getId()
                + " | Product: " + device.getProductName());

            // Deteksi mikrofon eksternal (USB, Bluetooth, Wired)
            int devType = device.getType();
            if (devType == AudioDeviceInfo.TYPE_USB_HEADSET
                || devType == AudioDeviceInfo.TYPE_USB_DEVICE
                || devType == AudioDeviceInfo.TYPE_USB_ACCESSORY
                || devType == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
                || devType == AudioDeviceInfo.TYPE_WIRED_HEADSET
                || devType == AudioDeviceInfo.TYPE_WIRED_HEADPHONES) {

                externalMic = device;
                Log.d(TAG, ">>> Mikrofon eksternal terdeteksi: "
                    + type + " (ID: " + device.getId() + ")");
            }
        }

        // Set mode audio sesuai ketersediaan mikrofon eksternal
        if (externalMic != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                audioManager.setAllowedCapturePolicy(
                    AudioAttributes.ALLOW_CAPTURE_BY_ALL);
            }

            // MODE_IN_COMMUNICATION lebih sensitif ke mikrofon eksternal
            audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
            audioManager.setSpeakerphoneOn(false);

            Log.d(TAG, "Audio mode: MODE_IN_COMMUNICATION");
            Log.d(TAG, "Mikrofon eksternal diaktifkan");
        } else {
            audioManager.setMode(AudioManager.MODE_NORMAL);
            Log.d(TAG, "Mikrofon eksternal TIDAK terdeteksi, "
                + "menggunakan mikrofon bawaan");
        }

        // Log output devices untuk debugging
        Log.d(TAG, "===== AUDIO OUTPUT DEVICES =====");
        AudioDeviceInfo[] outputs = audioManager.getDevices(
            AudioManager.GET_DEVICES_OUTPUTS);
        for (AudioDeviceInfo device : outputs) {
            Log.d(TAG, "Output: " + getDeviceTypeName(device.getType())
                + " | ID: " + device.getId());
        }
    }

    // =========================================================
    //  PERMISSIONS
    // =========================================================
    private boolean hasAllPermissions() {
        for (String perm : REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, perm)
                    != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    private void requestAllPermissions() {
        List<String> needed = new ArrayList<>();
        for (String perm : REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, perm)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(perm);
            }
        }

        // Untuk Android 13+ (API 33), tambahkan izin media baru
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this,
                    Manifest.permission.READ_MEDIA_IMAGES)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.READ_MEDIA_IMAGES);
            }
            if (ContextCompat.checkSelfPermission(this,
                    Manifest.permission.READ_MEDIA_AUDIO)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.READ_MEDIA_AUDIO);
            }
        }

        if (!needed.isEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                needed.toArray(new String[0]),
                REQUEST_PERMISSIONS
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
            @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == REQUEST_PERMISSIONS) {
            boolean allGranted = true;
            for (int i = 0; i < permissions.length; i++) {
                Log.d(TAG, "Permission " + permissions[i] + ": "
                    + (grantResults[i] == PackageManager.PERMISSION_GRANTED
                        ? "GRANTED" : "DENIED"));
                if (grantResults[i] != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                }
            }

            if (!allGranted) {
                Toast.makeText(this,
                    "Beberapa izin ditolak. Fitur kamera, mikrofon, atau GPS mungkin tidak berjalan.",
                    Toast.LENGTH_LONG).show();
            }
        }
    }

    // =========================================================
    //  HELPER: Nama tipe device audio
    // =========================================================
    private String getDeviceTypeName(int type) {
        switch (type) {
            case AudioDeviceInfo.TYPE_BUILTIN_MIC:
                return "BUILTIN_MIC";
            case AudioDeviceInfo.TYPE_USB_DEVICE:
                return "USB_DEVICE";
            case AudioDeviceInfo.TYPE_USB_HEADSET:
                return "USB_HEADSET";
            case AudioDeviceInfo.TYPE_USB_ACCESSORY:
                return "USB_ACCESSORY";
            case AudioDeviceInfo.TYPE_BLUETOOTH_SCO:
                return "BLUETOOTH_SCO";
            case AudioDeviceInfo.TYPE_WIRED_HEADSET:
                return "WIRED_HEADSET";
            case AudioDeviceInfo.TYPE_WIRED_HEADPHONES:
                return "WIRED_HEADPHONES";
            default:
                return "TYPE_" + type;
        }
    }

    // ====== Reset audio mode saat activity pause ======
    @Override
    public void onPause() {
        super.onPause();
        AudioManager audioManager = (AudioManager)
            getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            audioManager.setMode(AudioManager.MODE_NORMAL);
        }
    }

    // ====== Re-detect mikrofon saat activity resume ======
    @Override
    public void onResume() {
        super.onResume();
        setupAudioRouting();
    }
}
