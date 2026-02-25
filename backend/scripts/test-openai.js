require('dotenv').config({ path: '../.env' });
const OpenAI = require('openai');

async function testOpenAI() {
  console.log('🔍 OpenAI API Testi Başlıyor...\n');

  // 1. API Key kontrolü
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY bulunamadı! .env dosyasını kontrol edin.');
    return;
  }
  console.log(`✅ API Key mevcut: ${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`);

  const client = new OpenAI({ apiKey });

  // 2. Basit metin testi
  console.log('\n📤 OpenAI\'ye test isteği gönderiliyor...');
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: 'Merhaba, bu bir test mesajıdır. JSON formatında {"status":"ok","message":"Merhaba"} döndür.' }
      ],
      max_tokens: 100,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    console.log('✅ OpenAI yanıt verdi!');
    console.log(`   Model: ${response.model}`);
    console.log(`   Kullanılan token: ${response.usage?.total_tokens}`);
    console.log(`   Yanıt: ${content}`);

  } catch (error) {
    console.error('\n❌ OpenAI Hatası:', error.message);

    if (error.status === 401) {
      console.error('\n💡 Çözüm: API key geçersiz veya süresi dolmuş.');
      console.error('   → platform.openai.com adresine gidip yeni key oluşturun.');
    } else if (error.status === 429) {
      console.error('\n💡 Çözüm: Rate limit veya yetersiz kredi.');
      console.error('   → platform.openai.com/account/billing adresini kontrol edin.');
    } else if (error.status === 404) {
      console.error('\n💡 Çözüm: Model bulunamadı. gpt-4o erişiminiz olmayabilir.');
      console.error('   → Aşağıdaki komutla gpt-3.5-turbo ile deneyin.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Çözüm: İnternet bağlantısı sorunu.');
    }
    return;
  }

  // 3. Model listesi (mevcut modelleri göster)
  console.log('\n📋 Erişilebilir modeller kontrol ediliyor...');
  try {
    const models = await client.models.list();
    const gptModels = models.data
      .filter(m => m.id.includes('gpt-4') || m.id.includes('gpt-3.5'))
      .map(m => m.id)
      .slice(0, 8);
    console.log('   Kullanılabilir GPT modelleri:');
    gptModels.forEach(m => console.log(`   ✓ ${m}`));
  } catch {
    console.log('   (Model listesi alınamadı)');
  }

  console.log('\n🎉 Tüm testler başarılı! OpenAI entegrasyonu çalışıyor.');
}

testOpenAI();
