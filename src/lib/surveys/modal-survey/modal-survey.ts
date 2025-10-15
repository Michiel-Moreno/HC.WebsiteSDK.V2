import { InvalidQuerySelectorException } from '../../core/exceptions/invalid-query-selector.exception';
import { StyledElementFactory } from '../../core/factories/styled-element.factory';
import { UrlFactory } from '../../core/factories/url.factory';
import { trueByDefault } from '../../core/utils/true-by-default.util';
import { UrlBuilder } from '../../url-builder/url.builder';
import { QuarantineService } from '../common/quarantine.service';

import { ClassNamesConfigType } from './class-names-config.type';
import { ModalSurveyConfig } from './modal-survey-config.interface';
import * as modalDefaultStyles from './modal-survey-defaults.style';
import { modalSurveyLogoFactory } from './modal-survey-logo.element-factory';
import { ModalSurveyStyleConfig } from './modal-survey-style-config.interface';
import { ModalSurveyConfigValidator } from './modal-survey.config-validator';
import { closeIconSvgElementFactory } from './modal-survey.svg-factory';

/**
 * Class builds a modal with iframe, providing multiple configuration options.
 * All styles and class names used by the library can be easily overwritten,
 * by passing new values in the configuration object.
 *
 * ### Modal structure
 *
 * The structure of the modal can be described as follows:
 * ```html
 * <div class="hello-customer-modal">
 *   <div class="hello-customer-modal__window">
 *      <div class="hello-customer-modal__bar">
 *          <div class="hello-customer-modal__close-button">
 *              ICON
 *          </div>
 *      </div>
 *      <iframe class="hello-customer-survey__survey"></iframe>
 *   </div>
 * </div>
 * ```
 * Provided class names are the once defined by the library itself by default,
 * and can be overwritten using ```classNames``` property of the configuration object.
 *
 * In order to modify styles attached to the modal elements using aforementioned class names,
 * You can use ```modalStyle``` property of the configuration object,
 * ### Example (es module)
 * ```js
 * import { UrlBuilder, InlineSurvey } from '@hello-customer/website-touchpoint'
 * const urlBuilder = new UrlBuilder({
 *   baseUrl: 'https://base.com',
 *   language: 'EN',
 *   tenantId: 'xxxx',
 *   touchPointId: 'zzz',
 *   extra: {
 *     isPreview: true
 *   }
 * });
 * const modalSurvey = new ModalSurvey(urlBuilder, {});
 * ```
 * ### Example (script tag)
 * ```html
 * <script src="https://unpkg.com/@hello-customer/website-touchpoint"></script>
 * <script>
 * const urlBuilder = new hcWebsiteTouchpoint.UrlBuilder({
 *     baseUrl: 'https://base.com',
 *     tenantId: 'xxxx',
 *     touchPointId: 'zzz',
 *     language: 'EN',
 *     extra: {
 *       isPreview: true
 *     }
 *    });
 * const modalSurvey = new  hcWebsiteTouchpoint.ModalSurvey(urlBuilder, {});
 * </script>
 * ```
 *
 * @category Surveys
 */
export class ModalSurvey {
  private readonly iFrameHandle: HTMLIFrameElement;
  private readonly modalHandle: HTMLDivElement;
  private readonly urlFactory: UrlFactory;
  private readonly validator: ModalSurveyConfigValidator;
  private readonly quarantineService: QuarantineService;
  private eventListeners: Array<{
    element: HTMLElement | Window;
    event: string;
    handler: EventListener;
  }> = [];

  constructor(
    configBuilder: UrlBuilder,
    private modalConfig: ModalSurveyConfig,
  ) {
    this.urlFactory = configBuilder.getUrlFactory();
    this.validator = new ModalSurveyConfigValidator();
    this.validator.validateAndThrowOnErrors(modalConfig);
    this.quarantineService = new QuarantineService(
      this.urlFactory.getSurveyIdentifier(),
      modalConfig.quarantineConfig,
    );
    const [root, frame] = this.createModal();
    this.iFrameHandle = frame;
    this.modalHandle = root;
    if (!this.modalConfig.ignoreDefaultStyles) this.initModalClasses();
    this.reload();
    if (this.modalConfig.showByDefault) this.show();
    else this.close();
  }

  public get modalContainer(): HTMLDivElement {
    return this.modalHandle;
  }

  public get iFrame(): HTMLIFrameElement {
    return this.iFrameHandle;
  }

