export const componentsPreset = {
  button: {
    colorScheme: {
      light: {
        root: {
          primary: {
            background: '{primary.600}',
          },
        },
      },
    },
  },
  checkbox: {
    root: {
      width: '1.25rem',
      height: '1.25rem',
    },
  },
  datatable: {
    header: {
      borderWidth: '0 0 0 0',
      padding: '.5rem .5rem',
    },
    headerCell: {
      selectedBackground: '{primary.300}',
      selectedColor: '{gray.900}',
      gap: '.25rem',
      padding: '.25rem .5rem',
    },
    bodyCell: {
      padding: '.25rem 0.5rem',
    },
    footerCell: {
      padding: '.5rem .5rem',
    },
    filter: {
      inlineGap: '0.25rem',
    },
  },
  menubar: {
    root: {
      borderColor: '{surface.900}',
      borderRadius: '0',
      color: '{surface.50}',
      gap: '0',
      padding: '0',
    },
    baseItem: {
      borderRadius: '0',
      padding: '0.75rem',
    },
    item: {
      focusBackground: '{surface.800}',
      activeBackground: '{surface.800}',
      color: '{surface.50}',
      focusColor: '{surface.50}',
      activeColor: '{surface.50}',
      padding: '0.5rem 0.75rem',
      borderRadius: '0',
      gap: '0.25rem',
    },
    submenu: {
      padding: '0 0',
      gap: '{navigation.list.gap}',
      background: '{surface.900}',
      borderColor: '{surface.900}',
      borderRadius: '0',
      shadow: '{overlay.navigation.shadow}',
      mobileIndent: '1.25rem',
    },
    colorScheme: {
      light: {
        root: {
          background: '{surface.900}',
        },
      },
      dark: {
        root: {
          background: '{surface.100}',
        },
      },
    },
  },
  paginator: {
    root: {
      padding: '0.5rem',
      gap: '0',
    },
    navButton: {
      width: '2rem',
      height: '2rem',
      borderRadius: '0',
    },
  },
};
