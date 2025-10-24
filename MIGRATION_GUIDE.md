# Migration Guide: v2.x → v3.0.0

**Date**: 2025-10-24
**Package**: `@hello-customer/website-touchpoint-v2`

---

## Overview

Hello Customer Website SDK v3.0.0 introduces powerful new features while maintaining **100% backward compatibility** with v2.x. This guide helps you understand what's new and how to upgrade seamlessly.

### What's New in v3.0.0

✨ **New Features**:
- **ButtonTriggerSurvey** - Floating feedback button with 4 style presets and 30+ language support
- **PostMessage Communication** - Bidirectional iframe messaging for analytics integrations
- **Lifecycle Events** - Comprehensive callbacks (onShow, onHide, onLoad, onError, onDestroy, onQuarantineBlocked)
- **Automatic DOM Removal Detection** - Prevents memory leaks in SPAs (ModalSurvey, InlineSurvey, ButtonTriggerSurvey)
- **Popup Blocker Detection** - User-friendly error messages for WindowSurvey
- **Comprehensive Validation** - Helpful warnings for mismatched position + stylePreset combinations

🎯 **Performance Improvements**:
- 10% bundle size reduction (50 KB → 45 KB raw, 12.6 KB gzipped)
- Zero technical debt (no TODOs, FIXMEs, or `any` types)
- 532 tests with 98.39% code coverage
- Optimized CSS deduplication for multi-survey pages

🔒 **Backward Compatibility**:
- All v2.x code works without changes
- No breaking changes to existing APIs
- No configuration changes required

---

## Breaking Changes

**None!** 🎉

v3.0.0 is fully backward compatible with v2.x. All existing code will continue to work exactly as before.

---

## What's New in Detail

### 1. ButtonTriggerSurvey (New Survey Type)

Create floating feedback buttons that trigger surveys or custom actions.

**Before v3.0** (Manual HTML + JavaScript):
```html
<!-- You had to build your own feedback button -->
<button id="feedback-btn" style="position: fixed; bottom: 20px; right: 20px;">
  Feedback
</button>

<script>
  document.getElementById('feedback-btn').addEventListener('click', () => {
    const modal = new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {});
    modal.show();
  });
</script>
```

**After v3.0** (Built-in ButtonTriggerSurvey):
```typescript
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  stylePreset: 'pill-button',
  text: 'Feedback',
  onTrigger: () => modal.show()
});
// Automatic positioning, styling, quarantine, accessibility, and cleanup!
```

**Benefits**:
- 4 style presets: `pill-button`, `circle-button`, `side-tab`, `banner`
- 8 positions: corners, sides, top/bottom center
- 30+ languages with automatic translation
- RTL support for Arabic
- Automatic DOM removal detection (no memory leaks)
- Quarantine support (independent of survey quarantine)

---

### 2. Automatic DOM Removal Detection

Prevents memory leaks in Single Page Applications (SPAs).

**Before v3.0** (Manual cleanup required):
```typescript
// React component - you had to manually call destroy()
function SurveyComponent() {
  const [survey, setSurvey] = useState(null);

  useEffect(() => {
    const s = new InlineSurvey(urlBuilder, {
      elementSelector: '#survey-container'
    });
    setSurvey(s);

    // REQUIRED cleanup to prevent memory leaks!
    return () => {
      s.destroy();
    };
  }, []);

  return <div id="survey-container"></div>;
}
```

**After v3.0** (Automatic cleanup):
```typescript
// React component - cleanup happens automatically!
function SurveyComponent() {
  useEffect(() => {
    const survey = new InlineSurvey(urlBuilder, {
      elementSelector: '#survey-container',
      callbacks: {
        onDestroy: () => console.log('Auto-cleaned!')
      }
    });

    // No cleanup needed! When component unmounts and the container
    // is removed from DOM, destroy() is called automatically.
  }, []);

  return <div id="survey-container"></div>;
}
```

**Benefits**:
- No manual cleanup needed in SPAs
- Prevents memory leaks automatically
- Works with React, Vue, Angular, Svelte, etc.
- Applies to: ModalSurvey, InlineSurvey, ButtonTriggerSurvey

---

### 3. Popup Blocker Detection (WindowSurvey)

User-friendly error messages when popups are blocked.