  /**
   * Close modal window
   */
  public close(): void {
    const styleClasses = this.getClassNames();
    this.modalHandle.classList.remove(styleClasses.modalVisible);
    this.modalConfig.callbacks?.onClose?.();
  }

  /**
   * Open modal window
   */
  public show(): void {
    if (!this.quarantineService.isUnderQuarantine()) {
      const styleClasses = this.getClassNames();
      this.modalHandle.classList.add(styleClasses.modalVisible);
      this.quarantineService.startQuarantine();
      this.modalConfig.callbacks?.onShow?.();
    } else {
      const remainingDays = this.quarantineService.getRemainingDays();
      this.modalConfig.callbacks?.onQuarantineBlocked?.(remainingDays);
    }
  }

  /**
   * Reload iframe content using url from attached url factory object
   */
  public reload(): void {
    this.iFrameHandle.src = this.urlFactory.getUrlWithParams();
  }

  /**
   * Destroy modal and clean up all event listeners
   * Removes modal from DOM and prevents memory leaks
   */
  public destroy(): void {
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Remove from DOM
    if (this.modalHandle.parentElement) {
      this.modalHandle.parentElement.removeChild(this.modalHandle);
    }

    this.modalConfig.callbacks?.onDestroy?.();
  }

  /**
   * Add event listener and track it for cleanup
   * @private
   */
  private addTrackedListener(
    element: HTMLElement | Window,
    event: string,
    handler: EventListener,
  ): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  private getModalStyle(): Required<ModalSurveyStyleConfig> {
    return {
      rootDivStyle: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.rootDivStyle || {}
        : {
            ...modalDefaultStyles.rootDivStyle,
            ...this.modalConfig?.modalStyle?.rootDivStyle,
          },
      iFrameStyle: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.iFrameStyle || {}
        : {
            ...modalDefaultStyles.iFrameStyle,
            ...this.modalConfig?.modalStyle?.iFrameStyle,
          },
      windowBarDivStyle: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.windowBarDivStyle || {}
        : {
            ...modalDefaultStyles.windowBarDivStyle,
            ...this.modalConfig?.modalStyle?.windowBarDivStyle,
          },
      windowCloseButtonStyle: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.windowCloseButtonStyle || {}
        : {
            ...modalDefaultStyles.windowCloseButtonStyle,
            ...this.modalConfig?.modalStyle?.windowCloseButtonStyle,
          },
      windowDivStyle: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.windowDivStyle || {}
        : {
            ...modalDefaultStyles.windowDivStyle,
            ...this.modalConfig?.modalStyle?.windowDivStyle,
          },
      modalTranslucentBackground: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.modalTranslucentBackground || {}
        : {
            ...modalDefaultStyles.modalTranslucentBackground,
            ...this.modalConfig?.modalStyle?.modalTranslucentBackground,
          },
      modalVisible: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.modalVisible || {}
        : {
            ...modalDefaultStyles.modalVisible,
            ...this.modalConfig?.modalStyle?.modalVisible,
          },
      footerStyle: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.footerStyle || {}
        : {
            ...modalDefaultStyles.footerStyle,
            ...this.modalConfig?.modalStyle?.footerStyle,
          },
      footerLogoStyle: this.modalConfig.ignoreDefaultStyles
        ? this.modalConfig?.modalStyle?.footerLogoStyle || {}
        : {
            ...modalDefaultStyles.logoStyle,
            ...this.modalConfig?.modalStyle?.footerLogoStyle,
          },
    };
  }

  private getClassNames(): Required<ClassNamesConfigType> {
    return {
      rootDivStyle:
        this.modalConfig?.classNames?.rootDivStyle ||
        modalDefaultStyles.classNames.rootDivStyle,
      windowBarDivStyle:
        this.modalConfig?.classNames?.windowBarDivStyle ||
        modalDefaultStyles.classNames.windowBarDivStyle,
      windowDivStyle:
        this.modalConfig?.classNames?.windowDivStyle ||
        modalDefaultStyles.classNames.windowDivStyle,
      windowCloseButtonStyle:
        this.modalConfig?.classNames?.windowCloseButtonStyle ||
        modalDefaultStyles.classNames.windowCloseButtonStyle,
      iFrameStyle:
        this.modalConfig?.classNames?.iFrameStyle ||
        modalDefaultStyles.classNames.iFrameStyle,
      modalVisible:
        this.modalConfig?.classNames?.modalVisible ||
        modalDefaultStyles.classNames.modalVisible,
      modalTranslucentBackground:
        this.modalConfig?.classNames?.modalTranslucentBackground ||
        modalDefaultStyles.classNames.modalTranslucentBackground,
      footerStyle:
        this.modalConfig?.classNames?.footerStyle ||
        modalDefaultStyles.classNames.footerStyle,
      footerLogoStyle:
        this.modalConfig?.classNames?.footerLogoStyle ||
        modalDefaultStyles.classNames.footerLogoStyle,
    };
  }

