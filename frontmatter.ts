import { Notice } from 'obsidian';

export class FrontMatterService {
    // YAML frontmatter正则表达式
    private static readonly FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n*/;
    private static readonly FIELD_REGEX = (field: string) => new RegExp(`^${field}:([\\s\\S]*?)(?=\\n[^\\s]|$)`, 'm');
    
    /**
     * 检查文档是否包含frontmatter
     */
    public static hasFrontMatter(content: string): boolean {
        return this.FRONTMATTER_REGEX.test(content);
    }

    /**
     * 检查字段是否存在
     */
    public static hasField(content: string, field: string): boolean {
        const match = content.match(this.FRONTMATTER_REGEX);
        if (!match) return false;
        
        const frontMatter = match[1];
        return this.FIELD_REGEX(field).test(frontMatter);
    }

    /**
     * 格式化YAML值
     * 处理多行内容的缩进问题
     */
    private static formatYamlValue(value: string): string {
        // 如果包含换行符，使用块状文字语法
        if (value.includes('\n')) {
            const indentedValue = value
                .split('\n')
                .map((line: string, index: number) => index === 0 ? line : `  ${line}`) // 缩进后续行
                .join('\n');
            return `|\n  ${indentedValue}`;
        }
        
        // 如果包含特殊字符，使用引号包裹
        if (/[:{}[\],&*#?|-]/g.test(value)) {
            return `"${value.replace(/"/g, '\\"')}"`;
        }
        
        return value;
    }

    /**
     * 更新或添加字段
     */
    public static updateField(content: string, field: string, value: string, shouldPrompt = true): string {
        const formattedValue = this.formatYamlValue(value);
        
        // 如果没有frontmatter，创建一个新的
        if (!this.hasFrontMatter(content)) {
            return `---\n${field}: ${formattedValue}\n---\n${content}`;
        }

        // 更新已存在的frontmatter
        const updatedContent = content.replace(this.FRONTMATTER_REGEX, (match, frontMatter) => {
            const hasField = this.FIELD_REGEX(field).test(frontMatter);
            
            if (hasField) {
                // 如果字段已存在，更新它
                if (shouldPrompt) {
                    new Notice(`Updating existing ${field} field`);
                }
                const updatedFrontMatter = frontMatter.replace(
                    this.FIELD_REGEX(field),
                    `${field}: ${formattedValue}`
                );
                return `---\n${updatedFrontMatter.trim()}\n---\n`;
            } else {
                // 如果字段不存在，添加到frontmatter末尾
                const trimmedFrontMatter = frontMatter.trim();
                return `---\n${trimmedFrontMatter}\n${field}: ${formattedValue}\n---\n`;
            }
        });

        // 确保frontmatter和内容之间只有一个换行符
        return updatedContent.replace(/---\n+/g, '---\n');
    }

    /**
     * 获取字段值
     */
    public static getField(content: string, field: string): string | null {
        const match = content.match(this.FRONTMATTER_REGEX);
        if (!match) return null;

        const frontMatter = match[1];
        const fieldMatch = frontMatter.match(this.FIELD_REGEX(field));
        if (!fieldMatch) return null;

        return fieldMatch[1].trim();
    }

    /**
     * 删除字段
     */
    public static removeField(content: string, field: string): string {
        if (!this.hasFrontMatter(content)) return content;

        const updatedContent = content.replace(this.FRONTMATTER_REGEX, (match, frontMatter) => {
            const lines = frontMatter.split('\n');
            const filteredLines = lines.filter((line: string) => !this.FIELD_REGEX(field).test(line));
            return `---\n${filteredLines.join('\n').trim()}\n---\n`;
        });

        // 确保frontmatter和内容之间只有一个换行符
        return updatedContent.replace(/---\n+/g, '---\n');
    }
} 