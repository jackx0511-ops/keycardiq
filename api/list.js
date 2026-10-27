// api/list.js
export default async function handler(req, res) {
  // التحقق من كلمة المرور
  const authHeader = req.headers.authorization;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qi_admin_2026';
  
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const cloudName = 'ujzbgprc';
    const apiKey = process.env.CLOUDINARY_API_KEY || '744288725317255';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '26c68WuaGdoHhjli_MU_llAA3PM';
    
    // جلب قائمة الفيديوهات من Cloudinary
    const videoResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload?prefix=qi_verifications/&max_results=100`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
        }
      }
    );

    const videoData = await videoResponse.json();

    // جلب قائمة ملفات النصوص
    const textResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/raw/upload?prefix=qi_verifications/&max_results=100`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
        }
      }
    );

    const textData = await textResponse.json();

    // دمج البيانات
    const videos = videoData.resources || [];
    const texts = textData.resources || [];

    const applications = videos.map(video => {
      const token = video.public_id.replace('qi_verifications/video_', '');
      const textFile = texts.find(t => t.public_id.includes(token));
      
      return {
        token: token,
        videoUrl: video.secure_url,
        textUrl: textFile?.secure_url || null,
        createdAt: video.created_at,
        size: video.bytes,
        duration: video.duration,
        width: video.width,
        height: video.height,
        context: video.context?.custom || {}
      };
    });

    // ترتيب حسب الأحدث
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      total: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}