import { palette } from '@primeuix/themes';

export const colorSchemePreset = {
  primary: palette('#4a7eae'),
  colorScheme: {
    light: {
      primary: {
        color: '{primary.500}',
        contrastColor: '#ffffff',
        hoverColor: '{primary.600}',
        activeColor: '{primary.700}',
      },
      surface: palette('#7f7f7f'),
    },
  },
};
