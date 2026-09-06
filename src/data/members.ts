// 成员数据类型 + 内置兜底数据（飞书接口和 data.json 都不可用时的最后防线）

export type CharacterClass =
  | '战士'
  | '飞侠'
  | '魔法师'
  | '弓箭手'
  | '海盗';

export interface IMember {
  id: string;
  gameId: string;
  characterClass: string;
  level: number;
  onlineDuration: string;
  welcomeGift: string;
  gamePlans: string[];
  familyNeeds: string[];
}

export const CLASS_ORDER: CharacterClass[] = ['战士', '飞侠', '魔法师', '弓箭手', '海盗'];

export const ONLINE_BUCKETS = ['1-3小时', '3-6小时', '6-8小时', '8-12小时', '肝帝'];

export const FALLBACK_MEMBERS: IMember[] = [
  { id: '1', gameId: '天下第一圣骑', characterClass: '战士', level: 83, onlineDuration: '1-3小时', welcomeGift: '皇家美发卡', gamePlans: ['养老休闲'], familyNeeds: ['家族团建'] },
  { id: '2', gameId: '红烧手指头s', characterClass: '战士', level: 80, onlineDuration: '3-6小时', welcomeGift: '58万游戏币', gamePlans: ['高效冲级'], familyNeeds: ['氪金大佬'] },
  { id: '3', gameId: '常山赵子龙灬', characterClass: '战士', level: 71, onlineDuration: '3-6小时', welcomeGift: '皇家整容卷', gamePlans: ['日常娱乐'], familyNeeds: ['找聊天搭子'] },
  { id: '4', gameId: '南侑暖树', characterClass: '战士', level: 71, onlineDuration: '6-8小时', welcomeGift: '58万游戏币', gamePlans: ['高效冲级'], familyNeeds: ['找固定队', '找聊天搭子'] },
  { id: '5', gameId: '冷苏打灬', characterClass: '战士', level: 67, onlineDuration: '1-3小时', welcomeGift: '皇家美发卡', gamePlans: ['养老休闲', '高效冲级'], familyNeeds: ['找聊天搭子', '找固定队'] },
  { id: '6', gameId: '墨丘利', characterClass: '战士', level: 60, onlineDuration: '3-6小时', welcomeGift: '皇家美发卡', gamePlans: ['养老休闲', '日常娱乐'], familyNeeds: ['找聊天搭子'] },
  { id: '7', gameId: '老师白洁', characterClass: '战士', level: 48, onlineDuration: '1-3小时', welcomeGift: '58万游戏币', gamePlans: ['日常娱乐', '高效冲级'], familyNeeds: ['找聊天搭子'] },
  { id: '8', gameId: '画里', characterClass: '飞侠', level: 75, onlineDuration: '8-12小时', welcomeGift: '58万游戏币', gamePlans: ['高效冲级'], familyNeeds: ['找固定队'] },
  { id: '9', gameId: '苏殇', characterClass: '飞侠', level: 74, onlineDuration: '3-6小时', welcomeGift: '皇家美发卡', gamePlans: ['日常娱乐'], familyNeeds: ['找固定队'] },
  { id: '10', gameId: '决背对世界', characterClass: '飞侠', level: 72, onlineDuration: '肝帝', welcomeGift: '皇家美发卡', gamePlans: ['高效冲级'], familyNeeds: ['找固定队'] },
  { id: '11', gameId: '狠活门探子', characterClass: '飞侠', level: 60, onlineDuration: '1-3小时', welcomeGift: '58万游戏币', gamePlans: ['日常娱乐', '养老休闲', '高效冲级'], familyNeeds: ['找聊天搭子', '家族团建'] },
  { id: '12', gameId: '狠活门探子2', characterClass: '飞侠', level: 60, onlineDuration: '8-12小时', welcomeGift: '58万游戏币', gamePlans: ['无'], familyNeeds: ['找聊天搭子', '找固定队'] },
  { id: '13', gameId: '小作坊真牛', characterClass: '飞侠', level: 50, onlineDuration: '6-8小时', welcomeGift: '58万游戏币', gamePlans: ['高效冲级'], familyNeeds: ['找聊天搭子', '找固定队'] },
  { id: '14', gameId: '小作坊真牛2', characterClass: '飞侠', level: 50, onlineDuration: '1-3小时', welcomeGift: '皇家美发卡', gamePlans: ['日常娱乐'], familyNeeds: ['找固定队', '氪金大佬', '找聊天搭子', '家族团建', '其他'] },
  { id: '15', gameId: '球衣松垮猫', characterClass: '魔法师', level: 79, onlineDuration: '8-12小时', welcomeGift: '58万游戏币', gamePlans: ['高效冲级'], familyNeeds: ['找聊天搭子', '找固定队'] },
  { id: '16', gameId: '朱大锤丶', characterClass: '魔法师', level: 65, onlineDuration: '肝帝', welcomeGift: '58万游戏币', gamePlans: ['高效冲级'], familyNeeds: ['找固定队'] },
  { id: '17', gameId: '陆景琛丶', characterClass: '魔法师', level: 64, onlineDuration: '8-12小时', welcomeGift: '58万游戏币', gamePlans: ['高效冲级', '日常娱乐'], familyNeeds: ['找固定队', '氪金大佬'] },
  { id: '18', gameId: '天天吃饭团', characterClass: '魔法师', level: 51, onlineDuration: '1-3小时', welcomeGift: '58万游戏币', gamePlans: ['日常娱乐'], familyNeeds: ['家族团建'] },
  { id: '19', gameId: '蕾蕾张', characterClass: '魔法师', level: 41, onlineDuration: '3-6小时', welcomeGift: '皇家整容卷', gamePlans: ['日常娱乐'], familyNeeds: ['找固定队'] },
  { id: '20', gameId: '米乐de哥哥', characterClass: '弓箭手', level: 70, onlineDuration: '8-12小时', welcomeGift: '皇家整容卷', gamePlans: ['高效冲级', '日常娱乐', '养老休闲'], familyNeeds: ['家族团建', '找固定队', '找聊天搭子'] },
  { id: '21', gameId: '飞天靓贼', characterClass: '弓箭手', level: 62, onlineDuration: '6-8小时', welcomeGift: '皇家美发卡', gamePlans: ['高效冲级'], familyNeeds: ['家族团建', '找固定队'] },
];
