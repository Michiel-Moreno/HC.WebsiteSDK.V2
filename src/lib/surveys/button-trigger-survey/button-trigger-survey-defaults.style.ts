import { ButtonPosition } from './button-position.type';
import { ButtonStylePreset } from './button-style-preset.type';
import { ButtonTriggerStyleConfig } from './button-trigger-survey-config.interface';

/**
 * Default class names
 *
 * @category Button Trigger
 */
export const classNames = {
  buttonContainer: 'hello-customer-button-trigger',
  button: 'hello-customer-button-trigger__button',
  buttonIcon: 'hello-customer-button-trigger__icon',
  buttonText: 'hello-customer-button-trigger__text',
  buttonVisible: 'hello-customer-button-trigger--visible',
  buttonHidden: 'hello-customer-button-trigger--hidden',
};

/**
 * Position styles mapping
 *
 * @category Button Trigger
 */
export const positionStyles: Record<
  ButtonPosition,
  Partial<CSSStyleDeclaration>
> = {
  'bottom-right': {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
  },
  'bottom-left': {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
  },
  'top-right': {
    position: 'fixed',
    top: '20px',
    right: '20px',
  },
  'top-left': {
    position: 'fixed',
    top: '20px',
    left: '20px',
  },
  'left-center': {
    position: 'fixed',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  'right-center': {
    position: 'fixed',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  'bottom-center': {
    position: 'fixed',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  'top-center': {
    position: 'fixed',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  },
};

/**
 * Style preset configurations
 *
 * @category Button Trigger
 */
export const stylePresets: Record<ButtonStylePreset, ButtonTriggerStyleConfig> =
  {
    'pill-button': {
      buttonStyle: {
        padding: '12px 24px',
        backgroundColor: '#003161',
        color: '#ffffff',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      buttonHoverStyle: {
        backgroundColor: '#004a8f',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
        transform: 'translateY(-2px)',
      },
      buttonTextStyle: {
        margin: '0',
        padding: '0',
      },
      buttonIconStyle: {
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    'circle-button': {
      buttonStyle: {
        width: '56px',
        height: '56px',
        backgroundColor: '#003161',
        color: '#ffffff',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
      },
      buttonHoverStyle: {
        backgroundColor: '#004a8f',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
        transform: 'scale(1.1)',
      },
      buttonIconStyle: {
        width: '24px',
        height: '24px',
      },
    },
    'side-tab': {
      buttonStyle: {
        padding: '16px 12px',
        backgroundColor: '#003161',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px 0 0 8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transition: 'all 0.3s ease',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      buttonHoverStyle: {
        backgroundColor: '#004a8f',
        transform: 'translateX(-4px)',
      },
    },
    banner: {
      buttonStyle: {
        width: '100vw',
        left: '0',
        right: '0',
        margin: '0',
        padding: '12px 24px',
        backgroundColor: '#003161',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      buttonHoverStyle: {
        backgroundColor: '#004a8f',
      },
    },
  };

/**
 * Animation styles
 *
 * @category Button Trigger
 */
export const animationStyles = {
  visible: {
    opacity: '1',
    visibility: 'visible' as const,
    transition: 'all 0.3s ease-in',
  },
  hidden: {
    opacity: '0',
    visibility: 'hidden' as const,
    transition: 'all 0.3s ease-out',
  },
};

/**
 * Base container style
 *
 * @category Button Trigger
 */
export const baseContainerStyle: Partial<CSSStyleDeclaration> = {
  zIndex: '9999',
  pointerEvents: 'auto',
};

/**
 * Responsive media queries
 *
 * @category Button Trigger
 */
export const medias: Record<
  string,
  Record<string, Partial<CSSStyleDeclaration>>
> = {
  '(max-width: 768px)': {
    [classNames.button]: {
      fontSize: '12px',
      padding: '10px 20px',
    },
  },
};
