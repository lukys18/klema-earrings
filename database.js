// database.js
// Michaela Klema Earrings - Knowledge Base pre RAG chatbot
// Produktové dáta sa načítavajú dynamicky zo Shopify API
// Tento súbor obsahuje statické informácie o e-shope

window.aiPowerData = {
  
  knowledgeBase: [
    // === ZÁKLADNÉ INFORMÁCIE O E-SHOPE ===
    {
      id: "about-eshop",
      category: "o-nas",
      title: "O e-shope Michaela Klema Earrings",
      content: "E-shop Michaela Klema Earrings (klemaearrings.sk) ponúka ručne vyrábané náušnice z polymérovej hmoty. Každý pár je originál, 100% slovenský výrobok. E-shop beží na platforme Shopify. Majiteľkou je Bc. Michaela Magyarová Klemová. IČO: 55186734, DIČ: 1080997775.",
      keywords: ["eshop", "klema", "earrings", "náušnice", "o nás", "kto sme", "slovenský", "handmade"]
    },
    {
      id: "about-michaela",
      category: "o-nas",
      title: "O majiteľke Michaele (Miške)",
      content: "Volám sa Michaela, ale väčšina ma pozná ako Mišku. Som manželka a maminka synčeka Miška. K tvorbe náušníc som sa dostala počas materskej dovolenky v roku 2023. V roku 2025 som založila vlastnú značku a e-shop. Všetky šperky navrhujem a vyrábam sama vo vlastnej dielničke. Očarilo ma, koľko možností náušnice ponúkajú – tvary, farby, štruktúry, jemné kombinácie. Mám veľkú podporu od manžela a rodiny.",
      keywords: ["michaela", "miška", "majiteľka", "príbeh", "o mne", "tvorba", "ručná výroba", "dielňa"]
    },
    {
      id: "what-we-sell",
      category: "produkty",
      title: "Čo predávame",
      content: "Predávame ručne vyrábané náušnice z polymérovej hmoty. Každý pár je originál a 100% slovenský výrobok (handmade). Ponúkame aj možnosť výroby na želanie/zákazku. Náušnice sú ľahučké a vhodné na celodenné nosenie.",
      keywords: ["náušnice", "polymerová hmota", "handmade", "originál", "slovenský výrobok", "čo predávate", "produkty", "sortiment"]
    },
    {
      id: "custom-orders",
      category: "produkty",
      title: "Výroba na zákazku",
      content: "Vyrábam aj na želanie. Ak máte predstavu o vlastnom dizajne náušníc, napíšte mi správu na sociálne siete alebo na email michaelaklemaearrings@gmail.com. Spoločne vymyslíme jedinečný kúsok presne podľa vašich predstáv.",
      keywords: ["zákazka", "na mieru", "vlastný dizajn", "personalizácia", "želanie", "objednávka na mieru"]
    },

    // === KONTAKTNÉ ÚDAJE ===
    {
      id: "contact-info",
      category: "kontakt",
      title: "Kontaktné údaje",
      content: "Telefón: +421 910 275 836. E-mail: michaelaklemaearrings@gmail.com. Adresa pre osobné vyzdvihnutie: Humenská 23, Košice. Adresa pre reklamácie: Bc. Michaela Magyarová Klemová, Humenská 23, 04011 Košice, Slovensko.",
      keywords: ["kontakt", "telefón", "email", "adresa", "košice", "spojenie", "napísať", "zavolať"]
    },
    {
      id: "social-media",
      category: "kontakt",
      title: "Sociálne siete",
      content: "Sledujte ma na sociálnych sieťach! Instagram: @michaela_klema_earrings, Facebook: Michaela Klema Earrings, TikTok: @michaela.klema.ea. Zdieľam tam novinky, súťaže, inšpiráciu a informácie o handmade trhoch.",
      keywords: ["instagram", "facebook", "tiktok", "sociálne siete", "sledovať", "novinky"]
    },

    // === DOPRAVA ===
    {
      id: "shipping-methods",
      category: "doprava",
      title: "Spôsoby dopravy",
      content: "Ponúkame tieto spôsoby dopravy: Slovenská pošta doporučený list 1. triedy za 3,50€, Balíkobox Slovenská pošta za 3,10€, Kuriér Slovenskej pošty za 6,70€, Packeta výdajné miesto za 3,70€, Osobný odber v Košiciach ZDARMA.",
      keywords: ["doprava", "doručenie", "pošta", "kuriér", "packeta", "balíkobox", "cena dopravy"]
    },
    {
      id: "free-shipping",
      category: "doprava",
      title: "Doprava zdarma",
      content: "Pri objednávke nad 50€ je doprava ZDARMA! Platí pre všetky spôsoby doručenia na Slovensku.",
      keywords: ["doprava zdarma", "free shipping", "nad 50", "bezplatná doprava", "poštovné zdarma"]
    },
    {
      id: "delivery-time",
      category: "doprava",
      title: "Doba doručenia",
      content: "Tovar skladom odosielam do 1-3 pracovných dní od prijatia platby. Výrobok na objednávku/zákazku trvá približne 7-10 pracovných dní. O odoslaní balíčka vás vždy informujem e-mailom.",
      keywords: ["doba doručenia", "kedy príde", "odoslanie", "expedícia", "čakacia doba", "ako dlho"]
    },
    {
      id: "personal-pickup",
      category: "doprava",
      title: "Osobný odber",
      content: "Osobný odber je možný na adrese Humenská 23, Košice. Vyzdvihnutie je možné len po predchádzajúcej dohode e-mailom alebo telefonicky. Osobný odber je ZDARMA.",
      keywords: ["osobný odber", "vyzdvihnutie", "košice", "osobne", "zdarma"]
    },

    // === PLATBA ===
    {
      id: "payment-methods",
      category: "platba",
      title: "Platobné metódy",
      content: "Prijímame platbu kartou online cez PayPal, Stripe alebo GoPay (zdarma) a prevod na účet (zdarma). Akceptujeme karty: American Express, Apple Pay, Google Pay, Mastercard, PayPal, Visa.",
      keywords: ["platba", "platobné metódy", "karta", "paypal", "prevod", "ako zaplatiť"]
    },
    {
      id: "payment-deadline",
      category: "platba",
      title: "Lehota na zaplatenie",
      content: "Platbu je potrebné uskutočniť do 3 pracovných dní od vytvorenia objednávky. Ak platba nebude prijatá v tomto termíne, objednávka sa automaticky zruší.",
      keywords: ["lehota", "dokedy zaplatiť", "zrušenie objednávky", "termín platby"]
    },
    {
      id: "bank-account",
      category: "platba",
      title: "Bankový účet",
      content: "Číslo bankového účtu pre prevod: SK40 0900 0000 0052 3067 1224. Do poznámky uveďte číslo objednávky.",
      keywords: ["účet", "iban", "prevod", "banka", "číslo účtu"]
    },

    // === VRÁTENIE A REKLAMÁCIE ===
    {
      id: "return-policy",
      category: "vratenie",
      title: "Vrátenie tovaru",
      content: "Šperk alebo iný produkt zakúpený cez e-shop je možné vrátiť do 14 dní od doručenia v súlade so zákonom. NIE JE možné vrátiť: produkt vyrobený na mieru, šperk s personalizáciou (iniciálka, upravená veľkosť), výrobok vytvorený osobitne pre zákazníka.",
      keywords: ["vrátenie", "vrátiť", "14 dní", "odstúpenie", "nespokojnosť", "výmena"]
    },
    {
      id: "warranty-care",
      category: "vratenie",
      title: "Reklamácia a poškodenie",
      content: "Ak sa vám šperk poškodí, dajte mi vedieť - každú situáciu riešim individuálne. Reklamácia sa nevzťahuje na prirodzené opotrebovanie, stmavnutie alebo poškodenie spôsobené nešetrným nosením. V mnohých prípadoch viem šperk opraviť alebo obnoviť. Reklamačný formulár nájdete na stránke.",
      keywords: ["reklamácia", "poškodenie", "záruka", "oprava", "pokazené", "reklamovať"]
    },
    {
      id: "jewelry-care",
      category: "starostlivost",
      title: "Starostlivosť o šperky",
      content: "Aby šperky dlho vydržali: vyhýbajte sa kontaktu s vodou, potom, parfumom a kozmetikou. Odkladajte ich pred sprchou či športom. Uchovávajte na suchom mieste v mäkkom vrecúšku alebo šperkovnici. Na čistenie použite jemnú handričku.",
      keywords: ["starostlivosť", "údržba", "čistenie", "ako sa starať", "vydržia", "ošetrovanie"]
    },

    // === ZĽAVY A AKCIE ===
    {
      id: "first-order-discount",
      category: "zlavy",
      title: "Zľava na prvý nákup",
      content: "Pri prihlásení k odberu newslettera získate zľavu 10% na prvý nákup! Prihláste sa na stránke a zľavový kód dostanete e-mailom.",
      keywords: ["zľava", "prvý nákup", "10%", "newsletter", "zľavový kód", "akcia"]
    },
    {
      id: "current-promotions",
      category: "zlavy",
      title: "Aktuálne akcie",
      content: "Aktuálne ponúkame: 10% zľavu na prvý nákup pri prihlásení k newsletteru, dopravu ZDARMA pri nákupe nad 50€, a výpredajové položky so zľavou až do 37%.",
      keywords: ["akcie", "zľavy", "výpredaj", "ponuka", "špeciálna cena"]
    },

    // === HANDMADE TRHY ===
    {
      id: "markets-events",
      category: "udalosti",
      title: "Handmade trhy a jarmoky",
      content: "Momentálne sú šperky dostupné iba cez e-shop. Počas roka sa však zúčastňujem rôznych handmade trhov a jarmokov, kde si ich môžete prísť osobne pozrieť, vyskúšať a zakúpiť. Informácie o najbližších podujatiach zdieľam na Instagrame a Facebooku.",
      keywords: ["trhy", "jarmoky", "podujatia", "osobne", "udalosti", "kde kúpiť"]
    },

    // === VÝHODY NÁKUPU ===
    {
      id: "benefits",
      category: "vyhody",
      title: "Výhody nákupu",
      content: "Prečo nakúpiť u nás: 100% slovenský výrobok - všetky šperky navrhujem a vyrábam sama. Podpora handmade tvorby. Poštovné zdarma nad 50€. Možnosť výroby na želanie. Každý pár je originál. Náušnice sú ľahké a vhodné na celodenné nosenie.",
      keywords: ["výhody", "prečo", "dôvody", "benefity", "slovenské", "originál"]
    },

    // === RECENZIE ===
    {
      id: "reviews",
      category: "recenzie",
      title: "Recenzie zákazníčok",
      content: "Čo hovoria naše zákazníčky: Katka Z.: 'Náušnice sú nádherné, naživo ešte krajšie ako na fotkách. Sú ľahučké a vydržím ich nosiť celý deň.' Lucia M.: 'Veľmi krásne vypracované kúsky, teším sa z náušníc a určite ešte nakúpim.' Amália K.: 'Balíček prišiel krásne zabalený ako darček. Náušnice nosím denne, stále sa ma na ne pýtajú kamarátky.'",
      keywords: ["recenzie", "hodnotenia", "skúsenosti", "spokojnosť", "názory", "feedback"]
    },

    // === OBCHODNÉ PODMIENKY ===
    {
      id: "terms",
      category: "podmienky",
      title: "Obchodné podmienky",
      content: "VOP sú platné od 10.10.2025. E-shop je certifikovaný na pravoeshopov.sk. Maximálna lehota dodania je 30 dní od uzatvorenia zmluvy. Zvyčajná expedícia je 2-3 dni. Odstúpenie od zmluvy je možné do 14 dní. Náklady na vrátenie znáša spotrebiteľ. Platby vraciame do 14 dní.",
      keywords: ["obchodné podmienky", "VOP", "podmienky", "lehoty", "práva", "zákon"]
    },
    {
      id: "consumer-protection",
      category: "podmienky",
      title: "Ochrana spotrebiteľa",
      content: "Orgán dozoru: Inšpektorát Slovenskej obchodnej inšpekcie so sídlom v Košiciach. Adresa: Vrátna 3, P.O. BOX A-35, 040 65 Košice 1. Telefón: 055/729 07 05. E-mail: ke@soi.sk. Pri sporoch je možné využiť alternatívne riešenie sporov.",
      keywords: ["SOI", "sťažnosť", "spor", "ochrana spotrebiteľa", "inšpekcia", "dozor"]
    }
  ]
};
