import { moment } from 'obsidian';
import en from './en';
import zh from './zh';

type Messages = {
    [key: string]: any;
};

const messages: Messages = {
    en,
    zh
};

export function t(key: string): string {
    // 使用moment.locale()获取obsidian的当前语言设置
    const locale = moment.locale().startsWith('zh') ? 'zh' : 'en';
    
    const keys = key.split('.');
    let value = messages[locale] || messages['en'];
    
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key;
        }
    }
    
    return typeof value === 'string' ? value : key;
} 