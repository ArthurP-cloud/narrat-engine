import { AppOptions } from './types/app-types';
import { error, warning } from './utils/error-handling';
import { useConfig } from './stores/config-store';
import { Config, defaultConfig } from './config/config-output';
import {
  DEFAULT_DIALOG_WIDTH,
  EMPTY_SCREEN,
  defaultScreenConfig,
} from './constants';
import {
  defaultItemsConfig,
  ItemsInputConfigSchema,
} from './config/items-config';
import {
  defaultScreensConfig,
  ScreenConfig,
  ScreensInputConfigSchema,
} from './config/screens-config';
import {
  ButtonsConfigSchema,
  defaultButtonsConfig,
  ButtonConfig,
} from './config/buttons-config';
import {
  defaultSkillsConfig,
  SkillsInputConfigSchema,
} from './config/skills-config';
import {
  defaultScriptsConfig,
  ScriptsConfigSchema,
} from './config/common-config';
import {
  AudioInputConfigSchema,
  defaultAudioConfig,
} from './config/audio-config';
import {
  defaultQuestsConfig,
  QuestsConfigSchema,
} from './config/quests-config';
import { loadDataFile } from './utils/ajax';
import { ConfigInput, ConfigInputSchema } from './config/config-input';
import Ajv from 'ajv';
import { transitionSettings } from './utils/transition';
import {
  defaultTooltipsConfig,
  TooltipsConfigSchema,
} from './config/tooltips-config';
import {
  CharactersFilesConfigSchema,
  defaultCharactersConfig,
} from './config/characters-config';
import {
  AchievementsInputConfigSchema,
  defaultAchievementsConfig,
} from './config/achievements-config';
import {
  SkillChecksInputConfigSchema,
  defaultSkillChecksConfig,
} from './config/skillchecks-config';
import {
  ChoicesInputConfigSchema,
  defaultChoicesConfig,
} from './config/choices-config';

let config: Config;

// List of config keys loaded from split files

// 0: key, 1: schema, 2: default value
const splitConfigs = [
  ['items', ItemsInputConfigSchema, defaultItemsConfig],
  ['achievements', AchievementsInputConfigSchema, defaultAchievementsConfig],
  ['screens', ScreensInputConfigSchema, defaultScreensConfig],
  ['skills', SkillsInputConfigSchema, defaultSkillsConfig],
  ['skillChecks', SkillChecksInputConfigSchema, defaultSkillChecksConfig],
  ['buttons', ButtonsConfigSchema, defaultButtonsConfig],
  ['scripts', ScriptsConfigSchema, defaultScriptsConfig],
  ['audio', AudioInputConfigSchema, defaultAudioConfig],
  ['quests', QuestsConfigSchema, defaultQuestsConfig],
  ['tooltips', TooltipsConfigSchema, defaultTooltipsConfig],
  ['characters', CharactersFilesConfigSchema, defaultCharactersConfig],
  ['choices', ChoicesInputConfigSchema, defaultChoicesConfig],
] as const;

// List of other keys that are simply copied from input config to new config
const baseConfigKeys = [
  'baseAssetsPath',
  'baseDataPath',
  'gameTitle',
  'saveFileName',
  'images',
  'layout',
  'settings',
  'gameFlow',
  'dialogPanel',
  'splashScreens',
  'notifications',
  'hudStats',
  'interactionTags',
  'transitions',
  'menuButtons',
  'debugging',
  'saves',
] as const;

const ajv = new Ajv({ allErrors: true });

export async function setupConfig(configInput: ConfigInput) {
  const newConfig: Config = { ...defaultConfig };
  // Setup the base keys from the config
  for (const baseConfigKey of baseConfigKeys) {
    const value = configInput[baseConfigKey];
    if (value) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        newConfig[baseConfigKey] = {
          ...(newConfig[baseConfigKey] as any),
          ...value,
        };
      } else {
        newConfig[baseConfigKey] = value as any;
      }
    }
  }
  // Setup all the split config keys
  for (const splitConfig of splitConfigs) {
    const key = splitConfig[0];
    const schema = splitConfig[1];
    const defaultValue = splitConfig[2];
    let currentValue = configInput[key];
    if (currentValue && typeof currentValue === 'string') {
      try {
        currentValue = await loadDataFile<any>(
          getSplitConfigUrl(configInput.baseDataPath!, currentValue),
        );
        const result = ajv.validate(schema, currentValue);
        if (!result) {
          console.error(ajv.errors);
          throw new Error(`${ajv.errorsText()}`);
        }
      } catch (e) {
        console.error(e);
        error(`${key} config error: ${e}`);
        currentValue = { ...defaultValue } as any;
      }
    }
    if (currentValue) {
      if (Array.isArray(currentValue)) {
        newConfig[key] = currentValue as any;
      } else if (typeof currentValue === 'object') {
        newConfig[key] = { ...defaultValue, ...currentValue } as any;
      } else {
        newConfig[key] = currentValue as any;
      }
    }
  }
  config = newConfig;
  if (configInput.skills && configInput)
    if (config.transitions) {
      for (const key in config.transitions) {
        if (!transitionSettings[key]) {
          transitionSettings[key] = config.transitions[key];
        } else {
          Object.assign(transitionSettings[key], config.transitions[key]);
        }
      }
    }
  return newConfig;
}
export async function loadConfig(options: AppOptions) {
  const userConfig = await loadDataFile<ConfigInput>(options.configPath);
  if (options.baseAssetsPath) {
    userConfig.baseAssetsPath = options.baseAssetsPath;
  } else {
    userConfig.baseAssetsPath = userConfig.baseAssetsPath || '';
  }
  if (options.baseDataPath) {
    userConfig.baseDataPath = options.baseDataPath;
  } else {
    userConfig.baseDataPath = userConfig.baseDataPath || '';
  }
  const result = ajv.validate(ConfigInputSchema, userConfig);
  if (!result) {
    error(`Config file validation failed.`);
    console.log(ajv.errors);
    error(ajv.errorsText());
  }
  return setupConfig(userConfig);
}

