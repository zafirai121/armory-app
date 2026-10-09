package com.zafirai.armory;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.window.OnBackInvokedDispatcher;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

/**
 * The whole app is the web app in assets/www, shown in a WebView. Files are
 * served from a fixed https address (so the page is a secure context and its
 * saved records always belong to the same origin) without any network access.
 *
 * The page talks to this activity through window.AndroidBridge for what a
 * WebView cannot do on its own: saving a file (backups, spreadsheets) and
 * printing (reports, custody receipts). See src/native.js.
 */
public class MainActivity extends Activity {

    // Reserved by Android for app content; never a real site. Do not change it:
    // the saved records are tied to this origin.
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/";
    private static final String ASSET_ROOT = "www";

    private static final int REQUEST_SAVE = 1;
    private static final int REQUEST_PICK = 2;

    private WebView webView;
    private FrameLayout root;
    private String pendingSaveText;
    private ValueCallback<Uri[]> pendingPick;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(getColor(R.color.app_bg));
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setSupportMultipleWindows(false);
        s.setBuiltInZoomControls(false);
        webView.setWebViewClient(new AppClient());
        webView.setWebChromeClient(new AppChrome());
        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");

        root = new FrameLayout(this);
        root.setBackgroundColor(getColor(R.color.app_bg));
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);
        setUpWindow();
        applyInsets();

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::goBack);
        }

        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(START_URL);
        }
    }

    // ── Window: draw behind the system bars and keep the page clear of them ──

    private boolean isLightMode() {
        int night = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return Build.VERSION.SDK_INT >= 29 && night != Configuration.UI_MODE_NIGHT_YES;
    }

    @SuppressWarnings("deprecation")
    private void setUpWindow() {
        Window w = getWindow();
        boolean light = isLightMode();
        if (Build.VERSION.SDK_INT >= 30) {
            w.setDecorFitsSystemWindows(false);
        } else {
            int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
            if (light) flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            w.getDecorView().setSystemUiVisibility(flags);
        }
        if (Build.VERSION.SDK_INT < 35) {
            w.setStatusBarColor(Color.TRANSPARENT);
            w.setNavigationBarColor(Color.TRANSPARENT);
        }
        if (Build.VERSION.SDK_INT >= 29) w.setNavigationBarContrastEnforced(false);
        if (Build.VERSION.SDK_INT >= 30) {
            int mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                    | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
            WindowInsetsController c = w.getInsetsController();
            if (c != null) c.setSystemBarsAppearance(light ? mask : 0, mask);
        }
    }

    @SuppressWarnings("deprecation")
    private void applyInsets() {
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                Insets i = insets.getInsets(WindowInsets.Type.systemBars()
                        | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                v.setPadding(i.left, i.top, i.right, i.bottom);
            } else {
                v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        root.requestApplyInsets();
    }

    // ── Back button: step back through the page's history (closes an open
    //    form first), then leave the app ──

    private void goBack() {
        if (webView.canGoBack()) webView.goBack();
        else finish();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        goBack();
    }

    // ── Lifecycle ──

    @Override
    protected void onPause() {
        webView.onPause(); // the page sees it as hidden (starts the lock timer)
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        root.removeView(webView);
        webView.destroy();
        super.onDestroy();
    }

    // ── Results from the system's save and open pickers ──

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_SAVE) {
            String text = pendingSaveText;
            pendingSaveText = null;
            Uri uri = data != null ? data.getData() : null;
            if (resultCode != RESULT_OK || uri == null || text == null) {
                notifySaved("cancelled");
                return;
            }
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out == null) throw new IOException("no stream");
                out.write(text.getBytes(StandardCharsets.UTF_8));
                notifySaved("saved");
            } catch (IOException | SecurityException e) {
                notifySaved("failed");
            }
        } else if (requestCode == REQUEST_PICK && pendingPick != null) {
            pendingPick.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            pendingPick = null;
        }
    }

    private void notifySaved(String status) {
        webView.evaluateJavascript(
                "window.__armoryFileSaved && window.__armoryFileSaved('" + status + "')", null);
    }

    /** Methods the page can call as window.AndroidBridge.*(). */
    private class Bridge {
        @JavascriptInterface
        public void saveFile(String name, String mimeType, String text) {
            runOnUiThread(() -> {
                pendingSaveText = text;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT)
                        .addCategory(Intent.CATEGORY_OPENABLE)
                        .setType(mimeType)
                        .putExtra(Intent.EXTRA_TITLE, name);
                try {
                    startActivityForResult(i, REQUEST_SAVE);
                } catch (ActivityNotFoundException e) {
                    pendingSaveText = null;
                    notifySaved("failed");
                }
            });
        }

        @JavascriptInterface
        public void print(String jobName) {
            runOnUiThread(() -> {
                PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                pm.print(jobName, webView.createPrintDocumentAdapter(jobName),
                        new PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .build());
            });
        }
    }

    /** Serves the web app from assets; sends any other link to the phone's apps. */
    private class AppClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (!"https".equals(url.getScheme()) || !HOST.equals(url.getHost())) return null;
            String path = url.getPath();
            if (path == null || path.isEmpty()) path = "/";
            if (path.endsWith("/")) path += "index.html";
            if (path.contains("..")) return notFound();
            try {
                InputStream in = getAssets().open(ASSET_ROOT + path);
                String type = mimeType(path);
                boolean text = type.startsWith("text/") || type.equals("application/json") || type.equals("image/svg+xml");
                WebResourceResponse r = new WebResourceResponse(type, text ? "utf-8" : null, in);
                r.setResponseHeaders(Collections.singletonMap("Cache-Control", "no-cache"));
                return r;
            } catch (IOException e) {
                return notFound();
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if ("https".equals(url.getScheme()) && HOST.equals(url.getHost())) return false;
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, url));
            } catch (ActivityNotFoundException e) {
                Toast.makeText(MainActivity.this, R.string.no_app, Toast.LENGTH_SHORT).show();
            }
            return true;
        }

        private WebResourceResponse notFound() {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found",
                    Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
        }

        private String mimeType(String path) {
            String ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase();
            switch (ext) {
                case "html": return "text/html";
                case "js": return "text/javascript";
                case "css": return "text/css";
                case "json": return "application/json";
                case "svg": return "image/svg+xml";
                case "woff2": return "font/woff2";
                case "woff": return "font/woff";
                default:
                    String t = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
                    return t != null ? t : "application/octet-stream";
            }
        }
    }

    /** Opens the system file picker for <input type="file"> (restoring a backup). */
    private class AppChrome extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (pendingPick != null) pendingPick.onReceiveValue(null);
            pendingPick = callback;
            // Any type: phones often label a backup .json file as a generic file
            Intent pick = new Intent(Intent.ACTION_GET_CONTENT)
                    .addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("*/*");
            try {
                startActivityForResult(Intent.createChooser(pick, getString(R.string.pick_file)), REQUEST_PICK);
                return true;
            } catch (ActivityNotFoundException e) {
                pendingPick = null;
                return false;
            }
        }
    }
}
