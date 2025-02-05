import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { AutoAISummarySettingTab } from './settingTab';
import { PluginSettings, DEFAULT_SETTINGS } from './types';
import { OpenAIService } from './openai';
import { FrontMatterService } from './frontmatter';

export default class AutoAISummaryPlugin extends Plugin {
	settings: PluginSettings;
	private openaiService: OpenAIService;

	async onload() {
		await this.loadSettings();
		this.openaiService = new OpenAIService(
			this.settings.apiKey,
			this.settings.baseUrl,
			this.settings.model,
			this.settings.systemPrompt
		);

		// Add settings tab
		this.addSettingTab(new AutoAISummarySettingTab(this.app, this));

		// Add command to generate summary
		this.addCommand({
			id: 'generate-summary',
			name: 'Generate Summary',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				try {
					const content = editor.getValue();
					if (!content) {
						new Notice('No content to summarize');
						return;
					}

					if (!this.settings.apiKey) {
						new Notice('Please set your API key in settings');
						return;
					}

					new Notice('Generating summary...');
					const summary = await this.openaiService.generateSummary(content);

					// 检查是否存在description字段
					const hasDescription = FrontMatterService.hasField(content, 'description');
					const fieldToUpdate = hasDescription ? 'description' : this.settings.summaryField;

					// 使用FrontMatterService更新摘要
					const updatedContent = FrontMatterService.updateField(
						content,
						fieldToUpdate,
						summary,
						false // 不显示更新提示
					);
					editor.setValue(updatedContent);

					new Notice(`Summary generated and saved to ${fieldToUpdate} field`);
				} catch (error) {
					console.error('Error generating summary:', error);
					new Notice('Failed to generate summary');
				}
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// 更新OpenAI服务的配置
		this.openaiService = new OpenAIService(
			this.settings.apiKey,
			this.settings.baseUrl,
			this.settings.model,
			this.settings.systemPrompt
		);
	}
}
