import { Restaurant } from '../types/entities';
import { RestaurantStatus } from '../constants/restaurant-status';

export const mockRestaurants: Restaurant[] = [
  {
    id: 'r_review',
    name: 'مطعم بستان الرافدين',
    area: 'المنصور',
    city: 'بغداد',
    status: RestaurantStatus.under_review,
    description: 'مطبخ عراقي — طلب جديد قيد مراجعة الإدارة.',
  },
  {
    id: 'r_visible',
    name: 'مطعم شاطئ دجلة',
    area: 'الكرادة',
    city: 'بغداد',
    status: RestaurantStatus.visible,
    description: 'مأكولات بحرية — مفعل وظاهر في التطبيق.',
  },
  {
    id: 'r_disabled',
    name: 'كوفيه وتراس زيونة',
    area: 'زيونة',
    city: 'بغداد',
    status: RestaurantStatus.bookings_disabled,
    description: 'مقهى — الحجوزات معطّلة (اشتراك/تشغيل).',
  },
  {
    id: 'r_sus',
    name: 'مطعم ورد الكاظمية',
    area: 'الكاظمية',
    city: 'بغداد',
    status: RestaurantStatus.suspended,
    description: 'معلق بحسب إدارة المنصة.',
  },
  {
    id: 'r_hidden',
    name: 'صالة الجادرية',
    area: 'الجادرية',
    city: 'بغداد',
    status: RestaurantStatus.hidden,
    description: 'مخفى مؤقتاً عن الاستكشاف.',
  },
  {
    id: 'r_needs',
    name: 'مطبخ السفرة',
    area: 'الكرادة',
    city: 'بغداد',
    status: RestaurantStatus.needs_changes,
    description: 'يحتاج تعديل بيانات قبل النشر.',
  },
  {
    id: 'r_approved',
    name: 'دار النخيل',
    area: 'المنصور',
    city: 'بغداد',
    status: RestaurantStatus.approved,
    description: 'اعتماد داخلي — جاهز للتجهيز البرمجي لاحقاً.',
  },
];
