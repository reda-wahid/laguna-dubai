/**
 * High-Precision Ingredient & Culinary Photo Matcher for LAGUNA DUBAI
 * Provides verified, high-definition, restaurant-grade food & beverage photography
 * matched precisely to the ingredients, toppings, and plating of each dish.
 */

export interface CulinaryMatchResult {
  title: string;
  matchedIngredients: string[];
  photos: string[];
}

// Rich taxonomy of authentic, photorealistic food & drink images categorized by precise ingredients
export const INGREDIENT_PHOTO_CATALOG: Array<{
  keywords: string[];
  ingredients: string[];
  photos: string[];
}> = [
  // --- PIZZAS BY TOPPINGS & INGREDIENTS ---
  {
    keywords: ['مارجريتا', 'margherita', 'طماطم وريحان', 'جبنة موزاريلا'],
    ingredients: ['موزاريلا طبيعي', 'صوص طماطم نابولي', 'أوراق ريحان طازجة', 'زيت زيتون بكر'],
    photos: [
      'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['بيبروني', 'pepperoni', 'سلامي', 'سجق مدخن'],
    ingredients: ['شرائح بيبروني مدخن', 'جبن موزاريلا ذائب', 'صوص طماطم إيطالي'],
    photos: [
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['فراخ باربكيو', 'bbq chicken', 'بيتزا فراخ', 'دجاج باربيكيو', 'بصل أحمر'],
    ingredients: ['قطع دجاج مشوي', 'صوص باربيكيو مدخن', 'بصل أحمر مكرمل', 'جبن موزاريلا'],
    photos: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['أربع أجبان', 'جبن', 'four cheese', 'quattro formaggi', 'شيدر', 'ريكوتا', 'بارميزان'],
    ingredients: ['موتزاريلا', 'جبنة ريكوتا', 'جورجونزولا', 'بارميزان معتق'],
    photos: [
      'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['بيتزا سجق', 'سجق بلدي', 'سوسيس', 'sausage pizza'],
    ingredients: ['سجق شرقي متبل', 'فلفل ألوان', 'زيتون كلاماتا', 'موتزاريلا'],
    photos: [
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['بيتزا خضار', 'خضروات', 'مشروم', 'فلفل رومي', 'veggie pizza', 'vegetable pizza'],
    ingredients: ['مشروم فريش', 'فلفل ألوان مقرمش', 'زيتون أسود', 'بصل', 'طماطم كرزية'],
    photos: [
      'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['سي فود بيتزا', 'جمبري بيتزا', 'seafood pizza', 'ثروات بحرية'],
    ingredients: ['جمبري متبل', 'كاليماري', 'صوص أبيض بالثوم', 'موتزاريلا'],
    photos: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    ],
  },

  // --- BURGERS BY PATTY & INGREDIENTS ---
  {
    keywords: ['برجر كلاسيك', 'بيف برجر', 'classic burger', 'تشيز برجر', 'لحم بقري'],
    ingredients: ['قطعة لحم بقري أنجوس مشوية', 'جبن شيدر ذائب', 'خس مقرمش', 'طماطم وبصل', 'صوص خاص'],
    photos: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['سماش برجر', 'دبل سماش', 'smash burger', 'double burger', 'بيكون'],
    ingredients: ['قطعتين لحم رقيقة مكرملة الحواف', 'طبقات جبن شيدر أمريكي', 'صوص لاجونا السري'],
    photos: [
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['برجر فراخ', 'تشيكن برجر', 'زنجر', 'chicken burger', 'crispy chicken'],
    ingredients: ['صدر دجاج مقرمش ذهبي', 'صوص الرانش الكريمي', 'كول سلو', 'مخلل خيار حلو'],
    photos: [
      'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['مشروم برجر', 'برجر فطر', 'سويس برجر', 'mushroom burger'],
    ingredients: ['مشروم طازج سوتيه بالزبدة', 'جبن سويسري ذائب', 'بصل مكرمل'],
    photos: [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
    ],
  },

  // --- TRIANGULAR CREPES (كريب مثلث - لاجونا دبي) ---
  {
    keywords: ['كريب فراخ', 'كريب استربس', 'كريب بانيه', 'كريب كوردن بلو', 'كريب زنجر', 'كريب شيش', 'كريب فاهيتا دجاج', 'كريب كرانشي', 'كريب ميكس دجاج', 'chicken crepe'],
    ingredients: ['كريب مثلث مقرمش وذهبي', 'قطع دجاج مقرمش أو بانيه أو شيش طاووق', 'جبنة موزاريلا ذائبة', 'صوص شيدر ومايونيز'],
    photos: [
      '/images/crepes/triangular_crepe_chicken.jpg',
      '/images/crepes/triangular_crepe.jpg',
      '/uploads/triangular_crepe_chicken.jpg',
      '/uploads/triangular_crepe.jpg',
    ],
  },
  {
    keywords: ['كريب لحوم', 'كريب لحم', 'كريب لحمة بلدي', 'كريب كفتة', 'كريب سجق', 'كريب سوسيس', 'كريب برجر', 'كريب ميكس لحوم', 'meat crepe'],
    ingredients: ['كريب مثلث ذهبي محمص', 'لحم مفروم بلدي أو كفتة مشوية أو سجق شرقي', 'موزاريلا وفلفل ألوان', 'صوص باربيكيو وشيدر'],
    photos: [
      '/images/crepes/triangular_crepe_meat.jpg',
      '/images/crepes/triangular_crepe.jpg',
      '/uploads/triangular_crepe_meat.jpg',
      '/uploads/triangular_crepe.jpg',
    ],
  },
  {
    keywords: ['كريب جبن', 'كريب ميكس جبن', 'كريب موتزاريلا', 'كريب جبنة رومي', 'كريب بطاطس', 'cheese crepe'],
    ingredients: ['كريب مثلث ذهبي ساخن', 'ميكس أجبان سايحة (موزاريلا، رومي، شيدر)', 'بطاطس مقلية ذهبية', 'صوص جبنة شيدر'],
    photos: [
      '/images/crepes/triangular_crepe_cheese.jpg',
      '/images/crepes/triangular_crepe.jpg',
      '/uploads/triangular_crepe_cheese.jpg',
      '/uploads/triangular_crepe.jpg',
    ],
  },
  {
    keywords: ['كريب نوتيلا', 'كريب شوكولاتة', 'كريب لوتس', 'كريب حلو', 'كريب فواكه', 'sweet crepe', 'nutella crepe'],
    ingredients: ['كريب مثلث محشو نوتيلا غنية', 'زبدة وبسكويت لوتس مقرمش', 'شرائح موز وفراولة طازجة', 'رشة سكر ناعم'],
    photos: [
      '/images/crepes/triangular_crepe_sweet.jpg',
      '/uploads/triangular_crepe_sweet.jpg',
      'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['وافل بلجيكي', 'وافل شيكولاتة', 'waffle', 'بلجيكي'],
    ingredients: ['وافل بلجيكي ذهبي مقرمش', 'شوكولاتة بلجيكية داكنة', 'فواكه مشكلة'],
    photos: [
      'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
    ],
  },

  // --- PASTAS BY SAUCE & INGREDIENTS ---
  {
    keywords: ['ألفريدو', 'فوتوتشيني', 'دجاج ومشروم', 'وايت صوص', 'alfredo', 'fettuccine'],
    ingredients: ['مكرونة فوتوتشيني إيطالية', 'كريمة طهي غنية بالزبدة', 'قطع صدور دجاج مشوية', 'مشروم طازج', 'بارميزان'],
    photos: [
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281298?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['أرابيانا', 'بيني حارة', 'صلصة حمراء', 'arrabbiata', 'رد صوص'],
    ingredients: ['مكرونة بيني', 'صلصة طماطم حارة بالثوم وزيت الزيتون', 'رقائق فلفل حار', 'ريحان'],
    photos: [
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281298?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['بولونيز', 'لحم مفروم', 'سباجيتي', 'bolognese'],
    ingredients: ['سباجيتي إيطالية رفيعة', 'صلصة راجو باللحم البقري المفروم', 'طماطم وبصل وجزر', 'جبن بارميزان'],
    photos: [
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281298?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    ],
  },

  // --- MOJITOS & SPECIALTY DRINKS ---
  {
    keywords: ['موهيتو فراولة', 'strawberry mojito', 'فراولة ونعناع'],
    ingredients: ['حبات فراولة طازجة مهروسة', 'أوراق نعناع بلدي', 'شرائح ليمون لايم', 'ثلج مجروش', 'صودا منعشة'],
    photos: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['موهيتو كلاسيك', 'ليمون ونعناع', 'classic mojito', 'صودا ليمون'],
    ingredients: ['عصير ليمون أخضر طازج', 'أوراق نعناع عطرية', 'سكر قصب طبيعي', 'مياه فوارة'],
    photos: [
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['باشن فروت', 'passion fruit', 'فاكهة العاطفة', 'موهيتو استوائي'],
    ingredients: ['لب باشن فروت طبيعي مع البذور', 'عصير ليمون', 'صودا مثلجة', 'نعناع طازج'],
    photos: [
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['بلو لاجون', 'بلو هاواي', 'blue curacao', 'عصير أزرق'],
    ingredients: ['سيرب بلو كوراساو أزرق', 'ليمون وسفن أب', 'ثلج نقي متبلور', 'شريحة برتقال'],
    photos: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
    ],
  },

  // --- FRESH JUICES ---
  {
    keywords: ['مانجو', 'mango juice', 'مانجو فريش', 'عصير مانجو'],
    ingredients: ['لب مانجو طبيعي ١٠٠٪ بيور', 'قطع مانجو مكعبات', 'ثلج'],
    photos: [
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['برتقال فريش', 'orange juice', 'عصير برتقال'],
    ingredients: ['برتقال معصور طازج بدون ماء مضاف', 'شرائح برتقال للزينة'],
    photos: [
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['أفوكادو', 'عسل ومكسرات', 'avocado smoothie'],
    ingredients: ['أفوكادو كريمي طازج', 'حليب كامل الدسم', 'عسل نحل جبلي', 'كاجو ولوز وبندق'],
    photos: [
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80',
    ],
  },

  // --- SPECIALTY COFFEE & HOT DRINKS ---
  {
    keywords: ['لاتيه', 'كابتشينو', 'latte', 'cappuccino', 'فلات وايت'],
    ingredients: ['جرعة اسبريسو مزدوجة أرابيكا', 'حليب مبخر مخملي مع رسمة لاتيه آرت فنية'],
    photos: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['اسبريسو', 'قهوة سنجل', 'espresso', 'دبل اسبريسو'],
    ingredients: ['خلاصة بن أرابيكا أصيل', 'طبقة كريما ذهبية بندقية كثيفة'],
    photos: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['سبانش لاتيه', 'ايس لاتيه', 'spanish latte', 'iced latte', 'كراميل'],
    ingredients: ['حليب مكثف محلى', 'اسبريسو مثلج بطبقات منفصلة', 'حليب بارد', 'مكعبات ثلج كريستالية'],
    photos: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['ماتشا', 'matcha latte', 'شاي أخضر ياباني'],
    ingredients: ['بودرة ماتشا يابانية عضوية من الدرجة الاحتفالية', 'حليب شوفان أو حليب لوز مبخر'],
    photos: [
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    ],
  },

  // --- DESSERTS & WAFFLES & PANCAKES ---
  {
    keywords: ['بان كيك', 'pancakes', 'بان كيك مابل', 'بان كيك عسل', 'بان كيك شوكولاتة'],
    ingredients: ['طبقات بان كيك ذهبية هشة وفروية', 'سيرب مابل أصلي', 'قطع فراولة وتوت طازجة', 'مكعب زبدة سائحة'],
    photos: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['وافل بابل', 'bubble waffle', 'وافل هونج كونج', 'بابل'],
    ingredients: ['وافل كرات مقرمشة ساخنة', 'بولة آيس كريم فانيليا غنية', 'قطع فواكه موسمية', 'صوص نوتيلا ولوتس'],
    photos: [
      'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['ميلك شيك', 'milkshake', 'شيك فراولة', 'شيك أوريو', 'شيك لوتس', 'شيك شوكولاتة'],
    ingredients: ['حليب طازج وآيس كريم مخفوق', 'طبقة كريمة مخفوقة غنية', 'بسكويت أوريو أو لوتس مطحون', 'صوص كراميل'],
    photos: [
      'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['فرابيه', 'frappe', 'موكا فرابيه', 'كراميل فرابيه'],
    ingredients: ['قهوة اسبريسو مثلجة مخفوقة مع حليب', 'كريمة مخفوقة وشوكولاتة شيبس', 'صوص كراميل أو موكا'],
    photos: [
      'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['سموذي', 'زبادي', 'smoothie', 'yogurt', 'زبادي فواكه'],
    ingredients: ['زبادي يوناني طبيعي مثلج', 'توت أزرق وفراولة وخوخ', 'عسل نحل نقي', 'ثلج ناعم متبلور'],
    photos: [
      'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['شاي مثلج', 'ايس تي', 'iced tea', 'شاي خوخ', 'شai ليمون'],
    ingredients: ['شاي أسود أو أخضر مروق مثلج', 'شرائح ليمون طازجة', 'نكهة خوخ أو توت طبيعية', 'أوراق نعناع'],
    photos: [
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['هوت شوكليت', 'سحلب', 'مشروبات ساخنة', 'شوكولاتة ساخنة', 'قرفة', 'شاي'],
    ingredients: ['شوكولاتة داكنة ذائبة بحليب كامل الدسم', 'مارشميلو أو مكسرات محمصة وقرفة', 'بخار عطري دافئ'],
    photos: [
      'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['ساندوتش', 'sandwich', 'كلوب ساندوتش', 'تورتيلا', 'فاهيتا', 'شاورما', 'شيش'],
    ingredients: ['خبز محمص طازج', 'شرائح دجاج متبل مشوي أو كرسبي', 'جبن ذائب وصوصات غنية', 'خضار مقرمش'],
    photos: [
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620921575116-b8a927d3b0c0?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['كومبو', 'وجبة كومبو', 'combo', 'بطاطس مقلية'],
    ingredients: ['ساندوتش محمص فاخر', 'أصابع بطاطس فرنش فرايز مقرمشة ذهبية ومملحة', 'مشروب غازي مثلج'],
    photos: [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    ],
  },
  // --- DESSERTS ---
  {
    keywords: ['مولتن كيك', 'بركان شوكولاتة', 'lava cake', 'molten cake', 'شوكليت فودج'],
    ingredients: ['كيك شوكولاتة ساخن بقلب شوكولاتة سائلة تتدفق', 'بولة آيس كريم فانيليا', 'سكر بودرة'],
    photos: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['تشيز كيك', 'سان سباستيان', 'cheesecake', 'توت أزرق'],
    ingredients: ['جبن كريمي نيويورك مخبوز', 'قاعدة بسكويت زبدية مطحونة', 'صوص توت بري أزرق'],
    photos: [
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    ],
  },

  // --- SEAFOOD & GRILLS ---
  {
    keywords: ['جمبري', 'سي فود', 'روبيان', 'shrimp', 'seafood'],
    ingredients: ['جمبري جامبو مشوي بالزبدة والثوم والأعشاب', 'ليمون وأرز بسمتي أصفر'],
    photos: [
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    keywords: ['ستيك', 'لحم مشوي', 'ريب آي', 'steak', 'مشويات'],
    ingredients: ['قطعة لحم ستيك ريب آي تندرلوين مشوية ميديوم ويل', 'زبدة بالأعشاب والروزماري', 'بطاطس ودجز'],
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

/**
 * Match a dish title and ingredients against our verified culinary catalog.
 * Scores matches based on keyword presence in title and ingredients.
 */
export function matchCulinaryPhotos(
  dishName: string,
  ingredientsText = ''
): { photos: string[]; matchedIngredients: string[]; categoryTitle: string } {
  const cleanTitle = dishName.toLowerCase().trim();
  const cleanIngredients = ingredientsText.toLowerCase().trim();
  const fullText = `${cleanTitle} ${cleanIngredients}`;

  // 1. STRICT CREPE RULE (كريب مثلث - Triangled folded crepe)
  // If the dish name or category indicates a Crepe, it MUST always return a triangular folded crepe photo
  if (cleanTitle.startsWith('كريب') || cleanTitle.includes('كريب') || cleanTitle.includes('crepe')) {
    // 1A. Chicken & Crispy Crepes (Highest precision for items like "كريب استربس", "كريب بانيه", "كريب زنجر")
    if (
      cleanTitle.includes('استربس') ||
      cleanTitle.includes('بانيه') ||
      cleanTitle.includes('زنجر') ||
      cleanTitle.includes('كرانشي') ||
      cleanTitle.includes('شيش') ||
      cleanTitle.includes('فاهيتا') ||
      cleanTitle.includes('دجاج') ||
      cleanTitle.includes('فراخ') ||
      cleanIngredients.includes('دجاج') ||
      cleanIngredients.includes('استربس') ||
      cleanIngredients.includes('بانيه')
    ) {
      return {
        photos: [
          '/images/crepes/triangular_crepe_chicken.jpg',
          '/images/crepes/triangular_crepe.jpg',
          '/uploads/triangular_crepe_chicken.jpg',
          '/uploads/triangular_crepe.jpg',
        ],
        matchedIngredients: ['كريب مثلث مقرمش وذهبي', 'قطع دجاج مقرمش (استربس أو بانيه أو شيش طاووق)', 'جبنة موزاريلا ذائبة وصوص شيدر'],
        categoryTitle: 'كريب مثلث دجاج مقرمش',
      };
    }

    // 1B. Meat / Kofta / Sujuk / Burger Crepes
    if (
      cleanTitle.includes('لحم') ||
      cleanTitle.includes('لحمة') ||
      cleanTitle.includes('كفتة') ||
      cleanTitle.includes('سجق') ||
      cleanTitle.includes('سوسيس') ||
      cleanTitle.includes('برجر') ||
      cleanTitle.includes('شاورما') ||
      cleanTitle.includes('ميكس لحوم') ||
      cleanIngredients.includes('لحم') ||
      cleanIngredients.includes('سجق') ||
      cleanIngredients.includes('كفتة')
    ) {
      return {
        photos: [
          '/images/crepes/triangular_crepe_meat.jpg',
          '/images/crepes/triangular_crepe.jpg',
          '/uploads/triangular_crepe_meat.jpg',
          '/uploads/triangular_crepe.jpg',
        ],
        matchedIngredients: ['كريب مثلث ذهبي محمص', 'لحوم شرقية متبلة (كفتة، سجق، برجر)', 'موزاريلا وصوص باربيكيو'],
        categoryTitle: 'كريب مثلث لحوم',
      };
    }

    // 1C. Cheese & Potato Crepes
    if (
      cleanTitle.includes('موتزاريلا') ||
      cleanTitle.includes('موزاريلا') ||
      cleanTitle.includes('جبن') ||
      cleanTitle.includes('أجبان') ||
      cleanTitle.includes('رومي') ||
      cleanTitle.includes('شيدر') ||
      cleanTitle.includes('بطاطس')
    ) {
      return {
        photos: [
          '/images/crepes/triangular_crepe_cheese.jpg',
          '/images/crepes/triangular_crepe.jpg',
          '/uploads/triangular_crepe_cheese.jpg',
          '/uploads/triangular_crepe.jpg',
        ],
        matchedIngredients: ['كريب مثلث ذهبي ساخن', 'ميكس أجبان سايحة (موزاريلا، رومي، شيدر)', 'بطاطس مقلية مقرمشة'],
        categoryTitle: 'كريب مثلث أجبان وبطاطس',
      };
    }

    // 1D. Sweet Crepes (Nutella, Lotus, Fruits)
    const textWithoutMozzarella = fullText.replace(/موزاريلا|موتزاريلا/g, '');
    const hasSweetWords =
      fullText.includes('نوتيلا') ||
      fullText.includes('شوكولاتة') ||
      fullText.includes('شيكولاتة') ||
      fullText.includes('لوتس') ||
      fullText.includes('فراولة') ||
      fullText.includes('عسل') ||
      textWithoutMozzarella.includes('موز') ||
      fullText.includes('حلو');

    if (hasSweetWords) {
      return {
        photos: [
          '/images/crepes/triangular_crepe_sweet.jpg',
          '/uploads/triangular_crepe_sweet.jpg',
          'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80',
        ],
        matchedIngredients: ['كريب مثلث ذهبي', 'شوكولاتة نوتيلا فاخرة', 'بسكويت لوتس وشرائح موز وفراولة'],
        categoryTitle: 'كريب مثلث نوتيلا وفواكه',
      };
    }

    // Default to crispy golden chicken triangular crepe
    return {
      photos: [
        '/images/crepes/triangular_crepe_chicken.jpg',
        '/images/crepes/triangular_crepe.jpg',
        '/uploads/triangular_crepe_chicken.jpg',
        '/uploads/triangular_crepe.jpg',
      ],
      matchedIngredients: ['كريب مثلث مقرمش وذهبي', 'قطع دجاج مقرمش (استربس أو بانيه أو شيش طاووق)', 'جبنة موزاريلا ذائبة وصوص شيدر'],
      categoryTitle: 'كريب مثلث دجاج مقرمش',
    };
  }

  // 2. STRICT PIZZA RULE (بيتزا إيطالية مخبوزة)
  if (cleanTitle.startsWith('بيتزا') || cleanTitle.includes('بيتزا') || cleanTitle.includes('pizza')) {
    const pizzaCatalog = INGREDIENT_PHOTO_CATALOG.filter(e => 
      e.keywords.some(k => k.includes('بيتزا') || k.includes('pizza') || k.includes('مارجريتا') || k.includes('بيبروني'))
    );
    if (pizzaCatalog.length > 0) {
      let best = pizzaCatalog[0];
      let maxScore = -1;
      for (const entry of pizzaCatalog) {
        let score = 0;
        for (const kw of entry.keywords) {
          if (cleanTitle.includes(kw.toLowerCase())) score += 30;
          else if (cleanIngredients.includes(kw.toLowerCase())) score += 12;
        }
        if (score > maxScore) {
          maxScore = score;
          best = entry;
        }
      }
      return {
        photos: best.photos,
        matchedIngredients: best.ingredients,
        categoryTitle: best.keywords[0],
      };
    }
  }

  // 3. Score across general catalog
  let bestMatch = INGREDIENT_PHOTO_CATALOG[0];
  let highestScore = -1;

  for (const entry of INGREDIENT_PHOTO_CATALOG) {
    let score = 0;

    // 1. Specific Title keyword matches (highest priority)
    for (const kw of entry.keywords) {
      const kwLower = kw.toLowerCase();
      if (cleanTitle.includes(kwLower)) {
        score += 30; // High priority for explicit dish name
      } else if (cleanIngredients.includes(kwLower)) {
        score += 12;
      }
    }

    // 2. Ingredients matches
    for (const ing of entry.ingredients) {
      const ingWords = ing.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      for (const word of ingWords) {
        if (cleanIngredients.includes(word)) {
          score += 6;
        } else if (fullText.includes(word)) {
          score += 3;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  return {
    photos: bestMatch.photos,
    matchedIngredients: bestMatch.ingredients,
    categoryTitle: bestMatch.keywords[0],
  };
}
