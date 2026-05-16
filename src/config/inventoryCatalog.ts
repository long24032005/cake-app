import type { InventoryItem } from '../types';

export interface AccessoryMetadata {
  id: string;
  name: string;
  type: 'head' | 'neck' | 'eyes' | 'body' | 'back' | 'companion' | 'effect';
  icon: string;
  description: string;
}

export const ACCESSORY_CATALOG: Record<string, AccessoryMetadata> = {
  'cat_ears': { id: 'cat_ears', name: 'Mũ Tai Mèo', type: 'head', icon: '🐱', description: 'Đôi tai mèo dễ thương' },
  'bow_pastel': { id: 'bow_pastel', name: 'Nơ Cổ Pastel', type: 'neck', icon: '🎀', description: 'Nơ cổ màu pastel dịu nhẹ' },
  'heart_glasses': { id: 'heart_glasses', name: 'Kính Trái Tim', type: 'eyes', icon: '👓', description: 'Kính hình trái tim hồng' },
  'golden_bell': { id: 'golden_bell', name: 'Chuông Vàng', type: 'neck', icon: '🔔', description: 'Chuông vàng kêu leng keng' },
  'heart_badge': { id: 'heart_badge', name: 'Huy Hiệu Tim', type: 'body', icon: '❤️', description: 'Huy hiệu hình trái tim' },
  'princess_crown': { id: 'princess_crown', name: 'Vương Miện Công Chúa', type: 'head', icon: '👑', description: 'Vương miện lấp lánh' },
  'toy_mouse': { id: 'toy_mouse', name: 'Bạn Chuột Đồ Chơi', type: 'companion', icon: '🐭', description: 'Người bạn chuột nhỏ' },
  'gold_fish': { id: 'gold_fish', name: 'Cá Vàng Nhỏ', type: 'companion', icon: '🐠', description: 'Bể cá vàng mini' },
  'feather_band': { id: 'feather_band', name: 'Băng Đô Lông Vũ', type: 'head', icon: '🪶', description: 'Băng đô đính lông vũ' },
  'pirate_hat': { id: 'pirate_hat', name: 'Mũ Hải Tặc', type: 'head', icon: '🏴‍☠️', description: 'Mũ thuyền trưởng hải tặc' },
  'angel_wings': { id: 'angel_wings', name: 'Cánh Thiên Thần', type: 'back', icon: '👼', description: 'Đôi cánh thiên thần trắng' },
  'pearl_necklace': { id: 'pearl_necklace', name: 'Chuỗi Ngọc Trai', type: 'neck', icon: '📿', description: 'Chuỗi ngọc trai sang trọng' },
  'daisy_flower': { id: 'daisy_flower', name: 'Hoa Cúc Nhỏ', type: 'body', icon: '🌼', description: 'Bông hoa cúc trắng tinh khôi' },
  'diamond_bracelet': { id: 'diamond_bracelet', name: 'Vòng Tay Kim Cương', type: 'body', icon: '💍', description: 'Vòng tay lấp lánh' },
  'rainbow_lollipop': { id: 'rainbow_lollipop', name: 'Kẹo Mút Cầu Vồng', type: 'companion', icon: '🍭', description: 'Kẹo mút ngọt ngào' },
  'sparkle_effect': { id: 'sparkle_effect', name: 'Hiệu Ứng Lấp Lánh', type: 'effect', icon: '✨', description: 'Lấp lánh quanh Gato' },
  'little_bird': { id: 'little_bird', name: 'Bạn Chim Nhỏ', type: 'companion', icon: '🐦', description: 'Bạn chim sẻ nhỏ' },
  'chef_hat': { id: 'chef_hat', name: 'Mũ Đầu Bếp', type: 'head', icon: '👨‍🍳', description: 'Mũ đầu bếp chuyên nghiệp' },
  'star_clip': { id: 'star_clip', name: 'Kẹp Ngôi Sao', type: 'head', icon: '⭐', description: 'Kẹp tóc hình ngôi sao' },
  'bunny_hug': { id: 'bunny_hug', name: 'Thỏ Con Ôm Ấp', type: 'companion', icon: '🐰', description: 'Thỏ con mềm mại' },
  'bow_pink': { id: 'bow_pink', name: 'Nơ Hồng', type: 'neck', icon: '🎀', description: 'Nơ hồng xinh xắn' },
  'wings_small': { id: 'wings_small', name: 'Cánh Nhỏ', type: 'back', icon: '🦋', description: 'Cánh bướm nhỏ' },
};
