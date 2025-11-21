import { definePreset, palette } from '@primeuix/themes';
import Nora from '@primeuix/themes/nora';
import { componentsPreset } from './_components.preset';
import { colorSchemePreset } from './_colors.preset';

const IndexPreset = definePreset(Nora, {
  // Customizations
  semantic: { ...colorSchemePreset },
  components: { ...componentsPreset },
});

export { IndexPreset };
