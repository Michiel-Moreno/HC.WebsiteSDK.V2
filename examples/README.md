# Hello Customer SDK v3.0 - Code Examples

This folder contains self-contained HTML examples demonstrating v3.0 features.

## 📋 Examples

### 1. `basic-modal.html`
Simple ModalSurvey demonstration with CDN usage.

**Features:**
- UrlBuilder creation
- ModalSurvey instantiation
- Show/hide controls
- Lifecycle callbacks
- Quarantine configuration

**Best for:** Getting started with the SDK

---

### 2. `dom-removal-detection.html`
Demonstrates automatic cleanup when surveys are removed from DOM (v3.0 feature).

**Features:**
- Automatic `destroy()` on DOM removal
- Memory leak prevention
- SPA integration simulation
- Console logging of cleanup sequence

**Best for:** Understanding v3.0 auto-cleanup feature, SPA integration

---

### 3. `multiple-surveys.html`
Shows ModalSurvey + InlineSurvey + ButtonTriggerSurvey on the same page.

**Features:**
- Multiple survey types together
- Independent quarantine management
- CSS deduplication performance
- ButtonTriggerSurvey triggering ModalSurvey

**Best for:** Complex pages with multiple feedback mechanisms

---

### 4. `popup-blocker-handling.html`
WindowSurvey with popup blocker detection and user-friendly error handling (v3.0 feature).

**Features:**
- Automatic popup blocker detection
- User-friendly error notifications
- Retry functionality
- Instructions for enabling popups

**Best for:** Understanding WindowSurvey error handling

---

### 5. `button-trigger-integration.html`
Comprehensive ButtonTriggerSurvey showcase with all 4 style presets (v3.0 feature).

**Features:**
- Pill button, circle button, side tab, banner presets
- Position demonstrations
- Dynamic button creation/destruction
- Integration with ModalSurvey

**Best for:** Learning ButtonTriggerSurvey capabilities

---

## 🚀 How to Use

### Option 1: Use with Local Build (Recommended for Development)

1. **Build the SDK:**
   ```bash
   npm run build
   ```

2. **Update examples to use local build:**

   Replace the CDN script tag in each example:
   ```html
   <!-- Replace this: -->
   <script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>

   <!-- With this: -->
   <script src="../build/umd/website-touchpoint-v2.js"></script>
   ```

3. **Open examples in browser:**
   - Open any `.html` file directly in your browser
   - Or use a local server: `npx serve .`

### Option 2: Use with CDN (Production)

1. **Update configuration:**

   In each example, replace placeholder values:
   ```javascript
   baseUrl: 'https://your-domain.hellocustomer.com',  // Your actual domain
   tenantId: 'your-tenant-id',                        // Your tenant ID
   touchPointId: 'your-touchpoint-id',                // Your touchpoint ID
   ```

2. **Open in browser:**
   - Examples will load the SDK from CDN
   - Requires v3.0+ to be published to CDN

---

## ⚠️ Important Notes

### ButtonTriggerSurvey Availability

Examples using `ButtonTriggerSurvey` (multiple-surveys.html, button-trigger-integration.html) require v3.0+:

- **Local development:** Run `npm run build` first
- **CDN usage:** Ensure v3.0+ is deployed to CDN

If you see `ButtonTriggerSurvey is not a constructor` error:
1. Run `npm run build` to rebuild the bundle
2. Update examples to use local build (see Option 1 above)

### Configuration

All examples use placeholder values:
- `baseUrl`: Replace with your Hello Customer domain
- `tenantId`: Replace with your tenant ID
- `touchPointId`: Replace with your touchpoint ID

The examples will not load actual surveys with placeholder values, but they demonstrate the SDK API and structure.

---

## 🎯 Feature Matrix

| Example | Modal | Inline | Window | Button | Auto-Cleanup | PostMessage | Popup Detection |
|---------|-------|--------|--------|--------|--------------|-------------|-----------------|
| basic-modal.html | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| dom-removal-detection.html | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| multiple-surveys.html | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| popup-blocker-handling.html | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| button-trigger-integration.html | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |

---

## 📚 Additional Resources

- **Main Documentation:** [README.md](../README.md)
- **Migration Guide:** [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)
- **API Docs:** https://hellocustomer.github.io/HC.WebsiteSDK.V2/
- **GitHub:** https://github.com/hello-customer/HC.WebsiteSDK.V2

---

## 💡 Tips

1. **Open DevTools Console:** Most examples log helpful information to the console
2. **Network Tab:** Watch the iframe requests to understand URL construction
3. **Elements Tab:** Inspect the modal/button DOM structure
4. **Quarantine Testing:** Clear localStorage to reset quarantine periods

---

## 🐛 Troubleshooting

### "ButtonTriggerSurvey is not a constructor"
**Solution:** Run `npm run build` and use local build path

### Surveys don't show
**Solution:** Replace placeholder config values with real Hello Customer credentials

### Popup blocked errors (WindowSurvey)
**Expected behavior:** This demonstrates the v3.0 error handling feature

### Quarantine prevents showing
**Solution:** Call `survey.clearQuarantine()` in console or clear localStorage

---

**Version:** 3.0.0
**Last Updated:** 2025-10-24
