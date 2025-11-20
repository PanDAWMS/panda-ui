export const componentsPreset = {
  button: {
    colorScheme: {
      light: {
        root: {
          primary: {
            background: "{primary.600}",
          }
        }
      }
    }
  },
  datatable: {
    header: {
      borderWidth: "0 0 0 0",
      padding: ".5rem .5rem"
    },
    headerCell: {
      selectedBackground: "{primary.300}",
      selectedColor: "{gray.900}",
      gap: ".25rem",
      padding: ".25rem .5rem"
    },
    bodyCell: {
      padding: ".25rem 0.5rem"
    },
    footerCell: {
      padding: ".5rem .5rem"
    },
    filter: {
      inlineGap: "0.25rem",
    }
  },
  menubar: {
    root: {
        borderColor: "{surface.900}",
        borderRadius: "0",
        color: "{surface.50}",
        gap: "0",
        padding: "0",
    },
    baseItem: {
        borderRadius: "0",
        padding: "0.75rem"
    },
    item: {
        focusBackground: "{surface.800}",
        activeBackground: "{surface.800}",
        color: "{surface.50}",
        focusColor: "{surface.50}",
        activeColor: "{surface.50}",
        padding: "0.75rem",
        borderRadius: "0",
        gap: "0.25rem",
        // icon: {
        //     color: "{navigation.item.icon.color}",
        //     focusColor: "{navigation.item.icon.focus.color}",
        //     activeColor: "{navigation.item.icon.active.color}"
        // }
    },
    submenu: {
        padding: "0 0",
        gap: "{navigation.list.gap}",
        background: "{surface.900}",
        borderColor: "{surface.900}",
        borderRadius: "0",
        shadow: "{overlay.navigation.shadow}",
        mobileIndent: "1.25rem",
        // icon: {
        //     size: "{navigation.submenu.icon.size}",
        //     color: "{navigation.submenu.icon.color}",
        //     focusColor: "{navigation.submenu.icon.focus.color}",
        //     activeColor: "{navigation.submenu.icon.active.color}"
        // }
    },
    // separator: {
    //     borderColor: "{content.border.color}"
    // },
    // mobileButton: {
    //     borderRadius: "50%",
    //     size: "2rem",
    //     color: "{text.muted.color}",
    //     hoverColor: "{text.hover.muted.color}",
    //     hoverBackground: "{content.hover.background}",
    //     focusRing: {
    //         width: "{focus.ring.width}",
    //         style: "{focus.ring.style}",
    //         color: "{focus.ring.color}",
    //         offset: "{focus.ring.offset}",
    //         shadow: "{focus.ring.shadow}"
    //     }
    // },
    colorScheme: {
        light: {
            root: {
                background: "{surface.900}"
            }
        },
        dark: {
            root: {
                background: "{surface.100}"
            }
        }
    }
},
};

