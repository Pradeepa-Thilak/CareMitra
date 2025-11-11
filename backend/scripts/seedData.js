const mongoose = require('mongoose');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
require('dotenv').config();

// Categories (same as before)
const categories = [
  {
    name: 'Stomach Care',
    key: 'stomach-care',
    image: 'https://example.com/images/stomach-care.jpg',
    description: 'Medicines and products for digestive health and stomach care'
  },
  {
    name: 'Liver Care',
    key: 'liver-care',
    image: 'https://example.com/images/liver-care.jpg',
    description: 'Products to support liver function and detoxification'
  },
  {
    name: 'Kidney Care',
    key: 'kidney-care',
    image: 'https://example.com/images/kidney-care.jpg',
    description: 'Supplements and medicines for kidney health'
  },
  {
    name: 'Derma Care',
    key: 'derma-care',
    image: 'https://example.com/images/derma-care.jpg',
    description: 'Skincare products for various dermatological conditions'
  },
  {
    name: 'Eye Care',
    key: 'eye-care',
    image: 'https://example.com/images/eye-care.jpg',
    description: 'Eye drops and supplements for vision and eye health'
  },
  {
    name: 'Respiratory Care',
    key: 'respiratory-care',
    image: 'https://example.com/images/respiratory-care.jpg',
    description: 'Medicines for asthma, allergies, and respiratory issues'
  },
  {
    name: 'Bone, Joints & Muscle Care',
    key: 'bone-joints-muscle-care',
    image: 'https://example.com/images/bone-care.jpg',
    description: 'Supplements for bone strength and joint mobility'
  },
  {
    name: 'Diabetes Care',
    key: 'diabetes-care',
    image: 'https://example.com/images/diabetes-care.jpg',
    description: 'Medicines and monitoring devices for diabetes management'
  },
  {
    name: 'Heart Care',
    key: 'heart-care',
    image: 'https://example.com/images/heart-care.jpg',
    description: 'Products for cardiovascular health and blood pressure management'
  }
];

// Featured Brands
const brands = [
  {
    name: 'Vidaslim',
    key: 'vidaslim',
    image: 'https://example.com/images/brands/vidaslim.jpg',
    description: 'Premium weight management and wellness products',
    isFeatured: true
  },
  {
    name: 'Miduty',
    key: 'miduty',
    image: 'https://example.com/images/brands/miduty.jpg',
    description: 'Healthcare products for daily wellness',
    isFeatured: true
  },
  {
    name: 'Dr. Morepen',
    key: 'dr-morepen',
    image: 'https://example.com/images/brands/dr-morepen.jpg',
    description: 'Trusted healthcare and monitoring devices',
    isFeatured: true
  },
  {
    name: 'Organic India',
    key: 'organic-india',
    image: 'https://example.com/images/brands/organic-india.jpg',
    description: 'Organic and herbal wellness products',
    isFeatured: true
  },
  {
    name: 'Dabur',
    key: 'dabur',
    image: 'https://example.com/images/brands/dabur.jpg',
    description: 'Ayurvedic healthcare products since 1884',
    isFeatured: true
  },
  {
    name: 'Well Being Nutrition',
    key: 'well-being-nutrition',
    image: 'https://example.com/images/brands/well-being-nutrition.jpg',
    description: 'Modern nutrition supplements for holistic health',
    isFeatured: true
  },
  {
    name: 'Prohance',
    key: 'prohance',
    image: 'https://example.com/images/brands/prohance.jpg',
    description: 'Nutritional supplements for health and wellness',
    isFeatured: true
  },
  {
    name: 'Tata 1mg',
    key: 'tata-1mg',
    image: 'https://example.com/images/brands/tata-1mg.jpg',
    description: 'Trusted healthcare products and medicines',
    isFeatured: true
  },
  {
    name: 'Tata 1mg Tejaysa',
    key: 'tata-1mg-tejaysa',
    image: 'https://example.com/images/brands/tata-1mg-tejaysa.jpg',
    description: 'Specialized healthcare solutions',
    isFeatured: true
  }
];

