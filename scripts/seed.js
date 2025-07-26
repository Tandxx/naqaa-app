// scripts/seed.js - Sample data seeder
const mongoose = require('mongoose');
const Resource = require('../models/Resource');

const seedResources = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/Naqaa');
    
    // Clear existing resources
    await Resource.deleteMany({});
    
    const resources = [
      {
        title: 'آية التوبة والاستغفار',
        type: 'verse',
        language: 'ar',
        category: 'islamic',
        content: 'وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا لِذُنُوبِهِمْ وَمَن يَغْفِرُ الذُّنُوبَ إِلَّا اللَّهُ وَلَمْ يُصِرُّوا عَلَىٰ مَا فَعَلُوا وَهُمْ يَعْلَمُونَ - آل عمران: 135'
      },
      {
        title: 'فوائد ترك العادات السيئة',
        type: 'article',
        language: 'ar',
        category: 'motivation',
        content: 'ترك العادات السيئة يحسن من صحتك النفسية والجسدية، يزيد من ثقتك بنفسك، ويحسن علاقاتك مع الآخرين. كما يزيد من إنتاجيتك ويمنحك راحة الضمير والسكينة الداخلية.'
      },
      {
        title: 'تقنيات التأمل والاسترخاء',
        type: 'article',
        language: 'ar',
        category: 'scientific',
        content: 'التأمل وتقنيات الاسترخاء تساعد في تقليل التوتر والقلق، وتحسن من قدرتك على التحكم في النفس. ابدأ بـ 5 دقائق يومياً من التنفس العميق والتركيز على اللحظة الحالية.'
      },
      {
        title: 'دعاء الاستعانة',
        type: 'verse',
        language: 'ar',
        category: 'islamic',
        content: 'اللهم أعني على ذكرك وشكرك وحسن عبادتك. ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.'
      },
      {
        title: 'أهمية النشاط البدني',
        type: 'article',
        language: 'ar',
        category: 'scientific',
        content: 'ممارسة الرياضة تساعد في إفراز الإندورفين، مما يحسن المزاج ويقلل من الرغبات السلبية. حتى 20 دقيقة من المشي يومياً يمكن أن تحدث فرقاً كبيراً.'
      },
      {
        title: 'آية القوة والعزيمة',
        type: 'verse',
        language: 'ar',
        category: 'islamic',
        content: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا ۚ وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ - العنكبوت: 69'
      }
    ];
    
    await Resource.insertMany(resources);
    console.log('Sample resources created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding resources:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedResources();
}

module.exports = seedResources;