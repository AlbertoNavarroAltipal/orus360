// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Skin } from '@core/types'

const colorSchemes = (skin: Skin): Theme['colorSchemes'] => {
  return {
    light: {
      palette: {
        primary: {
          main: '#005daa',
          light: '#005daa',
          dark: '#005daa',
          lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)'
        },
        secondary: {
          main: '#bedefe',
          light: '#bedefe',
          dark: '#bedefe',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)'
        },
        error: {
          main: '#f25444',
          light: '#f25444',
          dark: '#f25444',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)'
        },
        warning: {
          main: '#e8d112',
          light: '#e8d112',
          dark: '#e8d112',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)'
        },
        info: {
          main: '#4698eb',
          light: '#4698eb',
          dark: '#4698eb',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)'
        },
        success: {
          main: '#15b790',
          light: '#15b790',
          dark: '#15b790',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.38)'
        },
        text: {
          primary: `rgb(var(--mui-mainColorChannels-light) / 0.9)`,
          secondary: `rgb(var(--mui-mainColorChannels-light) / 0.7)`,
          disabled: `rgb(var(--mui-mainColorChannels-light) / 0.4)`,
          primaryChannel: 'var(--mui-mainColorChannels-light)',
          secondaryChannel: 'var(--mui-mainColorChannels-light)'
        },
        divider: `rgb(var(--mui-mainColorChannels-light) / 0.12)`,
        dividerChannel: 'var(--mui-mainColorChannels-light)',
        background: {
          default: skin === 'bordered' ? '#FFFFFF' : '#F4F5FA',
          paper: '#FFFFFF'
        },
        action: {
          active: `rgb(var(--mui-mainColorChannels-light) / 0.6)`,
          hover: `rgb(var(--mui-mainColorChannels-light) / 0.04)`,
          selected: `rgb(var(--mui-mainColorChannels-light) / 0.08)`,
          disabled: `rgb(var(--mui-mainColorChannels-light) / 0.3)`,
          disabledBackground: `rgb(var(--mui-mainColorChannels-light) / 0.12)`,
          focus: `rgb(var(--mui-mainColorChannels-light) / 0.1)`,
          focusOpacity: 0.1,
          activeChannel: 'var(--mui-mainColorChannels-light)',
          selectedChannel: 'var(--mui-mainColorChannels-light)'
        },
        Alert: {
          errorColor: 'var(--mui-palette-error-main)',
          warningColor: 'var(--mui-palette-warning-main)',
          infoColor: 'var(--mui-palette-info-main)',
          successColor: 'var(--mui-palette-success-main)',
          errorStandardBg: 'var(--mui-palette-error-lightOpacity)',
          warningStandardBg: 'var(--mui-palette-warning-lightOpacity)',
          infoStandardBg: 'var(--mui-palette-info-lightOpacity)',
          successStandardBg: 'var(--mui-palette-success-lightOpacity)',
          errorFilledColor: 'var(--mui-palette-error-contrastText)',
          warningFilledColor: 'var(--mui-palette-warning-contrastText)',
          infoFilledColor: 'var(--mui-palette-info-contrastText)',
          successFilledColor: 'var(--mui-palette-success-contrastText)',
          errorFilledBg: 'var(--mui-palette-error-main)',
          warningFilledBg: 'var(--mui-palette-warning-main)',
          infoFilledBg: 'var(--mui-palette-info-main)',
          successFilledBg: 'var(--mui-palette-success-main)'
        },
        Avatar: {
          defaultBg: '#F0EFF0'
        },
        Chip: {
          defaultBorder: 'var(--mui-palette-divider)'
        },
        FilledInput: {
          bg: `rgb(var(--mui-mainColorChannels-light) / 0.06)`,
          hoverBg: `rgb(var(--mui-mainColorChannels-light) / 0.08)`,
          disabledBg: `rgb(var(--mui-mainColorChannels-light) / 0.06)`
        },
        LinearProgress: {
          primaryBg: 'var(--mui-palette-primary-mainOpacity)',
          secondaryBg: 'var(--mui-palette-secondary-mainOpacity)',
          errorBg: 'var(--mui-palette-error-mainOpacity)',
          warningBg: 'var(--mui-palette-warning-mainOpacity)',
          infoBg: 'var(--mui-palette-info-mainOpacity)',
          successBg: 'var(--mui-palette-success-mainOpacity)'
        },
        SnackbarContent: {
          bg: '#1A0E33',
          color: 'var(--mui-palette-background-paper)'
        },
        Switch: {
          defaultColor: 'var(--mui-palette-common-white)',
          defaultDisabledColor: 'var(--mui-palette-common-white)',
          primaryDisabledColor: 'var(--mui-palette-common-white)',
          secondaryDisabledColor: 'var(--mui-palette-common-white)',
          errorDisabledColor: 'var(--mui-palette-common-white)',
          warningDisabledColor: 'var(--mui-palette-common-white)',
          infoDisabledColor: 'var(--mui-palette-common-white)',
          successDisabledColor: 'var(--mui-palette-common-white)'
        },
        Tooltip: {
          bg: '#1A0E33'
        },
        TableCell: {
          border: 'var(--mui-palette-divider)'
        },
        customColors: {
          bodyBg: '#F4F5FA',
          chatBg: '#F7F6FA',
          greyLightBg: '#FAFAFA',
          inputBorder: `rgb(var(--mui-mainColorChannels-light) / 0.22)`,
          tableHeaderBg: '#F6F7FB',
          tooltipText: '#FFFFFF',
          trackBg: '#F0F2F8'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#005daa',
          light: '#005daa',
          dark: '#005daa',
          lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)'
        },
        secondary: {
          main: '#bedefe',
          light: '#bedefe',
          dark: '#bedefe',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)'
        },
        error: {
          main: '#f25444',
          light: '#f25444',
          dark: '#f25444',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)'
        },
        warning: {
          main: '#e8d112',
          light: '#e8d112',
          dark: '#e8d112',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)'
        },
        info: {
          main: '#4698eb',
          light: '#4698eb',
          dark: '#4698eb',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)'
        },
        success: {
          main: '#15b790',
          light: '#15b790',
          dark: '#15b790',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.38)'
        },
        text: {
          primary: `rgb(var(--mui-mainColorChannels-dark) / 0.9)`,
          secondary: `rgb(var(--mui-mainColorChannels-dark) / 0.7)`,
          disabled: `rgb(var(--mui-mainColorChannels-dark) / 0.4)`,
          primaryChannel: 'var(--mui-mainColorChannels-dark)',
          secondaryChannel: 'var(--mui-mainColorChannels-dark)'
        },
        divider: `rgb(var(--mui-mainColorChannels-dark) / 0.12)`,
        dividerChannel: 'var(--mui-mainColorChannels-dark)',
        background: {
          default: skin === 'bordered' ? '#0f1b2aff' : '#002551',
          paper: '#0f1b2aff'
        },
        action: {
          active: `rgb(var(--mui-mainColorChannels-dark) / 0.6)`,
          hover: `rgb(var(--mui-mainColorChannels-dark) / 0.04)`,
          selected: `rgb(var(--mui-mainColorChannels-dark) / 0.08)`,
          disabled: `rgb(var(--mui-mainColorChannels-dark) / 0.3)`,
          disabledBackground: `rgb(var(--mui-mainColorChannels-dark) / 0.12)`,
          focus: `rgb(var(--mui-mainColorChannels-dark) / 0.1)`,
          focusOpacity: 0.1,
          activeChannel: 'var(--mui-mainColorChannels-dark)',
          selectedChannel: 'var(--mui-mainColorChannels-dark)'
        },
        Alert: {
          errorColor: 'var(--mui-palette-error-main)',
          warningColor: 'var(--mui-palette-warning-main)',
          infoColor: 'var(--mui-palette-info-main)',
          successColor: 'var(--mui-palette-success-main)',
          errorStandardBg: 'var(--mui-palette-error-lightOpacity)',
          warningStandardBg: 'var(--mui-palette-warning-lightOpacity)',
          infoStandardBg: 'var(--mui-palette-info-lightOpacity)',
          successStandardBg: 'var(--mui-palette-success-lightOpacity)',
          errorFilledColor: 'var(--mui-palette-error-contrastText)',
          warningFilledColor: 'var(--mui-palette-warning-contrastText)',
          infoFilledColor: 'var(--mui-palette-info-contrastText)',
          successFilledColor: 'var(--mui-palette-success-contrastText)',
          errorFilledBg: 'var(--mui-palette-error-main)',
          warningFilledBg: 'var(--mui-palette-warning-main)',
          infoFilledBg: 'var(--mui-palette-info-main)',
          successFilledBg: 'var(--mui-palette-success-main)'
        },
        Avatar: {
          defaultBg: '#3F3B59'
        },
        Chip: {
          defaultBorder: 'var(--mui-palette-divider)'
        },
        FilledInput: {
          bg: `rgb(var(--mui-mainColorChannels-dark) / 0.06)`,
          hoverBg: `rgb(var(--mui-mainColorChannels-dark) / 0.08)`,
          disabledBg: `rgb(var(--mui-mainColorChannels-dark) / 0.06)`
        },
        LinearProgress: {
          primaryBg: 'var(--mui-palette-primary-mainOpacity)',
          secondaryBg: 'var(--mui-palette-secondary-mainOpacity)',
          errorBg: 'var(--mui-palette-error-mainOpacity)',
          warningBg: 'var(--mui-palette-warning-mainOpacity)',
          infoBg: 'var(--mui-palette-info-mainOpacity)',
          successBg: 'var(--mui-palette-success-mainOpacity)'
        },
        SnackbarContent: {
          bg: '#F7F4FF',
          color: 'var(--mui-palette-background-paper)'
        },
        Switch: {
          defaultColor: 'var(--mui-palette-common-white)',
          defaultDisabledColor: 'var(--mui-palette-common-white)',
          primaryDisabledColor: 'var(--mui-palette-common-white)',
          secondaryDisabledColor: 'var(--mui-palette-common-white)',
          errorDisabledColor: 'var(--mui-palette-common-white)',
          warningDisabledColor: 'var(--mui-palette-common-white)',
          infoDisabledColor: 'var(--mui-palette-common-white)',
          successDisabledColor: 'var(--mui-palette-common-white)'
        },
        Tooltip: {
          bg: '#F7F4FF'
        },
        TableCell: {
          border: 'var(--mui-palette-divider)'
        },
        customColors: {
          bodyBg: '#002551',
          chatBg: '#373452',
          greyLightBg: '#373350',
          inputBorder: `rgb(var(--mui-mainColorChannels-dark) / 0.22)`,
          tableHeaderBg: '#3D3759',
          tooltipText: '#0f1b2aff',
          trackBg: '#474360'
        }
      }
    }
  } as Theme['colorSchemes']
}

export default colorSchemes
