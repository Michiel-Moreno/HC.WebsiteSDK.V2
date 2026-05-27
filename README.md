# HC.WebsiteSDK
## Install
The recommended approach to install this package is to do it via npm with
```npm install @hello-customer/website-touchpoint-v2```

If You are not using npm or yarn, You have to include the script tag in your HTML code
```html
<script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>
```
## Surveys
First You have to create UrlBuilder class which stores your survey configuration and later an appropriate survey instance can be created.
### Survey Configuration
#### Example (script tag)
```html
<script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>
<script>
    const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
      baseUrl: 'https://base.com',
      tenantId: 'xxx',
      touchPointId: 'zzzzz',
      language: 'EN',
      extra: {
        isPreview: true
      }
    });
</script>
  ```
Please consult the docs for more [configuration options](https://hellocustomer.github.io/HC.WebsiteSDK.V2/interfaces/surveyconfig.html).

***

### Automatic Language Detection from URL

The SDK automatically detects the survey language from URL query parameters. This is useful for multi-language websites where the language is indicated in the URL.

#### Supported Parameters
The SDK checks these parameters in order of priority:
1. `?lang=` (highest priority)
2. `?language=`
3. `?locale=`

If none are found, it uses the `language` specified in the configuration. If no language is specified in the configuration, it defaults to `'EN'`.

#### Example

```javascript
// Configuration specifies English as default
const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
  baseUrl: 'https://surveys.example.com',
  tenantId: 'xxx',
  touchPointId: 'zzz',
  language: 'EN'  // Default fallback
});

// URL: https://your-site.com?lang=nl
// Survey will load in Dutch (NL) instead of English

// URL: https://your-site.com
// Survey will load in English (EN) as configured

// No language configured, no URL parameter
const urlBuilder2 = new hcWebsiteTouchpoint.UrlBuilder({
  baseUrl: 'https://surveys.example.com',
  tenantId: 'xxx',
  touchPointId: 'zzz'
});
// Survey will load in English (EN) by default
```

#### Use Cases

- **Multi-language websites**: `example.com/nl?lang=nl` and `example.com/fr?lang=fr`
- **Language switchers**: User selects language, URL updates, survey language follows automatically
- **Localized campaigns**: Different language URLs for different audiences

#### Notes

- Language codes are case-insensitive (`nl`, `NL`, `Nl` all work)
- The detected language is normalized to uppercase
- Works with both CDN (script tag) and npm package usage
- Works with all survey types (Inline, Modal, Window, Button Trigger)

***

### Inline survey
#### Example (script tag)
```html
<script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>
<script>
    const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
      baseUrl: 'https://base.com',
      tenantId: 'xxx',
      touchPointId: 'zzzzz',
      language: 'EN',
      extra: {
        isPreview: true
      }
    });
    const inlineSurvey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
      elementSelector: '#survey'
    });
</script>
  ```
Please consult the docs for more [configuration options](https://hellocustomer.github.io/HC.WebsiteSDK.V2/interfaces/inlinesurveyconfig.html).

***

### Modal survey
  #### Example (script tag)
  ```html
  <script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>
  <script>
      const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
        baseUrl: 'https://base.com',
        tenantId: 'xxxx',
        touchPointId: 'zzz',
        language: 'EN',
        extra: {
          isPreview: true
        }
      });
      const modalSurvey = new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {});
      modalSurvey.show();
  </script>
  ```
Please consult the docs for more [configuration options](https://hellocustomer.github.io/HC.WebsiteSDK.V2/interfaces/modalsurveyconfig.html).

#### Modal structure
 
  The structure of the modal can be described as follows:
  ```html
  <div class="hello-customer-modal">
    <div class="hello-customer-modal__window">
       <div class="hello-customer-modal__bar">
           <div class="hello-customer-modal__close-button">
               ICON
           </div>
       </div>
       <iframe class="hello-customer-survey__survey"></iframe>
    </div>
  </div>
  ```
  Provided class names are the once defined by the library itself by default,
  and can be overwritten using ```classNames``` property of the configuration object.
 
  In order to modify styles attached to the modal elements using aforementioned class names,
  You can use ```modalStyle``` property of the configuration object,
  
  If You want to style the modal by Yourself, You can remove all predefined style rules by setting ```ignoreDefaultStyles``` to true.
  
#### Modal styling example
 
  The following example shows how to change the color of the modal top bar:
  ```js
  import { UrlBuilder, InlineSurvey } from '@hello-customer/website-touchpoint-v2'
  const urlBuilder = new UrlBuilder({...});
  const modalSurvey = new ModalSurvey(urlBuilder, {
    modalStyle: {
      windowBarDivStyle: {
        backgroundColor: '#04c48e'
      }
    }
  });
  ```
  [Other parts of the modal](https://hellocustomer.github.io/HC.WebsiteSDK.V2/interfaces/modalsurveystyleconfig.html) can be styled in the same way (any valid CSS property can be used for them).
***

### Window survey
#### Example (script tag)
```html
<script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>
<script>
    const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
      baseUrl: 'https://base.com',
      tenantId: 'xxx',
      touchPointId: 'zzzzz',
      language: 'EN',
      extra: {
        isPreview: true
      }
     });
     const windowSurvey = new hcWebsiteTouchpoint.WindowSurvey(urlBuilder, {
        openAsPopup: true
     });
     windowSurvey.open();
</script>
  ```
Please consult the docs for more [configuration options](https://hellocustomer.github.io/HC.WebsiteSDK.V2/interfaces/windowsurveyconfig.html).

***

### Button Trigger Survey
The Button Trigger Survey creates a floating feedback button that can trigger any survey type or custom action. Unlike other survey types, it doesn't require a UrlBuilder - just an `onTrigger` callback.

#### Example - Basic usage (script tag)
```html
<script src="https://resources.hellocustomer.com/hubfs/HC.WebsiteSDK.V2/website-touchpoint-v2.js"></script>
<script>
    // Create URL builder and modal survey
    const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
      baseUrl: 'https://base.com',
      tenantId: 'xxx',
      touchPointId: 'zzzzz',
      language: 'EN'
    });

    const modalSurvey = new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {
      showByDefault: false
    });

    // Create button trigger
    const feedbackButton = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
      position: 'bottom-right',
      stylePreset: 'pill-button',
      text: 'Give Feedback',
      onTrigger: () => modalSurvey.show()
    });
</script>
```

#### Available Positions
- `bottom-right`, `bottom-left`, `top-right`, `top-left` (corners)
- `left-center`, `right-center` (side tabs)
- `bottom-center`, `top-center` (banners)

#### Style Presets

**Pill Button** (default) - Rounded button with text and optional icon
```js
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  stylePreset: 'pill-button',
  text: 'Feedback',
  onTrigger: () => modalSurvey.show()
});
```

**Circle Button** - Circular button with icon only
```js
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-left',
  stylePreset: 'circle-button',
  icon: '<svg>...</svg>',
  onTrigger: () => modalSurvey.show()
});
```

**Side Tab** - Vertical tab on left or right edge
```js
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'right-center',
  stylePreset: 'side-tab',
  text: 'Feedback',
  onTrigger: () => windowSurvey.open()
});
```

**Banner** - Full-width banner at top or bottom
```js
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'top-center',
  stylePreset: 'banner',
  text: 'We value your feedback - Click here to share',
  onTrigger: () => modalSurvey.show()
});
```

#### Custom Styling Example
```js
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  stylePreset: 'pill-button',
  text: 'Custom Button',
  onTrigger: () => modalSurvey.show(),
  customStyle: {
    buttonStyle: {
      backgroundColor: '#ff6b6b',
      color: 'white',
      fontSize: '16px'
    }
  }
});
```

#### Button Quarantine
You can set a quarantine period for the button visibility (independent of survey quarantine):
```js
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  text: 'Feedback',
  onTrigger: () => modalSurvey.show(),
  quarantineConfig: {
    period: 7 // Don't show button for 7 days after it's shown
  }
});
```

#### Multi-Language Support

ButtonTriggerSurvey automatically translates button text based on survey language, supporting **30 languages** including all EU languages and neighbors.

**Automatic Translation** (Recommended)
```js
// Button text automatically matches survey language
const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
  baseUrl: 'https://base.com',
  tenantId: 'xxx',
  touchPointId: 'zzzzz',
  language: 'FR'  // French survey
});

const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  language: 'FR',  // Button shows "Commentaires"
  onTrigger: () => modalSurvey.show()
});
```

**Supported Languages** (30 total):
- **Western Europe**: EN, FR, DE, NL, IT, ES, PT, CA, GA
- **Nordic**: SV, DA, NO, FI
- **Eastern Europe**: PL, CS, SK, HU, RO, BG, RU
- **Southern Europe**: EL, HR, SL, MT
- **Baltic**: LT, LV, ET
- **Other**: TR, AR (with RTL support), ZH

**Custom Text Override**
```js
// Override automatic translation with custom text
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  language: 'ES',
  text: 'Comparte tu opinión',  // Custom Spanish text
  onTrigger: () => modalSurvey.show()
});
```

**Dynamic Language Switching**
```js
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  language: 'EN',
  onTrigger: () => modalSurvey.show()
});

// When user changes language preference
function onLanguageChange(newLang) {
  urlBuilder.updateUrlConfig({ language: newLang });
  button.updateLanguage(newLang);  // Button text updates automatically
  modalSurvey.updateAndReload({ language: newLang });
}
```

**Right-to-Left (RTL) Support**

Arabic automatically displays right-to-left with proper icon positioning:
```js
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  language: 'AR',  // Shows "تعليقات" with RTL layout
  icon: '<svg>...</svg>',
  onTrigger: () => modalSurvey.show()
});
```

**Text Priority Order:**
1. **Explicit `text` parameter** - Always takes priority
2. **Automatic translation** - Based on `language` parameter
3. **Default fallback** - "Feedback" if neither is provided

**Accessibility:** All translations include proper ARIA labels for screen readers. Circle buttons hide text visually but keep ARIA labels for accessibility.

Please consult the docs for more [configuration options](https://hellocustomer.github.io/HC.WebsiteSDK.V2/interfaces/buttontriggersurveyconfig.html).

***

## Quarantine
  It is possible to set a quarantine period for any survey type - once the survey is opened, it defines how many days should elapse before the survey could be shown again. Quarantine is applied per touchpoint (touchpointId).
  #### Example (inline survey)
  ```js
  const inlineSurvey = new InlineSurvey(urlBuilder, {
    elementSelector: '#survey',
    quarantineConfig: {
      period: 5 // days
    }
  });
  ```

***

## Advanced Features

### Lifecycle Callbacks

All survey types support lifecycle callbacks to hook into survey events:

#### Example - InlineSurvey with callbacks
```js
const inlineSurvey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey',
  callbacks: {
    onBeforeShow: () => {
      console.log('About to show survey');
    },
    onShow: () => {
      console.log('Survey is now visible');
      analytics.track('survey_shown');
    },
    onHide: () => {
      console.log('Survey hidden');
    },
    onLoad: (iframe) => {
      console.log('Survey iframe loaded', iframe);
    },
    onError: (error) => {
      console.error('Survey error:', error);
    },
    onDestroy: () => {
      console.log('Survey destroyed and cleaned up');
    },
    onQuarantineBlocked: (remainingDays) => {
      console.log(`Survey blocked. ${remainingDays} days until next show.`);
    }
  }
});
```

#### Available Callbacks
- `onBeforeShow()` - Called before survey is shown
- `onShow()` - Called when survey becomes visible
- `onHide()` - Called when survey is hidden
- `onLoad(iframe)` - Called when iframe finishes loading
- `onError(error)` - Called when an error occurs
- `onDestroy()` - Called when survey is destroyed
- `onQuarantineBlocked(remainingDays)` - Called when quarantine prevents showing

**ModalSurvey specific:**
- `onClose()` - Called when modal is closed (X button or ESC key)

**WindowSurvey specific:**
- Same as above, adapted for popup windows

**ButtonTriggerSurvey specific:**
- Uses `onTrigger` instead of lifecycle callbacks

***

### Dynamic URL Updates

Update survey configuration dynamically without recreating the survey instance.

#### Example - User login scenario
```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey'
});

// Later, when user logs in
user.onLogin((userData) => {
  survey.updateAndReload({
    extra: {
      respondent: {
        id: userData.id,
        email: userData.email,
        name: userData.name
      },
      metadata: {
        loginTime: new Date().toISOString()
      }
    }
  });
});
```

#### Available Methods

**`updateUrlConfig(patch)`** - Update URL configuration
```js
survey.updateUrlConfig({
  language: 'FR',
  extra: { metadata: { step: 2 } }
});
// Call survey.reload() to apply changes (InlineSurvey/ModalSurvey)
// Or survey.open() to use new config (WindowSurvey)
```

**`updateAndReload(patch)`** - Update and reload automatically
```js
survey.updateAndReload({
  extra: { metadata: { variant: 'A' } }
});
// Convenience method for InlineSurvey and ModalSurvey only
```

**Use Cases:**
- Add user details after login
- Update metadata between multi-step flows
- Change language dynamically
- Switch A/B test variants

***

### Quarantine Management

Check quarantine status and get remaining days:

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey',
  quarantineConfig: {
    period: 7 // 7 days
  },
  callbacks: {
    onQuarantineBlocked: (remainingDays) => {
      showNotification(
        `Please wait ${remainingDays} more day(s) before taking this survey again.`
      );
    }
  }
});

// Check if currently under quarantine
if (survey.isQuarantined()) {
  console.log('Survey is under quarantine');
}

// Get quarantine details
const status = survey.getQuarantineStatus();
console.log(`Remaining: ${status.remainingDays} days`);

// Manually clear quarantine (e.g., for testing)
survey.clearQuarantine();
```

***

### Accessibility

ModalSurvey includes comprehensive accessibility features:

- **ARIA Attributes**: Proper `role="dialog"`, `aria-modal="true"`, `aria-label`
- **Keyboard Support**: ESC to close, Tab navigation
- **Focus Management**: Auto-focus on open, restore on close
- **Screen Reader**: Announces modal state changes

**WCAG 2.1 AA Compliant**

```js
const modalSurvey = new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {
  closeOnEscape: true,  // ESC key support
  closeButton: true,    // Visible close button
  closeOnBackdropClick: false  // Prevent accidental closure
});
```

***

### Survey Event Callbacks

**InlineSurvey and ModalSurvey** emit lifecycle events from the survey iframe. The recommended way to consume them is via typed callbacks on the `callbacks` option, covered below. For raw or custom messages, see the [low-level message API](#low-level-message-api).

Every event object includes a `timestamp` (milliseconds since epoch). All callbacks are optional.

#### onCompleted

Fires when the user successfully submits the survey.

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey',
  callbacks: {
    onCompleted: (event) => {
      analytics.track('survey_completed', { at: event.timestamp });
    }
  }
});
```

Event shape: `{ timestamp: number }`

**ModalSurvey only** — set `autoCloseOnComplete: true` to hide the modal automatically after the survey is submitted. The `onCompleted` callback still fires before the modal closes.

```js
new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {
  autoCloseOnComplete: true,
  callbacks: { onCompleted: (event) => { /* ... */ } }
});
```

#### onPageChanged

Fires when the user navigates between pages of a multi-page survey.

```js
callbacks: {
  onPageChanged: (event) => {
    console.log(`Page ${event.currentPage} of ${event.totalPages}`);
  }
}
```

Event shape: `{ currentPage: number, totalPages: number, timestamp: number }` (pages are 1-indexed)

#### onSelected

Fires in real time whenever the user selects or changes an answer. May fire multiple times for the same question if the user changes their mind. **Metadata only — no answer content is exposed, by design.**

```js
callbacks: {
  onSelected: (event) => {
    analytics.track('question_answered', {
      questionType: event.questionType,
      questionIndex: event.questionIndex,
      score: event.score
    });
  }
}
```

Event shape (indices are 0-indexed):

| Field | Type | Notes |
|-------|------|-------|
| `questionType` | `string` | Always present (e.g. `NPS`, `CSAT`, `YesNo`, `MultipleChoice`, `Text`) |
| `questionId` | `string` | Always present |
| `questionIndex` | `number` | Always present |
| `pageIndex` | `number` | Always present |
| `timestamp` | `number` | Always present |
| `score` | `number?` | Score-based questions (NPS, CSAT, CES, Score, …) |
| `minScore` / `maxScore` | `number?` | Score range for score-based questions |
| `value` | `boolean?` | YesNo questions |
| `selectedCount` | `number?` | MultipleChoice questions |
| `hasText` / `textLength` | `boolean?` / `number?` | Text questions — never the actual content |

The optional fields are populated only for the relevant question types; the five core fields are always present.

#### onFirstInteraction

Fires once per survey session, the first time the user interacts with any question. Useful for engagement funnels.

```js
callbacks: {
  onFirstInteraction: (event) => {
    analytics.track('survey_engagement_started');
  }
}
```

Event shape: `{ questionType: string, timestamp: number }`

***

#### Low-Level Message API

For events outside the typed callbacks above (custom integrations or raw access to the message stream), use `onMessage()` to subscribe to the raw postMessage events sent by the survey iframe.

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey'
});

const cleanup = survey.onMessage((data) => {
  console.log('Survey event:', data);

  if (data.type === 'hc:completed') {
    analytics.track('survey_completed');
  }
});

// Clean up listener when done (optional - destroy() also cleans up)
cleanup();
```

The survey iframe currently emits these message types (`data.type`):

| Type | When | Payload |
|------|------|---------|
| `hc:resize` | Iframe content height changes | `{ type, version, source, height }` |
| `hc:status` | Survey load state changes | `{ type, status, reason?, message? }` — see [Survey Status Detection](#survey-status-detection) |
| `hc:completed` | Survey submitted | `{ type, timestamp }` |
| `hc:pagechanged` | Page navigation | `{ type, currentPage, totalPages, timestamp }` |
| `hc:selected` | Answer selected or changed | `{ type, questionType, questionId, questionIndex, pageIndex, timestamp, score?, minScore?, maxScore?, value?, selectedCount?, hasText?, textLength? }` |
| `hc:firstinteraction` | First user interaction | `{ type, questionType, timestamp }` |

**Note:** Only one `onMessage` listener is supported at a time — calling `onMessage()` again replaces the previous listener. The typed callbacks above run independently and do not conflict with `onMessage`.

#### Sending Messages to Survey

```js
// Send data to the survey iframe
survey.sendMessage({ action: 'update_context', userId: '12345' });

// With custom origin (optional)
survey.sendMessage({ action: 'ping' }, 'https://custom-origin.com');
```

**Security:** All incoming messages are validated against the survey's origin and source frame. Messages from unexpected origins are dropped.

#### Use Cases
- **Analytics Integration**: Track question-level engagement with `onSelected` and completion with `onCompleted`
- **GTM Integration**: Forward survey events to the Google Tag Manager dataLayer from any callback
- **Multi-Step Flows**: Use `sendMessage` to push context updates into the survey as the user progresses
- **Funnel Tracking**: Combine `onFirstInteraction` and `onCompleted` to measure engagement-to-completion rate

#### ButtonTriggerSurvey Example

```js
// Create a feedback button that spawns a modal with analytics
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  text: 'Feedback',
  onTrigger: () => {
    const modal = new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {
      autoCloseOnComplete: true,
      callbacks: {
        onCompleted: (event) => {
          window.dataLayer.push({
            event: 'feedback_submitted',
            at: event.timestamp
          });
        }
      }
    });

    modal.show();
  }
});