export function getConfig(): Config {
  return useConfig().config;
}
export function audioConfig() {
  return getConfig().audio;
}
export function audioFileConfig(key: string) {
  const res = audioConfig().files[key];
  if (!res) {
    warning(`Audio file ${key} doesn't exist`);
    return undefined;
  }
  return res;
}
export function getAudioFadeTimings(audio: string) {
  const audioConf = audioFileConfig(audio);
  const fadeInDelay =
    (audioConf?.fadeInDelay ?? audioConfig().options.musicFadeInDelay) * 1000;
  const fadeInTime =
    (audioConf?.fadeInTime ?? audioConfig().options.musicFadeInTime) * 1000;
  const fadeOutTime =
    (audioConf?.fadeOutTime ?? audioConfig().options.musicFadeOutTime) * 1000;
  return {
    fadeInDelay,
    fadeInTime,
    fadeOutTime,
  };
}

export function skillsConfig() {
  return getConfig().skills;
}
export function skillChecksConfig() {
  return getConfig().skillChecks;
}
export function itemsConfig() {
  return getConfig().items;
}
export function questsConfig() {
  return getConfig().quests;
}
export function screensConfig() {
  return getConfig().screens;
}
export function buttonsConfig() {
  return getConfig().buttons;
}
export function tooltipsConfig() {
  return getConfig().tooltips;
}
export function charactersConfig() {
  return getConfig().characters;
}
export function choicesConfig() {
  return getConfig().choices;
}

export function getChoicePromptConfig(flag: string) {
  return choicesConfig().choicePrompts[flag];
}

export function getScreenConfig(screen: string): ScreenConfig {
  if (screen === EMPTY_SCREEN) {
    return defaultScreenConfig;
  }
  if (!screensConfig().screens[screen]) {
    error(`Screen config for screen ${screen} doesn't exist`);
    return defaultScreenConfig;
  }
  return screensConfig().screens[screen];
}

export function getTooltipConfig(keyword: string) {
  const config = tooltipsConfig();
  const data = config.tooltips.find((k) => k.keywords.includes(keyword));
  if (!data) {
    error(`Tooltip config for keyword ${keyword} not found`);
    return null;
  }
  return data;
}

export function getSkillConfig(id: string) {
  const skill = getConfig().skills.skills[id];
  if (!skill) {
    error(`Skill config for skill ${id} doesn't exist`);
  }
  return skill;
}

export function getSkillCheckConfig(id: string) {
  const skillCheck = getConfig().skillChecks.skillChecks[id];
  if (!skillCheck) {
    error(`Skill check config for skill check ${id} doesn't exist`);
  }
  return skillCheck;
}
export function skillCheckConfigExists(id: string) {
  return !!getConfig().skillChecks.skillChecks[id];
}

export function getImageUrl(imageKeyOrUrl: string) {
  if (imageKeyOrUrl.startsWith('http')) {
    return imageKeyOrUrl;
  }
  if (getConfig().images[imageKeyOrUrl]) {
    return getAssetUrl(getConfig().images[imageKeyOrUrl]);
  } else {
    return getAssetUrl(imageKeyOrUrl);
  }
}

export function getAssetUrl(assetPath: string) {
  if (assetPath.startsWith('http')) {
    return assetPath;
  }
  if (getConfig().baseAssetsPath) {
    return `${getConfig().baseAssetsPath}${assetPath}`;
  } else {
    return assetPath;
  }
}

export function getSplitConfigUrl(basePath: string, url: string) {
  return `${basePath}${url}`;
}

export function getDataUrl(dataPath: string) {
  if (getConfig().baseDataPath) {
    return `${getConfig().baseDataPath}${dataPath}`;
  } else {
    return dataPath;
  }
}

export function getButtonConfig(button: string): ButtonConfig {
  const result = buttonsConfig().buttons[button];
  if (!result) {
    error(`Button config for button ${button} doesn't exist`);
  }
  return result;
}

export function getItemConfig(id: string) {
  const item = itemsConfig().items[id];
  if (!item) {
    error(`Item config for skill ${id} doesn't exist`);
  }
  return item;
}

export function getAchievementsConfig() {
  return getConfig().achievements;
}

export function getAchievementConfig(id: string) {
  const achievement = getAchievementsConfig().achievements[id];
  if (!achievement) {
    error(`Achievement config for achievement ${id} doesn't exist`);
  }
  return achievement;
}

export function getQuestConfig(questId: string) {
  return questsConfig().quests[questId];
}
export function getQuestEndingConfig(questId: string, ending: string) {
  const quest = getQuestConfig(questId);
  const endings = quest.endings!;
  if (!endings) {
    error(`Quest ${questId} doesn't have any endings`);
  }
  if (!endings[ending]) {
    error(`Quest ${questId} has no ending called ${ending}`);
  }
  return endings[ending];
}
export function getObjectiveConfig(quest: string, objectiveId: string) {
  return getQuestConfig(quest).objectives[objectiveId];
}

export function getDialogPanelWidth(): number {
  const dialogPanel = getConfig().dialogPanel;
  return dialogPanel.width ?? DEFAULT_DIALOG_WIDTH;
}
