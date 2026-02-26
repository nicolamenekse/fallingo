const FortuneReading = require('../models/FortuneReading');
const { analyzeImageWithAI, generateTextWithAI } = require('../config/openai');
const { SYSTEM_PROMPT, getPromptByType } = require('../utils/openaiPrompts');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

const FORTUNE_TYPES_REQUIRING_IMAGE = ['coffee', 'palm'];
const FORTUNE_TYPES_FREE = ['coffee'];

const buildReadingFromAIResponse = (type, aiData, extraData = {}) => {
  const reading = {
    content: aiData.fullReading || aiData.general || 'Fal yorumu alındı.',
    sections: {
      general: aiData.general || null,
      love: aiData.love || null,
      career: aiData.career || null,
      health: aiData.health || null,
      finance: aiData.finance || null,
      advice: aiData.advice || null,
    },
    keywords: Array.isArray(aiData.keywords) ? aiData.keywords.slice(0, 10) : [],
    sentiment: aiData.sentiment || 'neutral',
    luckyNumbers: Array.isArray(aiData.luckyNumbers) ? aiData.luckyNumbers.slice(0, 5) : [],
    luckyColors: Array.isArray(aiData.luckyColors) ? aiData.luckyColors.slice(0, 3) : [],
  };

  const tarotCards = [];
  if (type === 'tarot' && Array.isArray(aiData.cards)) {
    aiData.cards.forEach((card) => {
      tarotCards.push({
        name: card.name || 'Bilinmeyen Kart',
        position: card.position || 'Merkez',
        meaning: card.meaning || '',
        isReversed: card.isReversed || false,
      });
    });
  }

  const palmData = {};
  if (type === 'palm') {
    palmData.lines = {
      heart: aiData.heartLine || null,
      head: aiData.headLine || null,
      life: aiData.lifeLine || null,
      fate: aiData.fateLine || null,
    };
  }

  return { reading, tarotCards, palmData };
};

exports.createCoffeeReading = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fincan fotoğrafı yüklemek zorunludur.' });
    }

    const { userNote } = req.body;
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const imageUrl = uploadResult.secure_url;
    const imagePublicId = uploadResult.public_id;

    const userPrompt = getPromptByType('coffee', { userNote });
    const { data: aiData, tokensUsed, processingTime } = await analyzeImageWithAI({
      imageUrl,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    const { reading, tarotCards, palmData } = buildReadingFromAIResponse('coffee', aiData);

    const fortuneReading = await FortuneReading.create({
      user: req.user._id,
      type: 'coffee',
      title: 'Kahve Falı',
      image: { url: imageUrl, publicId: imagePublicId },
      userNote: userNote || null,
      reading,
      tokensUsed,
      processingTime,
    });

    await req.user.incrementReadingCount();

    res.status(201).json({
      success: true,
      message: 'Kahve falınız yorumlandı!',
      reading: fortuneReading,
    });
  } catch (error) {
    next(error);
  }
};