button.show();
```

***

### Auto-Height Support

**InlineSurvey and ModalSurvey** can automatically adjust their height based on survey content, eliminating scrollbars and providing a seamless experience.

#### Basic Usage

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey',
  autoHeight: true
});
```

#### With Height Constraints

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey',
  autoHeight: true,
  minHeight: 200,   // Minimum height in pixels
  maxHeight: 800    // Maximum height in pixels
});
```

#### ModalSurvey Example

```js
const modalSurvey = new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {
  autoHeight: true,
  minHeight: 300,
  maxHeight: 600
});
```

**Note:** Auto-height relies on the survey page emitting `hc:resize` messages, which current Hello Customer surveys do automatically when embedded. If an older, cached version of the survey page does not emit them, the iframe simply keeps its initial height (no error is thrown).

***

### Survey Status Detection

Detect when surveys are unavailable (deactivated, quota exceeded, etc.) and handle them gracefully.

#### Basic Usage

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey-container',
  callbacks: {
    onSurveyStatus: (event) => {
      switch (event.status) {
        case 'ready':
          console.log('Survey is ready for interaction');
          break;

        case 'unavailable':
          // Hide survey and show fallback content
          document.querySelector('#survey-container').style.display = 'none';
          document.querySelector('#fallback-content').style.display = 'block';
          console.warn(`Survey unavailable: ${event.reason} - ${event.message}`);
          break;

        case 'timeout':
          // Survey page didn't respond (may be older version)
          console.warn('Survey did not respond within timeout');
          break;

        case 'error':
          console.error(`Survey error: ${event.message}`);
          break;
      }
    }
  }
});
```

