// api/whisper.js
import FormData from 'form-data';

export const config = {
  api: {
    // Tăng giới hạn kích thước nếu cần (ví dụ: 10mb)
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData || !mimeType) {
      res.status(400).json({ error: 'Thiếu audioData hoặc mimeType' });
      return;
    }

    // Chuyển đổi chuỗi base64 thành Buffer
    const buffer = Buffer.from(audioData, 'base64');

    // Tạo đối tượng FormData để gửi tới OpenAI API
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: 'audio.wav',
      contentType: mimeType,
    });
    formData.append('model', 'whisper-1');

    // Gọi OpenAI API để nhận kết quả chuyển đổi giọng nói (transcription)
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
