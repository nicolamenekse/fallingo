require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔍 Cloudinary Bilgileri:');
console.log(`   Cloud Name : ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`   API Key    : ${process.env.CLOUDINARY_API_KEY}`);
console.log(`   API Secret : ${process.env.CLOUDINARY_API_SECRET?.substring(0, 6)}...${process.env.CLOUDINARY_API_SECRET?.slice(-4)} (${process.env.CLOUDINARY_API_SECRET?.length} karakter)`);

console.log('\n📤 Cloudinary bağlantısı test ediliyor...');
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Hata:', error.message);
    console.error('\n💡 Çözüm:');
    console.error('   1. cloudinary.com → Settings → API Keys');
    console.error('   2. API Secret\'i kopyalayın (tamamını!)');
    console.error('   3. .env dosyasında CLOUDINARY_API_SECRET= satırını güncelleyin');
    console.error('   4. Başında/sonunda boşluk olmadığından emin olun');
  } else {
    console.log('✅ Cloudinary bağlantısı başarılı!');
    console.log(`   Sonuç: ${JSON.stringify(result)}`);
  }
});