exports.createPalmReading = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'El fotoğrafı yüklemek zorunludur.' });
    }

    const { userNote } = req.body;
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const imageUrl = uploadResult.secure_url;
    const imagePublicId = uploadResult.public_id;

    const userPrompt = getPromptByType('palm', { userNote });
    const { data: aiData, tokensUsed, processingTime } = await analyzeImageWithAI({
      imageUrl,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    const { reading, palmData } = buildReadingFromAIResponse('palm', aiData);

    const fortuneReading = await FortuneReading.create({
      user: req.user._id,
      type: 'palm',
      title: 'El Falı',
      image: { url: imageUrl, publicId: imagePublicId },
      userNote: userNote || null,
      reading,
      palmData,
      tokensUsed,
      processingTime,
    });

    await req.user.incrementReadingCount();

    res.status(201).json({
      success: true,
      message: 'El falınız yorumlandı!',
      reading: fortuneReading,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTarotReading = async (req, res, next) => {
  try {
    const { userNote, cardCount = 3 } = req.body;
    const validCardCounts = [1, 3, 10];

    if (!validCardCounts.includes(parseInt(cardCount))) {
      return res.status(400).json({ success: false, message: 'Kart sayısı 1, 3 veya 10 olabilir.' });
    }

    const userPrompt = getPromptByType('tarot', { userNote, cardCount: parseInt(cardCount) });
    const { data: aiData, tokensUsed, processingTime } = await generateTextWithAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    const { reading, tarotCards } = buildReadingFromAIResponse('tarot', aiData);

    const spreadTitles = { 1: 'Günlük Tarot', 3: 'Geçmiş-Şimdiki-Gelecek', 10: 'Celtic Cross Tarot' };

    const fortuneReading = await FortuneReading.create({
      user: req.user._id,
      type: 'tarot',
      title: spreadTitles[cardCount] || 'Tarot Falı',
      userNote: userNote || null,
      reading,
      tarotCards,
      tokensUsed,
      processingTime,
    });

    await req.user.incrementReadingCount();

    res.status(201).json({
      success: true,
      message: 'Tarot falınız yorumlandı!',
      reading: fortuneReading,
    });
  } catch (error) {
    next(error);
  }
};

exports.createHoroscopeReading = async (req, res, next) => {
  try {
    const { zodiacSign, period = 'Bu hafta', userNote } = req.body;

    const validSigns = [
      'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak',
      'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık',
    ];

    const signToUse = zodiacSign || req.user.zodiacSign;
    if (!signToUse || !validSigns.includes(signToUse)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir burç belirtiniz veya profilinize burç ekleyiniz.',
      });
    }

    const userPrompt = getPromptByType('horoscope', { zodiacSign: signToUse, period, userNote });
    const { data: aiData, tokensUsed, processingTime } = await generateTextWithAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    const { reading } = buildReadingFromAIResponse('horoscope', aiData);

    const fortuneReading = await FortuneReading.create({
      user: req.user._id,
      type: 'horoscope',
      title: `${signToUse} - ${period} Yıldız Falı`,
      userNote: userNote || null,
      reading,
      horoscopeData: { zodiacSign: signToUse, period },
      tokensUsed,
      processingTime,
    });

    await req.user.incrementReadingCount();

    res.status(201).json({
      success: true,
      message: 'Yıldız falınız yorumlandı!',
      reading: fortuneReading,
    });
  } catch (error) {
    next(error);
  }
};

exports.createDreamReading = async (req, res, next) => {
  try {
    const { dreamText } = req.body;

    if (!dreamText || dreamText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen rüyanızı en az 10 karakter ile açıklayın.',
      });
    }

    if (dreamText.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Rüya açıklaması 2000 karakterden uzun olamaz.',
      });
    }

    const userPrompt = getPromptByType('dream', { dreamText: dreamText.trim() });
    const { data: aiData, tokensUsed, processingTime } = await generateTextWithAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    const { reading } = buildReadingFromAIResponse('dream', aiData);

    const symbols = Array.isArray(aiData.symbols) ? aiData.symbols.slice(0, 10) : [];
    const symbolMeanings = Array.isArray(aiData.symbolMeanings) ? aiData.symbolMeanings.slice(0, 10) : [];

    const fortuneReading = await FortuneReading.create({
      user: req.user._id,
      type: 'dream',
      title: 'Rüya Tabiri',
      userNote: dreamText.trim(),
      reading: {
        ...reading,
        sections: {
          ...reading.sections,
          general: aiData.general || null,
          love: aiData.love || null,
          career: aiData.career || null,
          health: aiData.health || null,
          finance: null,
          advice: aiData.advice || null,
        },
      },
      dreamData: {
        dreamText: dreamText.trim(),
        symbols,
        symbolMeanings,
        subconscious: aiData.subconscious || null,
        isGoodDream: aiData.isGoodDream !== false,
      },
      tokensUsed,
      processingTime,
    });

    await req.user.incrementReadingCount();

    res.status(201).json({
      success: true,
      message: 'Rüyanız yorumlandı!',
      reading: fortuneReading,
    });
  } catch (error) {
    next(error);
  }
};

exports.getReadingById = async (req, res, next) => {
  try {
    const reading = await FortuneReading.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({ success: false, message: 'Fal kaydı bulunamadı.' });
    }

    res.json({ success: true, reading });
  } catch (error) {
    next(error);
  }
};

exports.rateReading = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Puanlama 1 ile 5 arasında olmalıdır.' });
    }

    const reading = await FortuneReading.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { userRating: rating, userFeedback: feedback || null },
      { new: true }
    );

    if (!reading) {
      return res.status(404).json({ success: false, message: 'Fal kaydı bulunamadı.' });
    }

    res.json({ success: true, message: 'Puanınız kaydedildi.', reading });
  } catch (error) {
    next(error);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const reading = await FortuneReading.findOne({ _id: req.params.id, user: req.user._id });

    if (!reading) {
      return res.status(404).json({ success: false, message: 'Fal kaydı bulunamadı.' });
    }

    reading.isFavorite = !reading.isFavorite;
    await reading.save();

    res.json({
      success: true,
      isFavorite: reading.isFavorite,
      message: reading.isFavorite ? 'Favorilere eklendi.' : 'Favorilerden kaldırıldı.',
    });
  } catch (error) {
    next(error);
  }
};

exports.shareReading = async (req, res, next) => {
  try {
    if (!req.user.isPremium()) {
      return res.status(403).json({
        success: false,
        message: 'Fal paylaşımı sadece Premium üyelere açıktır.',
        code: 'PREMIUM_REQUIRED',
      });
    }

    const reading = await FortuneReading.findOne({ _id: req.params.id, user: req.user._id });
    if (!reading) {
      return res.status(404).json({ success: false, message: 'Fal kaydı bulunamadı.' });
    }

    if (!reading.shareToken) {
      reading.shareToken = uuidv4();
      reading.isShared = true;
      await reading.save();
    }

    const shareUrl = `${process.env.CLIENT_URL}/share/${reading.shareToken}`;

    res.json({ success: true, shareToken: reading.shareToken, shareUrl });
  } catch (error) {
    next(error);
  }
};

exports.getSharedReading = async (req, res, next) => {
  try {
    const reading = await FortuneReading.findOne({
      shareToken: req.params.token,
      isShared: true,
    }).populate('user', 'name avatar');

    if (!reading) {
      return res.status(404).json({ success: false, message: 'Paylaşılan fal bulunamadı veya süresi dolmuş.' });
    }

    res.json({ success: true, reading });
  } catch (error) {
    next(error);
  }
};