  /**
   * Init modal state classes
   *
   * @private
   */
  private initModalClasses(): void {
    const modalStyle = this.getModalStyle();
    const styleClasses = this.getClassNames();
    StyledElementFactory.appendCssClassToHeader(
      modalStyle.modalVisible,
      styleClasses.modalVisible,
    );
    Object.entries(modalDefaultStyles.medias).forEach(([media, rules]) =>
      StyledElementFactory.addMediaRule(
        media,
        Object.entries(rules).reduce(
          (total, current) => ({
            ...total,
            [styleClasses[current[0] as keyof ModalSurveyStyleConfig]]:
              current[1],
          }),
          {},
        ),
      ),
    );
  }

  /**
   * Creates modal using provided or default configuration
   *
   * @private
   */
  private createModal(): [HTMLDivElement, HTMLIFrameElement] {
    const modalStyle = this.getModalStyle();
    const styleClasses = this.getClassNames();
    const iFrame = new StyledElementFactory(
      document.createElement('iframe'),
    ).applyClass(
      styleClasses.iFrameStyle,
      modalStyle.iFrameStyle,
    ).styledElement;

    // Add event listeners for iframe load and error
    iFrame.addEventListener('load', () => {
      this.modalConfig.callbacks?.onLoad?.(iFrame);
    });

    iFrame.addEventListener('error', () => {
      const error = new Error('Failed to load survey iframe');
      this.modalConfig.callbacks?.onError?.(error);
    });

    const footer = new StyledElementFactory(
      document.createElement('div'),
    ).applyClass(
      styleClasses.footerStyle,
      modalStyle.footerStyle,
    ).styledElement;
    footer.appendChild(
      modalSurveyLogoFactory(
        styleClasses.footerLogoStyle,
        modalStyle.footerLogoStyle,
      ),
    );

    const closeButton = new StyledElementFactory(
      document.createElement('div'),
    ).applyClass(
      styleClasses.windowCloseButtonStyle,
      modalStyle.windowCloseButtonStyle,
    ).styledElement;
    closeButton.appendChild(closeIconSvgElementFactory('#eeeeee'));

    const windowBar = new StyledElementFactory(
      document.createElement('div'),
    ).applyClass(
      styleClasses.windowBarDivStyle,
      modalStyle.windowBarDivStyle,
    ).styledElement;

    const windowDiv = new StyledElementFactory(
      document.createElement('div'),
    ).applyClass(
      styleClasses.windowDivStyle,
      modalStyle.windowDivStyle,
    ).styledElement;
    windowDiv.appendChild(windowBar);
    windowDiv.appendChild(iFrame);
    windowDiv.appendChild(footer);

    const modalRoot = new StyledElementFactory(document.createElement('div'))
      .applyClass(styleClasses.rootDivStyle, modalStyle.rootDivStyle)
      .applyClassConditionally(
        trueByDefault(this.modalConfig.translucentBackground),
        styleClasses.modalTranslucentBackground,
        modalStyle.modalTranslucentBackground,
      ).styledElement;
    modalRoot.appendChild(windowDiv);

    // add behaviour
    if (trueByDefault(this.modalConfig.closeButton)) {
      windowBar.appendChild(closeButton);
      this.addTrackedListener(closeButton, 'click', () => this.close());
    }
    this.addTrackedListener(windowDiv, 'click', (e) => e.stopPropagation());
    if (trueByDefault(this.modalConfig.closeOnEscape)) {
      this.addTrackedListener(window, 'keydown', (event: Event) => {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === 'Escape' || keyEvent.key === 'Esc') this.close();
      });
    }
    if (trueByDefault(this.modalConfig.closeOnBackgroundClick))
      this.addTrackedListener(modalRoot, 'click', () => this.close());
    if (this.modalConfig.modalContainerSelector) {
      const root = document.querySelector(
        this.modalConfig.modalContainerSelector,
      );
      if (!root)
        throw new InvalidQuerySelectorException(
          `[Hello Customer SDK] HTML element for ${this.modalConfig.modalContainerSelector} selector not found!`,
        );
      root.appendChild(modalRoot);
    } else document.body.appendChild(modalRoot);
    return [modalRoot, iFrame];
  }
}
