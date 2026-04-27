import { Branch } from '../types/entities';

export const mockBranches: Branch[] = [
  { id: 'b_rv1', restaurantId: 'r_review', name: 'بستان الرافدين — المنصور', area: 'المنصور', address: 'المنصور، شارع 14' },
  { id: 'b_sh1', restaurantId: 'r_visible', name: 'شاطئ دجلة — الكرادة', area: 'الكرادة', address: 'الكرادة الداخل، قرب جسر المأمون' },
  { id: 'b_z1', restaurantId: 'r_disabled', name: 'وتراس زيونة', area: 'زيونة', address: 'زيونة، مجمع الورد' },
  { id: 'b_ka1', restaurantId: 'r_sus', name: 'ورد الكاظمية', area: 'الكاظمية', address: 'الكاظمية، شارع الجامعة' },
  { id: 'b_ja1', restaurantId: 'r_hidden', name: 'الجادرية', area: 'الجادرية', address: 'الجادرية، الحي الأكاديمي' },
  { id: 'b_su1', restaurantId: 'r_needs', name: 'مطبخ السفرة', area: 'الكرادة', address: 'الكرادة' },
  { id: 'b_dar1', restaurantId: 'r_approved', name: 'دار النخيل', area: 'المنصور', address: 'المنصور' },
];
