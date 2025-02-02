import { CommandPlugin } from './command-plugin';
import { loadDataFile } from '@/utils/ajax';
import { getDataUrl } from '@/config';
import { useConfig } from '@/stores/config-store';

export const loadDataPlugin = CommandPlugin.FromOptions<{ url: string }>({
  keyword: 'load_data',
  argTypes: [{ name: 'url', type: 'string' }],
  runner: async (cmd) => {
    const { url } = cmd.options;
    const res = await loadDataFile(getDataUrl(url));
    return res;
  },
});

export const changePlayerCharacterPlugin = CommandPlugin.FromOptions<{
  character: string;
}>({
  keyword: 'change_player_character',
  argTypes: [{ name: 'character', type: 'string' }],
  runner: async (cmd) => {
    const { character } = cmd.options;
    useConfig().config.characters.config.playerCharacter = character;
  },
});

export const changeGameCharacterPlugin = CommandPlugin.FromOptions<{
  character: string;
}>({
  keyword: 'change_game_character',
  argTypes: [{ name: 'character', type: 'string' }],
  runner: async (cmd) => {
    const { character } = cmd.options;
    useConfig().config.characters.config.gameCharacter = character;
  },
});

export const jsonEncode = CommandPlugin.FromOptions<{
  value: any;
}>({
  keyword: 'json_stringify',
  argTypes: [{ name: 'value', type: 'any' }],
  runner: async (cmd) => {
    const { value } = cmd.options;
    return JSON.stringify(value);
  },
});

export const jsonDecode = CommandPlugin.FromOptions<{
  value: string;
}>({
  keyword: 'json_parse',
  argTypes: [{ name: 'value', type: 'string' }],
  runner: async (cmd) => {
    const { value } = cmd.options;
    return JSON.parse(value);
  },
});
