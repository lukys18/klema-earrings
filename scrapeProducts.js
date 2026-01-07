// scrapeProducts.js
// XML Product Scraper pre Klema Earrings
// Načíta produkty zo Shopify sitemap a extrahuje detaily z každej stránky

import fetch from 'node-fetch';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import fs from 'fs/promises';
import * as cheerio from 'cheerio';

const parseXML = promisify(parseString);

// Konfigurácia
const SHOPIFY_SITEMAP_URL = 'https://klemaearrings.sk/sitemap_products_1.xml?from=15242494083420&to=15369088663900';
const PRODUCTS_DATABASE_FILE = './products-database.js';
const DELAY_BETWEEN_REQUESTS = 500; // ms delay medzi requestami

async function scrapeProducts() {
  console.log('🔄 Spúšťam XML sitemap scraper...');
  
  try {
    // 1. Načítaj XML sitemap
    console.log(`📡 Načítavam sitemap z: ${SHOPIFY_SITEMAP_URL}`);
    const response = await fetch(SHOPIFY_SITEMAP_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    console.log(`✅ Sitemap načítaná (${xmlText.length} znakov)`);
    
    // 2. Parsuj XML sitemap
    console.log('🔍 Parsujem sitemap XML...');
    const xmlData = await parseXML(xmlText, { explicitArray: false });
    
    // 3. Extrahuj URL produktov
    let urls = [];
    if (xmlData?.urlset?.url) {
      urls = Array.isArray(xmlData.urlset.url) 
        ? xmlData.urlset.url 
        : [xmlData.urlset.url];
    }
    
    console.log(`📦 Nájdených ${urls.length} produktových URL`);
    
    if (urls.length === 0) {
      throw new Error('Žiadne produkty v sitemap!');
    }
    
    // 4. Pre každý URL extrahuj detaily produktu
    const products = [];
    
    for (let i = 0; i < urls.length; i++) {
      const urlEntry = urls[i];
      const productUrl = urlEntry.loc;
      
      console.log(`\n[${i + 1}/${urls.length}] 🔍 Scrapujem: ${productUrl}`);
      
      try {
        const productData = await scrapeProductPage(productUrl, urlEntry);
        if (productData) {
          products.push(productData);
          console.log(`   ✅ ${productData.title} - €${productData.price}`);
        }
      } catch (error) {
        console.error(`   ❌ Chyba pri scrapovaní ${productUrl}:`, error.message);
      }
      
      // Delay medzi requestami
      if (i < urls.length - 1) {
        await delay(DELAY_BETWEEN_REQUESTS);
      }
    }
    
    console.log(`\n✅ Produkty spracované: ${products.length}/${urls.length}`);
    
    // 5. Vytvor nový products-database.js súbor
    console.log('💾 Zapisujem products-database.js...');
    const databaseContent = generateProductsDatabase(products);
    await fs.writeFile(PRODUCTS_DATABASE_FILE, databaseContent, 'utf-8');
    console.log('✅ Products-database.js vytvorený!');
    
    // 6. Výstupná štatistika
    console.log('\n✅ HOTOVO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Celkom produktov: ${products.length}`);
    console.log(`💰 Priemerná cena: €${(products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)}`);
    console.log(`🔄 Posledná aktualizácia: ${new Date().toLocaleString('sk-SK')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Zobraz prvé 3 produkty ako ukážku
    console.log('📋 Ukážka produktov:');
    products.slice(0, 3).forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} - €${p.price.toFixed(2)}`);
    });
    
    return {
      success: true,
      totalProducts: products.length,
      products: products
    };
    
  } catch (error) {
    console.error('❌ CHYBA pri scrapovaní:', error);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Scrape produktovú stránku a extrahuj detaily
async function scrapeProductPage(url, urlEntry) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extrahuj názov produktu z h1.h3.product-details-product-title
    // Použijeme .first() a .clone() pre vyčistenie od vnorených elementov
    let title = '';
    const titleEl = $('h1.h3.product-details-product-title').first();
    if (titleEl.length) {
      // Vezmeme iba priamy textový obsah (nie z vnorených elementov)
      title = titleEl.clone().children().remove().end().text().trim();
      // Ak je prázdny, skúsime celý text
      if (!title) {
        title = titleEl.text().trim();
        // Ak je zduplikovaný, vezmeme iba prvú polovicu
        if (title.length > 10) {
          const half = title.length / 2;
          const firstHalf = title.substring(0, half);
          const secondHalf = title.substring(half);
          if (firstHalf === secondHalf) {
            title = firstHalf;
          }
        }
      }
    }
    
    // Fallback na h1.product-details-product-title
    if (!title) {
      const altTitleEl = $('h1.product-details-product-title').first();
      if (altTitleEl.length) {
        title = altTitleEl.text().trim();
      }
    }
    
    // Ak nemá názov, preskočíme tento produkt (pravdepodobne to nie je produktová stránka)
    if (!title) {
      return null;
    }
    
    // Extrahuj cenu
    let price = 0;
    const priceText = $('money.bacurr-money').first().text().trim() ||
                      $('.money').first().text().trim();
    if (priceText) {
      price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'));
    }
    
    // Extrahuj informačné ikony - iba prvé 3
    const infoTexts = [];
    $('span.text-with-icon--text').each((i, el) => {
      if (i < 3) { // Iba prvé 3
        const text = $(el).text().trim();
        if (text) infoTexts.push(text);
      }
    });
    
    // Extrahuj hlavný obrázok z img.theme-img.media-ratio--square
    let image = '';
    const imgSrc = $('img.theme-img.media-ratio--square').first().attr('src');
    if (imgSrc) {
      image = imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc;
      // Odstráň query parametre pre konzistentnú URL
      image = image.split('?')[0];
    }
    
    // Extrahuj popis z .product-description .text-link-animated - všetky <p> tagy
    let description = '';
    const descriptionEl = $('.product-description .text-link-animated').first();
    if (descriptionEl.length) {
      const paragraphs = [];
      descriptionEl.find('p').each((i, el) => {
        // Vezmeme textový obsah každého <p> tagu
        const text = $(el).text().trim();
        if (text) paragraphs.push(text);
      });
      description = paragraphs.join('\n\n');
    }
    
    // Fallback ak nie je description
    if (!description) {
      const fallbackEl = $('.product-description').first();
      if (fallbackEl.length) {
        const paragraphs = [];
        fallbackEl.find('p').each((i, el) => {
          const text = $(el).text().trim();
          if (text) paragraphs.push(text);
        });
        description = paragraphs.join('\n\n');
      }
    }
    
    // Extrahuj availability z .level-indicator-message
    let availability = '';
    const availabilityEl = $('.level-indicator-message').first();
    if (availabilityEl.length) {
      availability = availabilityEl.text().trim();
    }
    
    // Extrahuj farby z variantov
    const colors = [];
    $('li[data-option-value][data-option-name="Farba"]').each((i, el) => {
      const color = $(el).attr('data-option-value');
      if (color && !colors.includes(color)) {
        colors.push(color);
      }
    });
    
    // Generate product ID from URL
    const productId = url.split('/products/')[1]?.split('?')[0] || `product-${Date.now()}`;
    
    return {
      id: productId,
      title: title,
      url: url,
      price: price || 0,
      image: image,
      description: description,
      availability: availability || null,
      colors: colors.length > 0 ? colors : null,
      infoTexts: infoTexts.length > 0 ? infoTexts : null,
      lastUpdated: urlEntry.lastmod || new Date().toISOString(),
      keywords: generateKeywords({ title, description })
    };
    
  } catch (error) {
    console.error(`Chyba pri scrapovaní ${url}:`, error.message);
    return null;
  }
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generuje celý products-database.js súbor
function generateProductsDatabase(products) {
  const productsJS = products.map(p => {
    // Prepare infoTexts string
    let infoTextsStr = 'null';
    if (p.infoTexts && p.infoTexts.length > 0) {
      const infoTextsArray = p.infoTexts.map(t => '"' + escapeString(t) + '"').join(', ');
      infoTextsStr = '[' + infoTextsArray + ']';
    }
    
    // Prepare colors string
    let colorsStr = 'null';
    if (p.colors && p.colors.length > 0) {
      const colorsArray = p.colors.map(c => '"' + escapeString(c) + '"').join(', ');
      colorsStr = '[' + colorsArray + ']';
    }
    
    // Prepare keywords string
    const keywordsStr = p.keywords.map(k => '"' + escapeString(k) + '"').join(', ');
    
    return `  {
    id: "${p.id}",
    title: "${escapeString(p.title)}",
    url: "${p.url}",
    price: ${p.price.toFixed(2)},
    image: "${p.image}",
    description: "${escapeString(p.description)}",
    availability: ${p.availability ? '"' + escapeString(p.availability) + '"' : 'null'},
    colors: ${colorsStr},
    infoTexts: ${infoTextsStr},
    lastUpdated: "${p.lastUpdated}",
    keywords: [${keywordsStr}]
  }`;
  }).join(',\n');
  
  return `// products-database.js
// Automaticky vygenerované zo Shopify XML sitemap
// Posledná aktualizácia: ${new Date().toLocaleString('sk-SK')}
// Celkom produktov: ${products.length}
// NEMENUJ MANUÁLNE - spusti npm run scrape pre aktualizáciu

window.productsData = [
${productsJS}
];
`;
}

// Escape špeciálne znaky v stringoch
function escapeString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .trim();
}

// Generuje keywords pre produkt
function generateKeywords(product) {
  const keywords = new Set();
  
  // Pridaj slová z názvu
  product.title.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 2) keywords.add(word);
  });
  
  // Pridaj slová z popisu
  if (product.description) {
    product.description.toLowerCase().split(/\s+/).slice(0, 10).forEach(word => {
      if (word.length > 3) keywords.add(word);
    });
  }
  
  // Pridaj základné keywords
  keywords.add('nausnice');
  keywords.add('earrings');
  keywords.add('sperk');
  keywords.add('handmade');
  keywords.add('klema');
  
  return Array.from(keywords).slice(0, 20);
}

// Spusť scraper
scrapeProducts();