#### Status Types

| Status | Description |
|--------|-------------|
| `ready` | Survey loaded successfully and is interactive |
| `unavailable` | Survey cannot be displayed (deactivated, quota exceeded, etc.) |
| `timeout` | Survey page didn't respond within timeout period |
| `error` | An error occurred during survey loading |

#### Reasons for `unavailable` Status

- `deactivated` - Survey has been deactivated by admin
- `quota_exceeded` - Response quota has been reached
- `expired` - Survey has passed its end date
- `not_started` - Survey has not yet reached its start date
- `not_found` - Survey does not exist
- `access_denied` - Access to the survey was denied
- `already_answered` - This respondent has already submitted a response

#### Reasons for `error` Status

- `internal_error` - An unexpected error occurred on the survey page
- `invalid_config` - The survey configuration is invalid
- `load_failed` - The survey failed to load

#### Custom Timeout

By default, the SDK waits 10 seconds for a status response. You can customize this:

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey',
  statusTimeout: 15000, // 15 seconds
  callbacks: {
    onSurveyStatus: (event) => { /* ... */ }
  }
});

// Disable timeout entirely
const survey2 = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey',
  statusTimeout: 0 // No timeout
});
```

**Note:** Survey status detection relies on the survey page emitting `hc:status` messages, which current Hello Customer surveys do automatically when embedded. If an older, cached version of the survey page does not emit them, the `timeout` status fires after the configured timeout period instead.

***

### Memory Management

Always call `destroy()` when removing a survey to prevent memory leaks:

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, config);

// When done with survey
survey.destroy();  // Removes DOM elements, event listeners, postMessage listeners, etc.
```

All surveys automatically clean up:
- DOM elements
- Event listeners
- PostMessage listeners (InlineSurvey/ModalSurvey)
- Quarantine data (optional)
- Callback references
