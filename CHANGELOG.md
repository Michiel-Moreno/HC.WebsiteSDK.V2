# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 3.0.0 (2025-10-24)


### Features

* add ARIA attributes and focus management to ModalSurvey for accessibility ([2181e15](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/2181e15098de9f7d8dfad9d0c0289e023c15b42c))
* add ButtonTriggerSurvey for floating feedback buttons ([12a8465](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/12a84652360db65ac6ad2b63e10c44c224be94a6))
* add DOM removal detection and cross-survey testing ([db0c471](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/db0c471547724007a582ad9cb838d0d5b6336c6d))
* add dynamic URL configuration updates to survey instances ([67679f7](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/67679f76ab7798b1dadd2e132aacca03b8ab66c6))
* add getRemainingDays() method to quarantine service ([ca49a7e](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/ca49a7e6a07d0de43549c15bd95a4e6189599de3))
* add inline survey ([8c9c97a](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/8c9c97a60eb39c1fcef711dac8ea4ab8cb8c058b))
* add installation instructions ([2cde6d5](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/2cde6d5779a767aa3dc7c0873b7f45475eca366c))
* add lifecycle callbacks to survey components ([2e3a577](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/2e3a57724a1b24d99873b7ac8fb4e8574b380b36))
* add modal survey ([02953b3](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/02953b3eee37533c7d5110b91ccb2a59cd025b27))
* add multi-language support (i18n) to ButtonTriggerSurvey ([30cc405](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/30cc4056e7ab806503ef859f00df38d696adb39f))
* add PostMessage communication to InlineSurvey and ModalSurvey ([27027d4](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/27027d4350667ab6061f67eae16780da4bb50657))
* add rollup configuration ([7f2eb45](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/7f2eb4580d8af7d4e3039a47acfb913a8ef6e6f7))
* add survey quarantine ([143fada](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/143fadae8b7d805fe63dbeee0b1b595d2b33c520))
* add window survey ([f24e746](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/f24e7460c299ddb38fd78ba66823f0ca8c975dc2))
* basic library setup ([d026a49](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/d026a495285837e023b570717c3b60efa36e1e5f))
* implement focus trap for ModalSurvey to achieve WCAG 2.1 AA compliance ([9113e73](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/9113e734c668bdf3ccafb84281dee8844ca53a26))
* optimize CDN bundle ([a95bc6f](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/a95bc6f870ec0a1eb776793b1008a19f13f62f8a))
* set quarantine per touchpoint ([1ad360f](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/1ad360fa6de784ee5a7d0c5af65257da3a27472a))

### Bug Fixes

* add CSS deduplication to prevent memory leaks in StyledElementFactory ([b5b4171](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/b5b4171b4260b2cccc754c85160272389f4be001))
* add destroy() methods and fix memory leaks in survey components ([912e0fa](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/912e0fab277290840125311f9bc54feacd28fb25))
* align tests with new URL format and clean up legacy code ([eb3e555](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/eb3e555988c11b28c2e8acd649e8abe6fd5b31b0))
* change modal survey max-width to 685px ([45e030d](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/45e030da3995ff1b2c3c06ee9d9361ed0cfcb91f))
* change test runner from ava to jest ([f165a65](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/f165a652b47b42011eaa9391336e80664189a75b))
* correct typings and make lint pass ([8e01323](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/8e01323f9c43642a5edf176b5087c423ad38b5fb))
* fix modal layput on firefox ([1bce886](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/1bce886129061ce7a6ea44328788502c767d037f))
* resolve security vulnerabilities (automated fixes) ([e1628e8](https://github.com/hellocustomer/HC.WebsiteSDK.V2/commit/e1628e8fb5d767ccb6341dc2704786fd0c38fcd2))

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
