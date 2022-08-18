import { ref, computed, reactive, toRef } from 'vue';
import { Attribute } from '../utils/attribute';
import { DateInfoDayContext } from '../utils/dateInfo';
import {
  GlyphRenderer,
  Glyph,
  ContentRenderer,
  HighlightRenderer,
  DotRenderer,
  BarRenderer,
} from '../utils/glyph';
import { DarkModeConfig, useDarkMode } from './darkMode';

export interface ThemeConfig {
  color?: string;
  isDark?: DarkModeConfig;
}

export type Glyphs = Record<string, Glyph[]>;

export interface Theme {
  color: string;
  isDark: DarkModeConfig;
  displayMode: string;
  normalizeGlyphs(attr: Attribute): void;
  prepareRender(glyphs: Glyphs): Glyphs;
  render(attr: Attribute, ctx: DateInfoDayContext, glyphs: Glyphs): void;
}

export function useTheme(config: ThemeConfig): Theme {
  const color = ref(config.color || 'blue');
  const darkConfig = toRef(config, 'isDark');
  const { isDark, displayMode } = useDarkMode(darkConfig);

  const renderers: GlyphRenderer<Glyph>[] = [
    new ContentRenderer(),
    new HighlightRenderer(),
    new DotRenderer(),
    new BarRenderer(),
  ];

  function normalizeGlyphs(attr: Attribute) {
    renderers.forEach(renderer => {
      const { type } = renderer;
      if (attr.hasOwnProperty(type) && attr[type]) {
        attr[type] = renderer.normalizeConfig(color.value, attr[type]);
      }
    });
  }

  function prepareRender(glyphs: Glyphs = {}) {
    renderers.forEach(renderer => {
      renderer.prepareRender(glyphs);
    });
    return glyphs;
  }

  function render(attr: Attribute, ctx: DateInfoDayContext, glyphs: Glyphs) {
    renderers.forEach(renderer => {
      renderer.render(attr, ctx, glyphs);
    });
  }

  return reactive({
    color,
    isDark,
    displayMode,
    normalizeGlyphs,
    prepareRender,
    render,
  });
}