// Products organized by brand and category
const productsData = [
  // Vidaslim Products
  {
    brand: 'vidaslim',
    category: 'stomach-care',
    products: [
      {
        name: 'Vidaslim Weight Management Capsules',
        price: 899, discount: 15, stock: 50,
        description: 'Advanced weight management formula with natural ingredients',
        images: ['https://example.com/images/vidaslim-weight.jpg']
      },
      {
        name: 'Vidaslim Metabolism Booster',
        price: 750, discount: 10, stock: 40,
        description: 'Boosts metabolism and supports healthy weight loss',
        images: ['https://example.com/images/vidaslim-metabolism.jpg']
      }
    ]
  },
  {
    brand: 'vidaslim',
    category: 'diabetes-care',
    products: [
      {
        name: 'Vidaslim Sugar Control',
        price: 650, discount: 12, stock: 35,
        description: 'Helps maintain healthy blood sugar levels',
        images: ['https://example.com/images/vidaslim-sugar.jpg']
      }
    ]
  },

  // Dabur Products
  {
    brand: 'dabur',
    category: 'stomach-care',
    products: [
      {
        name: 'Dabur Hajmola',
        price: 25, discount: 0, stock: 200,
        description: 'Digestive tablets for instant relief from indigestion',
        images: ['https://example.com/images/dabur-hajmola.jpg']
      },
      {
        name: 'Dabur Chyawanprash',
        price: 320, discount: 20, stock: 80,
        description: 'Traditional Ayurvedic immunity booster',
        images: ['https://example.com/images/dabur-chyawanprash.jpg']
      }
    ]
  },
  {
    brand: 'dabur',
    category: 'liver-care',
    products: [
      {
        name: 'Dabur Liver Care Capsules',
        price: 185, discount: 15, stock: 60,
        description: 'Ayurvedic liver detox and protection formula',
        images: ['https://example.com/images/dabur-liver.jpg']
      }
    ]
  },

  // Organic India Products
  {
    brand: 'organic-india',
    category: 'stomach-care',
    products: [
      {
        name: 'Organic India Tulsi Tea',
        price: 280, discount: 10, stock: 100,
        description: 'Organic tulsi tea for stress relief and immunity',
        images: ['https://example.com/images/organic-tulsi-tea.jpg']
      },
      {
        name: 'Organic India Psyllium Husk',
        price: 350, discount: 12, stock: 70,
        description: 'Natural fiber supplement for digestive health',
        images: ['https://example.com/images/organic-psyllium.jpg']
      }
    ]
  },
  {
    brand: 'organic-india',
    category: 'heart-care',
    products: [
      {
        name: 'Organic India Ashwagandha',
        price: 420, discount: 15, stock: 55,
        description: 'Stress relief and heart health supplement',
        images: ['https://example.com/images/organic-ashwagandha.jpg']
      }
    ]
  },

  // Tata 1mg Products
  {
    brand: 'tata-1mg',
    category: 'derma-care',
    products: [
      {
        name: 'Tata 1mg Vitamin C Serum',
        price: 599, discount: 25, stock: 45,
        description: 'Brightening serum for radiant skin',
        images: ['https://example.com/images/tata1mg-vitamin-c.jpg']
      },
      {
        name: 'Tata 1mg Sunscreen Lotion',
        price: 450, discount: 20, stock: 60,
        description: 'Broad spectrum SPF 50 sunscreen',
        images: ['https://example.com/images/tata1mg-sunscreen.jpg']
      }
    ]
  },
  {
    brand: 'tata-1mg',
    category: 'eye-care',
    products: [
      {
        name: 'Tata 1mg Eye Drops',
        price: 199, discount: 10, stock: 85,
        description: 'Lubricating eye drops for dry eyes',
        images: ['https://example.com/images/tata1mg-eye-drops.jpg']
      }
    ]
  },

  // Add more brands and products following the same pattern...
  // Dr. Morepen, Well Being Nutrition, Prohance, etc.
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Brand.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing data');

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.key] = cat._id;
    });
    console.log('Categories inserted');

    // Insert brands
    const createdBrands = await Brand.insertMany(brands);
    const brandMap = {};
    createdBrands.forEach(brand => {
      brandMap[brand.key] = brand._id;
    });
    console.log('Brands inserted');

    // Insert products
    let totalProducts = 0;
    
    for (const productGroup of productsData) {
      const brandId = brandMap[productGroup.brand];
      const categoryId = categoryMap[productGroup.category];
      
      const productsWithRelations = productGroup.products.map(product => ({
        ...product,
        brand: brandId,
        category: categoryId
      }));

      await Product.insertMany(productsWithRelations);
      totalProducts += productGroup.products.length;
      console.log(`Added ${productGroup.products.length} products for ${productGroup.brand} in ${productGroup.category}`);
    }

    console.log('Database seeded successfully');
    console.log(`\n📊 Database Summary:`);
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Brands: ${createdBrands.length}`);
    console.log(`Total Products: ${totalProducts}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();