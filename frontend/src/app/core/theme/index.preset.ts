import { definePreset } from '@primeuix/themes';
import Nora from '@primeuix/themes/nora';
import { componentsPreset } from './_components.preset';
import { colorSchemePreset } from './_colors.preset';
import { semanticPreset } from './_semantic.preset';

const IndexPreset = definePreset(Nora, {
  // Customizations
  semantic: { ...colorSchemePreset, ...semanticPreset },
  components: { ...componentsPreset },
});

export { IndexPreset };
