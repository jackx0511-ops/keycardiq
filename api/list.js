// api/list.js
export default async function handler(req, res) {
  // 1. التحقق من كلمة المرور
  const authHeader = req.headers.authorization;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qi_admin_2026';
  
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized: كلمة المرور غير صحيحة' });
  }

  try {
    // 2. بيانات Cloudinary الخاصة بك
    const cloudName = 'ujzbgprc';
    const apiKey = process.env.CLOUDINARY_API_KEY || '744288725317255';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '26c68WuaGdoHhjli_MU_llAA3PM';
    
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const headers = { 'Authorization': `Basic ${auth}` };

    // 3. جلب قائمة الفيديوهات من مجلد qi_verifications
    const videoRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload?prefix=qi_verifications/&max_results=100`, { headers });
    const videoData = await videoRes.json();

    // 4. جلب قائمة ملفات النصوص (التي تحتوي على البيانات)
    const textRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/raw/upload?prefix=qi_verifications/&max_results=100`, { headers });
    const textData = await textRes.json();

    const videos = videoData.resources || [];
    const texts = textData.resources || [];

    // 5. دمج البيانات معاً بناءً على الـ Token
    const applications = videos.map(video => {
      // استخراج التوكن من اسم الملف (مثال: qi_verifications/video_QI-XXXXX)
      const token = video.public_id.replace('qi_verifications/video_', '');
      
      // البحث عن ملف النص المقابل لنفس التوكن
      const textFile = texts.find(t => t.public_id.includes(token));

      return {
        token: token,
        videoUrl: video.secure_url,
        textUrl: textFile?.secure_url || null,
        createdAt: video.created_at,
        size: video.bytes,
        context: video.context?.custom || {} // هنا سيتم تخزين الاسم والهاتف إذا أضفتها في الـ Context
      };
    });

    // 6. ترتيب الطلبات من الأحدث إلى الأقدم
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 7. إرجاع البيانات بنجاح
    res.status(200).json({
      success: true,
      total: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Cloudinary API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}