**Before v3.0** (Generic error):
```typescript
const survey = new WindowSurvey(urlBuilder, {});
try {
  survey.open();
} catch (error) {
  // Generic error - no context for users
  console.error(error);
}
```

**After v3.0** (Helpful error handling):
```typescript
const survey = new WindowSurvey(urlBuilder, {
  callbacks: {
    onError: (error) => {
      if (error.message.includes('popup blocker')) {
        showNotification({
          type: 'warning',
          title: 'Popup Blocked',
          message: 'Please allow popups for this site to view the survey.',
          actions: [
            { label: 'How to enable', onClick: () => showHelp() },
            { label: 'Try again', onClick: () => survey.open() }
          ]
        });
      }
    }
  }
});

try {
  survey.open();
} catch (error) {
  // Error already handled with user-friendly message
}
```

**Benefits**:
- Detects popup blockers automatically
- User-friendly error messages
- Guides users to enable popups
- Improves user experience

---

### 4. PostMessage Communication (ModalSurvey & InlineSurvey)

Bidirectional iframe messaging for analytics integrations.

**New in v3.0**:
```typescript
const survey = new InlineSurvey(urlBuilder, {
  elementSelector: '#survey'
});

// Listen for events from survey iframe
survey.onMessage((data) => {
  if (data.type === 'question_answered') {
    // Track individual question responses
    analytics.track('question_answered', {
      questionId: data.questionId,
      answer: data.answer
    });
  }

  if (data.type === 'survey_submitted') {
    // Track survey completion
    analytics.track('survey_completed');
  }
});

// Send messages to survey iframe
survey.sendMessage({
  type: 'prefill',
  data: { email: 'user@example.com' }
});
```

**Use Cases**:
- Google Tag Manager integration
- Response-level analytics
- Completion funnel tracking
- Custom survey logic
- Multi-step flows

---

### 5. Lifecycle Callbacks (All Survey Types)

Comprehensive event hooks for all survey types.

**New in v3.0**:
```typescript
const survey = new ModalSurvey(urlBuilder, {
  callbacks: {
    onShow: () => console.log('Survey shown'),
    onHide: () => console.log('Survey hidden'),
    onLoad: (iframe) => console.log('Iframe loaded'),
    onError: (error) => console.error('Survey error:', error),
    onDestroy: () => console.log('Survey destroyed'),
    onQuarantineBlocked: (days) => console.log(`Quarantined for ${days} days`)
  }
});
```

**Available Callbacks**:
- `onShow()` - Survey becomes visible
- `onHide()` - Survey is hidden
- `onLoad(iframe)` - Iframe finishes loading
- `onError(error)` - An error occurs
- `onDestroy()` - Survey is destroyed
- `onQuarantineBlocked(remainingDays)` - Quarantine prevents showing
- `onClose()` - (ModalSurvey only) Modal is closed
- `onTrigger()` - (ButtonTriggerSurvey only) Button is clicked

---

### 6. Comprehensive Validation (ButtonTriggerSurvey)

Helpful warnings for configuration issues.

**New in v3.0**:
```typescript
// Example: Incompatible position + stylePreset
const button = new ButtonTriggerSurvey({
  position: 'bottom-right',  // Corner position
  stylePreset: 'side-tab',   // Side preset (designed for left/right-center)
  onTrigger: () => {}
});

// Console warning:
// "[Hello Customer SDK] 'side-tab' preset works best at 'left-center'
//  or 'right-center'. Current position: 'bottom-right'.
//  Recommended: Change to { position: 'left-center' } or
//  { stylePreset: 'pill-button' }"
```

**Benefits**:
- Catches configuration mismatches
- Suggests fixes
- Improves developer experience
- Prevents visual issues

---

## Upgrade Steps

### Step 1: Update Package

#### Via npm:
```bash
npm install @hello-customer/website-touchpoint-v2@latest
```

#### Via CDN:
Update your script tag to the latest version:

```html
<!-- Before -->
<script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>

<!-- After (same URL - no changes needed!) -->
<script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>
```

### Step 2: No Code Changes Required

Your existing v2.x code continues to work without modifications:

```typescript
// This v2.x code works perfectly in v3.0
const urlBuilder = new UrlBuilder({
  baseUrl: 'https://base.com',
  tenantId: 'xxx',
  touchPointId: 'zzz',
  language: 'EN'
});

const modal = new ModalSurvey(urlBuilder, {});
modal.show();
```

