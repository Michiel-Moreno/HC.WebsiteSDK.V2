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
        openNewWindow: true
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

### PostMessage Communication

**InlineSurvey and ModalSurvey** support bidirectional iframe communication for advanced integrations like response-level analytics.

#### Receiving Messages from Survey

```js
const survey = new hcWebsiteTouchpoint.InlineSurvey(urlBuilder, {
  elementSelector: '#survey'
});

// Listen for messages from the survey iframe
const cleanup = survey.onMessage((data) => {
  console.log('Survey event:', data);

  // Example: Track individual question responses
  if (data.type === 'question_answered') {
    analytics.track('question_answered', {
      questionId: data.questionId,
      answer: data.answer
    });
  }

  // Example: Track survey completion
  if (data.type === 'survey_submitted') {
    analytics.track('survey_completed');
  }
});

// Clean up listener when done (optional - destroy() also cleans up)
cleanup();
```

**Standard Survey Events:**
- `question_shown` - A question was displayed
- `question_answered` - User answered a question
- `question_skipped` - User skipped a question
- `survey_submitted` - User completed the survey
- `survey_abandoned` - User exited without completing
- `validation_error` - User input failed validation

**Note:** Only one message listener is supported at a time. Calling `onMessage()` again will replace the previous listener.

#### Sending Messages to Survey

```js
// Send data to the survey iframe
survey.sendMessage({ action: 'update_context', userId: '12345' });

// With custom origin (optional)
survey.sendMessage({ action: 'ping' }, 'https://custom-origin.com');
```

**Security:** All incoming messages are validated against the survey's origin. Messages from unexpected origins are rejected with a console warning.

#### Use Cases
- **Analytics Integration**: Track question-level responses and completion funnels
- **GTM Integration**: Forward survey events to Google Tag Manager dataLayer
- **Multi-Step Flows**: Update survey context as user progresses through your app
- **Custom Logic**: Trigger actions based on specific survey responses

#### ButtonTriggerSurvey with PostMessage

```js
// Create a feedback button that spawns a modal with analytics
const button = new hcWebsiteTouchpoint.ButtonTriggerSurvey({
  position: 'bottom-right',
  text: 'Feedback',
  onTrigger: () => {
    const modal = new hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {});

    // Track survey events
    modal.onMessage((data) => {
      window.dataLayer.push({
        event: `survey_${data.type}`,
        surveyData: data
      });
    });

    modal.show();
  }
});

button.show();
```

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
