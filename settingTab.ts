import { App, PluginSettingTab, Setting } from 'obsidian';
import type AutoAISummaryPlugin from './main';
import { t } from './i18n';
import { DEFAULT_SETTINGS } from './types';

export class AutoAISummarySettingTab extends PluginSettingTab {
    plugin: AutoAISummaryPlugin;

    constructor(app: App, plugin: AutoAISummaryPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Summary Field Setting
        new Setting(containerEl)
            .setName(t('settings.summaryField.name'))
            .setDesc(t('settings.summaryField.desc'))
            .addText(text => text
                .setPlaceholder('summary')
                .setValue(this.plugin.settings.summaryField)
                .onChange(async (value) => {
                    this.plugin.settings.summaryField = value;
                    await this.plugin.saveSettings();
                }));

        // API Key Setting
        new Setting(containerEl)
            .setName(t('settings.apiKey.name'))
            .setDesc(t('settings.apiKey.desc'))
            .addText(text => text
                .setPlaceholder('your-api-key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        // Base URL Setting
        new Setting(containerEl)
            .setName(t('settings.baseUrl.name'))
            .setDesc(t('settings.baseUrl.desc'))
            .addText(text => text
                .setPlaceholder('https://api.openai.com')
                .setValue(this.plugin.settings.baseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.baseUrl = value;
                    await this.plugin.saveSettings();
                }));

        // Model Setting
        new Setting(containerEl)
            .setName(t('settings.model.name'))
            .setDesc(t('settings.model.desc'))
            .addText(text => text
                .setPlaceholder('gpt-3.5-turbo')
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));

        // System Prompt Setting
        new Setting(containerEl)
            .setName(t('settings.systemPrompt.name'))
            .setDesc(t('settings.systemPrompt.desc'))
            .addTextArea(text => text
                .setPlaceholder(DEFAULT_SETTINGS.systemPrompt)
                .setValue(this.plugin.settings.systemPrompt)
                .onChange(async (value) => {
                    this.plugin.settings.systemPrompt = value || DEFAULT_SETTINGS.systemPrompt;
                    await this.plugin.saveSettings();
                }));
    }
} 