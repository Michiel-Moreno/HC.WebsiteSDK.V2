# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.3.0] (2025-10-23)

### Features
* add multi-language support (i18n) to ButtonTriggerSurvey
* add automatic translation for 30 languages (EN, FR, ES, DE, NL, IT, PT, PL, RU, AR, ZH, and more)
* add `language` parameter for automatic button text translation
* add `updateLanguage()` method for dynamic language switching
* add RTL (right-to-left) support for Arabic with automatic layout adjustments
* add 51 comprehensive i18n tests covering all languages and edge cases

### Changes
* button text now auto-translates based on `language` parameter
* explicit `text` parameter takes priority over automatic translation
* ARIA labels automatically use translated text for accessibility
* circle buttons keep translated text in ARIA labels while hiding visually

### Documentation
* add comprehensive Multi-Language Support section to README
* add usage examples for automatic translation, custom text, and RTL support
* add list of all 30 supported languages grouped by region
* update .cspell.json with all translation words

## [2.2.0] (2025-10-16)

### Features
* add PostMessage communication to InlineSurvey and ModalSurvey
* add bidirectional iframe communication with origin verification
* add sendMessage() and onMessage() methods for response-level analytics
* enable tracking of individual question responses and completion funnels

### Documentation
* add comprehensive PostMessage Communication section to README
* add PostMessage use cases and security details
* update Memory Management section with PostMessage cleanup

## [2.1.0] (2025-10-15)

### Features
* add ButtonTriggerSurvey with 4 style presets and 8 positions
* add floating feedback button functionality for Pop-up and New tab surveys

### Changes
* update URL format - remove AskAnywhereCampaign segment from paths

### Documentation
* add comprehensive ButtonTriggerSurvey section to README

### [2.0.2](https://github.com/hellocustomer/HC.WebsiteSDK.V2/compare/2.0.1...2.0.2) (2024-03-13)

### [2.0.1](https://github.com/hellocustomer/HC.WebsiteSDK.V2/compare/1.3.0...2.0.1) (2024-03-13)

## [1.3.0](https://github.com/hellocustomer/HC.WebsiteSDK/compare/1.2.0...1.3.0) (2021-04-02)


### Features

* set quarantine per touchpoint ([1ad360f](https://github.com/hellocustomer/HC.WebsiteSDK/commit/1ad360fa6de784ee5a7d0c5af65257da3a27472a)), closes [#HCS-18](https://github.com/hellocustomer/HC.WebsiteSDK/issues/HCS-18)

## [1.2.0](https://github.com/hellocustomer/HC.WebsiteSDK/compare/1.1.2...1.2.0) (2021-03-26)


### Features

* add survey quarantine ([143fada](https://github.com/hellocustomer/HC.WebsiteSDK/commit/143fadae8b7d805fe63dbeee0b1b595d2b33c520)), closes [#HCS-17](https://github.com/hellocustomer/HC.WebsiteSDK/issues/HCS-17)

### [1.1.2](https://github.com/hellocustomer/HC.WebsiteSDK/compare/1.1.1...1.1.2) (2021-02-25)


### Bug Fixes

* change modal survey max-width to 685px ([45e030d](https://github.com/hellocustomer/HC.WebsiteSDK/commit/45e030da3995ff1b2c3c06ee9d9361ed0cfcb91f))

### [1.1.1](https://github.com/hellocustomer/HC.WebsiteSDK/compare/1.1.0...1.1.1) (2020-10-14)


### Bug Fixes

* fix modal layput on firefox ([1bce886](https://github.com/hellocustomer/HC.WebsiteSDK/commit/1bce886129061ce7a6ea44328788502c767d037f))

## [1.1.0](https://github.com/hellocustomer/HC.WebsiteSDK/compare/1.0.0...1.1.0) (2020-10-14)


### Features

* add installation instructions ([2cde6d5](https://github.com/hellocustomer/HC.WebsiteSDK/commit/2cde6d5779a767aa3dc7c0873b7f45475eca366c)), closes [#HCS-13](https://github.com/hellocustomer/HC.WebsiteSDK/issues/HCS-13)

## 1.0.0 (2020-10-08)


### Features

* add inline survey ([8c9c97a](https://github.com/hellocustomer/HC.WebsiteSDK/commit/8c9c97a60eb39c1fcef711dac8ea4ab8cb8c058b)), closes [#HCS-4](https://github.com/hellocustomer/HC.WebsiteSDK/issues/HCS-4)
* add modal survey ([02953b3](https://github.com/hellocustomer/HC.WebsiteSDK/commit/02953b3eee37533c7d5110b91ccb2a59cd025b27)), closes [#HCS-5](https://github.com/hellocustomer/HC.WebsiteSDK/issues/HCS-5)
* add rollup configuration ([7f2eb45](https://github.com/hellocustomer/HC.WebsiteSDK/commit/7f2eb4580d8af7d4e3039a47acfb913a8ef6e6f7)), closes [#HCS-3](https://github.com/hellocustomer/HC.WebsiteSDK/issues/HCS-3)
* add window survey ([f24e746](https://github.com/hellocustomer/HC.WebsiteSDK/commit/f24e7460c299ddb38fd78ba66823f0ca8c975dc2)), closes [#HCS-6](https://github.com/hellocustomer/HC.WebsiteSDK/issues/HCS-6)
* basic library setup ([d026a49](https://github.com/hellocustomer/HC.WebsiteSDK/commit/d026a495285837e023b570717c3b60efa36e1e5f)), closes [#HCS-2](https://github.com/hellocustomer/HC.WebsiteSDK/issues/HCS-2)


### Bug Fixes

* change test runner from ava to jest ([f165a65](https://github.com/hellocustomer/HC.WebsiteSDK/commit/f165a652b47b42011eaa9391336e80664189a75b))
* correct typings and make lint pass ([8e01323](https://github.com/hellocustomer/HC.WebsiteSDK/commit/8e01323f9c43642a5edf176b5087c423ad38b5fb))
