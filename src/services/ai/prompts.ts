/**
 * AIPrompts - مخزن التعليمات البرمجية للذكاء الاصطناعي
 * (Separation of Concerns)
 * فصل النصوص والتعليمات عن المنطق البرمجي
 */
export const AIPrompts = {
  analyzeAd: (description: string, professions: string[]) => `
    أنت "طبيب الإعلانات" (Ad Doctor) لمنصة "دليل خدمتك" في بورتسودان.
    قم بتحليل وصف الإعلان التالي وقدم نصائح لتحسينه لزيادة المبيعات والثقة.
    وصف الإعلان: "${description}"
    
    المهن المتاحة: ${professions.join(', ')}
    
    قدم تقريراً باللغة العربية يشمل:
    1. نقاط القوة.
    2. نقاط الضعف (مثلاً: نقص السعر، نقص الخبرة، نقص الضمانات).
    3. اقتراح لوصف أفضل وأكثر احترافية.
    4. تقييم نهائي من 10.
    
    استخدم لغة مشجعة ومهنية.
  `,

  smartSearch: (query: string, professions: string[], neighborhoods: string[]) => `
    Analyze this search query for services in Port Sudan.
    Query: "${query}"
    
    Extract the following as JSON:
    - profession: (one of: ${professions.join(', ')}) or "الكل"
    - neighborhood: (one of: ${neighborhoods.join(', ')}) or "الكل"
    - type: "offer" (if looking for a provider) or "request" (if looking for a job/service needed)
    - is_urgent: boolean
    
    Return only the JSON.
  `,

  adminReport: (recentAds: any[]) => `
    أنت مساعد إداري ذكي لمنصة "دليل خدمتك" في بورتسودان. 
    قم بتحليل البيانات التالية للإعلانات الأخيرة وقدم تقريراً استراتيجياً للإدارة يشمل:
    1. ملخص النشاط (عروض vs طلبات).
    2. تحليل المهن الأكثر نشاطاً والأحياء الأكثر طلباً.
    3. رصد أي اتجاهات (Trends) جديدة في سوق العمل المحلي.
    4. توصيات لتحسين تجربة المستخدم وزيادة التفاعل.
    
    البيانات: ${JSON.stringify(recentAds)}
    
    اجعل التقرير مهنياً، ملهماً، وباللغة العربية.
  `,

  forumAnalysis: (content: string, professions: string[], neighborhoods: string[]) => `
    Analyze this forum post from Port Sudan community.
    Post: "${content}"
    
    Extract as JSON:
    - is_service_request: boolean (is the user asking for a specific service?)
    - profession: (one of: ${professions.join(', ')}) or null
    - neighborhood: (one of: ${neighborhoods.join(', ')}) or null
    - urgency_level: "low", "medium", "high"
    
    Return only the JSON.
  `,

  idAnalysis: () => "Analyze this identity document from Sudan. Extract the full name and document number as JSON. Also, verify if it looks like a valid ID. Return JSON: { full_name: string, id_number: string, is_valid: boolean, confidence: number }"
};
