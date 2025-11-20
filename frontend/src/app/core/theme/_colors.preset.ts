import {palette} from '@primeuix/themes';

export const colorSchemePreset = {
  // primary: {
  //   50:  '#fafcfd',
  //   100: '#d3e0e9',
  //   200: '#bacedb',
  //   300: '#93b2c7',
  //   400: '#6c97b4',
  //   500: '#5484a4',
  //   600: '#4b7693',
  //   700: '#436982',
  //   800: '#3a5b71',
  //   900: '#314d60',
  //   950: '#29404f'
  // },
  primary: palette("#5e829a"),
  colorScheme: {
    light: {
      primary: {
        color: "{primary.500}",
        contrastColor: "#ffffff",
        hoverColor: "{primary.600}",
        activeColor: "{primary.700}"
      },
      surface: palette("#7f7f7f"),
    },
  }
};
