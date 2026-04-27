import { WhatsAppTemplate } from '../types/entities';

/**
 * Names where the blueprint names them; others use stable internal ids (see docs/whatsapp-templates.md).
 */
export const mockWhatsAppTemplates: WhatsAppTemplate[] = [
  { id: 'w1', name: 'eventaat_otp_login', category: 'Authentication', descriptionAr: 'رمز الدخول' },
  { id: 'w2', name: 'reservation_request_created', category: 'Utility', descriptionAr: 'إشعار بإنشاء طلب' },
  { id: 'w3', name: 'reservation_approved_utility', category: 'Utility', descriptionAr: 'تأكيد حجز (نص المخطط §70)' },
  { id: 'w4', name: 'reservation_rejected_utility', category: 'Utility', descriptionAr: 'رفض حجز (§71)' },
  { id: 'w5', name: 'reservation_alternative_utility', category: 'Utility', descriptionAr: 'اقتراح وقت بديل (§72)' },
  { id: 'w6', name: 'reservation_reminder_utility', category: 'Utility', descriptionAr: 'تذكير (§73)' },
  { id: 'w7', name: 'reservation_ontheway_utility', category: 'Utility', descriptionAr: 'الزبون في الطريق (§74)' },
  { id: 'w8', name: 'reservation_cancel_cust_utility', category: 'Utility', descriptionAr: 'إلغاء من الزبون (§75)' },
  { id: 'w9', name: 'reservation_cancel_rest_utility', category: 'Utility', descriptionAr: 'إلغاء من المطعم (§76)' },
  { id: 'w10', name: 'reservation_noshow_utility', category: 'Utility', descriptionAr: 'تنبيه عند تسجيل عدم الحضور (§77)' },
  { id: 'w11', name: 'reservation_review_utility', category: 'Utility', descriptionAr: 'طلب تقييم (§78)' },
  { id: 'w12', name: 'restaurant_new_reservation_utility', category: 'Utility', descriptionAr: 'طلب جديد للمطعم (§79)' },
  { id: 'w13', name: 'callcenter_followup_utility', category: 'Utility', descriptionAr: 'متابعة كول سنتر (§80)' },
];