### Step 3: (Optional) Leverage New Features

Add new v3.0 features gradually:

```typescript
// Add lifecycle callbacks
const modal = new ModalSurvey(urlBuilder, {
  callbacks: {
    onShow: () => console.log('Modal shown'),
    onDestroy: () => console.log('Modal destroyed')
  }
});

// Add PostMessage for analytics
modal.onMessage((data) => {
  window.dataLayer.push({ event: 'survey_event', data });
});

// Add ButtonTriggerSurvey
const button = new ButtonTriggerSurvey({
  position: 'bottom-right',
  text: 'Feedback',
  onTrigger: () => modal.show()
});
```

### Step 4: (Optional) Remove Manual Cleanup in SPAs

If you have manual cleanup code for SPAs, you can safely remove it:

```typescript
// Before v3.0 - manual cleanup
useEffect(() => {
  const survey = new InlineSurvey(urlBuilder, { elementSelector: '#survey' });
  return () => survey.destroy(); // Manual cleanup
}, []);

// After v3.0 - automatic cleanup
useEffect(() => {
  const survey = new InlineSurvey(urlBuilder, { elementSelector: '#survey' });
  // No cleanup needed!
}, []);
```

**Note**: Manual cleanup still works in v3.0, so you can remove it gradually.

---

## Deprecations

**None!**

No features or APIs were deprecated in v3.0.0. All v2.x functionality remains available.

---

## Testing Recommendations

After upgrading to v3.0.0, test these scenarios:

### 1. Test Existing Functionality
Ensure all existing surveys work as before:
- [ ] ModalSurvey shows and hides correctly
- [ ] InlineSurvey embeds in containers
- [ ] WindowSurvey opens in new windows/tabs
- [ ] Quarantine works as expected

### 2. Test DOM Removal (if using SPAs)
Verify automatic cleanup in Single Page Applications:
- [ ] Create a survey
- [ ] Navigate to a different route (or remove container)
- [ ] Check browser DevTools → Elements - survey DOM should be gone
- [ ] Check browser DevTools → Memory - no leaks after multiple route changes

### 3. Test WindowSurvey with Popup Blocker
Verify error handling when popups are blocked:
- [ ] Enable popup blocker in browser settings
- [ ] Try opening WindowSurvey
- [ ] Verify `onError` callback is triggered with helpful message

### 4. (Optional) Test New Features
If you added new v3.0 features:
- [ ] Test ButtonTriggerSurvey positioning and styling
- [ ] Test PostMessage communication (send/receive)
- [ ] Test lifecycle callbacks fire correctly

---

## Troubleshooting

### Issue: "My survey doesn't show after upgrading"

**Solution**: v3.0.0 doesn't change any default behavior. Check:
1. Console for errors
2. Quarantine status (`survey.isQuarantined()`)
3. Configuration is valid

### Issue: "Popup blocker warning appears unexpectedly"

**Solution**: This is a new v3.0 feature for WindowSurvey. The popup blocker detection helps users understand why the survey didn't open. You can customize the error handling:

```typescript
const survey = new WindowSurvey(urlBuilder, {
  callbacks: {
    onError: (error) => {
      // Your custom error handling
    }
  }
});
```

### Issue: "Console warnings about position + stylePreset mismatch"

**Solution**: This is a new v3.0 validation feature for ButtonTriggerSurvey. The warnings are helpful suggestions, not errors. Either:
1. Adjust the configuration as suggested
2. Ignore the warning if the current setup works for your use case

---

## Support

### Need Help?

- **Documentation**: https://hellocustomer.github.io/HC.WebsiteSDK.V2/
- **GitHub Issues**: https://github.com/hello-customer/HC.WebsiteSDK.V2/issues
- **Support Email**: support@hellocustomer.com

### Found a Bug?

Please report it on GitHub with:
1. SDK version (`3.0.0`)
2. Browser and version
3. Minimal reproduction code
4. Expected vs actual behavior

---

## Summary

✅ **Fully backward compatible** - No code changes required
✅ **New features available** - ButtonTriggerSurvey, PostMessage, lifecycle events
✅ **Better performance** - Smaller bundle, automatic memory management
✅ **Improved DX** - Validation warnings, better error messages

**Upgrade today to benefit from v3.0.0 improvements while maintaining full compatibility!**
