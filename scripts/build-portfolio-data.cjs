const fs = require('fs');
const path = require('path');

const publicDir = path.resolve('public');
const ourWorkDir = path.join(publicDir, 'Portfolio', 'Our Work');
const thumbDir = path.join(publicDir, 'Portfolio', 'thumbnails');

// Read album photos with WebP thumbnail support
function getAlbumPhotos(albumName) {
  const albumPath = path.join(ourWorkDir, 'Photo Albums', albumName);
  if (!fs.existsSync(albumPath)) return [];
  const files = fs.readdirSync(albumPath).filter(f => !fs.statSync(path.join(albumPath, f)).isDirectory());
  
  return files.map(file => {
    const baseName = path.parse(file).name;
    const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Check webp thumbnail first
    let thumbRel = `Photo Albums/${albumName}/${cleanBase}.webp`;
    let diskThumb = path.join(thumbDir, 'Photo Albums', albumName, cleanBase + '.webp');
    if (!fs.existsSync(diskThumb)) {
      diskThumb = path.join(thumbDir, 'Photo Albums', albumName, baseName + '.webp');
      if (fs.existsSync(diskThumb)) {
        thumbRel = `Photo Albums/${albumName}/${baseName}.webp`;
      } else {
        thumbRel = `Photo Albums/${albumName}/${cleanBase}.jpg`;
      }
    }

    const originalUrl = `/Portfolio/Our Work/Photo Albums/${encodeURI(albumName)}/${encodeURI(file)}`;
    const thumbUrl = `/Portfolio/thumbnails/${encodeURI(thumbRel)}`;
    return {
      src: originalUrl,
      thumb: thumbUrl,
      name: file
    };
  });
}

// 12 Photo Albums
const albums = [
  {
    id: 'coca-cola-world-cup',
    title: "Coca-Cola - ICC Men's T20 World Cup 2024",
    client: 'The Coca-Cola Company',
    category: 'event',
    subCategory: 'Global Stadium Activation & Fan Zone',
    year: '2024',
    badge: '30 PHOTOS',
    aspectRatio: '3-2',
    folder: 'Coca Cola ICC World Cup 2024',
    coverFile: 'DSC00016.jpg',
    desc: "Complete photographic coverage and brand activation for the ICC T20 Men's World Cup in Trinidad - capturing stadium energy, fan zone experiences, and branded installations."
  },
  {
    id: 'shell-gala-2025',
    title: 'Shell Trinidad - Black & White Annual Gala',
    client: 'Shell Trinidad & Tobago',
    category: 'event',
    secondaryCategories: ['motionmagic'],
    subCategory: 'Corporate Gala & Red Carpet',
    year: '2025',
    badge: '15 PHOTOS · BOOTH',
    aspectRatio: '4-5',
    folder: 'SHELL Black & White Gala 2025',
    coverFile: 'untitled-12.jpg',
    desc: "Flagship corporate coverage for Shell's annual gala, featuring red carpet VIP arrivals, stage production, and live MotionMagic Cam robotic arm activations."
  },
  {
    id: 'visa-hyatt-lime',
    title: 'VISA - Hyatt Carnival Hospitality Suite',
    client: 'VISA Caribbean',
    category: 'event',
    secondaryCategories: ['motionmagic'],
    subCategory: 'Corporate Hospitality & VIP Lounge',
    year: '2025',
    badge: '10 PHOTOS',
    aspectRatio: '4-5',
    folder: 'VISA HYATT LIME 2025',
    coverFile: '32.png',
    desc: 'High-level executive networking and Carnival brand activation at the Hyatt Regency Trinidad hospitality suite.'
  },
  {
    id: 'coca-cola-the-brix',
    title: 'Coca-Cola - Sunset Hours at The Brix',
    client: 'The Coca-Cola Company',
    category: 'event',
    subCategory: 'Luxury Hospitality & Sunset Lounge',
    year: '2024',
    badge: '15 PHOTOS',
    aspectRatio: '4-5',
    folder: 'Coca Cola Sunset Hours THE BRIX',
    coverFile: 'PICTURE-12.JPG',
    desc: 'Curated rooftop brand experience and sunset cocktail lounge activation at The Brix Autograph Collection hotel.'
  },
  {
    id: 'heart-sole-5k',
    title: 'Heart & Sole Foundation - 5K Charity Marathon',
    client: 'Heart & Sole Foundation',
    category: 'event',
    subCategory: 'Community Wellness & Road Race',
    year: '2025',
    badge: '15 PHOTOS',
    aspectRatio: '1-1',
    folder: 'Heart & Sole Foundation 5k 2025',
    coverFile: 'Picture-22.jpg',
    desc: 'Dynamic road race photography capturing 1,000+ runners, community spirit, podium awards, and corporate wellness sponsor engagement.'
  },
  {
    id: 'coca-cola-golf',
    title: 'Coca-Cola - Rockaway Golf Invitational',
    client: 'The Coca-Cola Company',
    category: 'event',
    subCategory: 'Corporate Golf Tournament',
    year: '2024',
    badge: '11 PHOTOS',
    aspectRatio: '3-2',
    folder: 'Coca Cola Rockaway Gulf Tournament 2024',
    coverFile: 'PICTURE-12.JPG',
    desc: 'On-course brand presence, executive swing action, and trophy presentations at the annual Rockaway Invitational.'
  },
  {
    id: 'minister-renuka-brunch',
    title: "Minister Renuka's Executive VIP Brunch",
    client: 'Government / Ministry Protocol',
    category: 'event',
    subCategory: 'Diplomatic Protocol & Executive Dining',
    year: '2025',
    badge: '16 PHOTOS',
    aspectRatio: '3-2',
    folder: 'Minister Renuka_s Brunch 2025',
    coverFile: 'JPI01169.jpg',
    desc: 'High-profile diplomatic and government executive brunch in Port of Spain, featuring keynote addresses and dignitary photography.'
  },
  {
    id: 'shell-christmas-2024',
    title: 'Shell Trinidad - Annual Christmas Celebration',
    client: 'Shell Trinidad & Tobago',
    category: 'event',
    subCategory: 'Corporate Gala & Entertainment',
    year: '2024',
    badge: '15 PHOTOS',
    aspectRatio: '3-2',
    folder: 'SHELL Christmas 2024',
    coverFile: 'Picture -11.jpg',
    desc: 'End-of-year corporate festival featuring live performances, executive toasts, and employee celebration moments.'
  },
  {
    id: 'web-source-christmas',
    title: 'Web Source - Corporate Celebration',
    client: 'Web Source TT',
    category: 'event',
    subCategory: 'Corporate Gala & Staff Awards',
    year: '2024',
    badge: '15 PHOTOS',
    aspectRatio: '3-2',
    folder: 'WEB SOURCE CHRISTMAS',
    coverFile: 'Picture -185.jpg',
    desc: 'Dynamic corporate staff celebration, employee achievement awards, and holiday festivities for the national logistics leader.'
  },
  {
    id: 'rhl-awards-2024',
    title: 'RHL - Corporate Excellence Awards',
    client: 'RHL Group',
    category: 'event',
    subCategory: 'Recognition Ceremony & Gala Dinner',
    year: '2024',
    badge: '10 PHOTOS',
    aspectRatio: '1-1',
    folder: 'RHL Award Ceremony 2024',
    coverFile: 'Picture-13.jpg',
    desc: 'Corporate recognition ceremony honoring employee excellence, long service awards, and leadership milestones.'
  },
  {
    id: 'uwicu-memorial',
    title: 'UWICU - Commemorative Memorial Service',
    client: 'UWI Credit Union',
    category: 'event',
    subCategory: 'Institutional Ceremony & Tribute',
    year: '2025',
    badge: '15 PHOTOS',
    aspectRatio: '3-2',
    folder: 'UWICU Memorial 2025',
    coverFile: 'LLP04116.jpg',
    desc: 'Solemn and dignified institutional photography honoring credit union pioneers, featuring choir performances and memorial tributes.'
  },
  {
    id: 'grad-photos',
    title: 'Academic Milestones - Graduation Portraits',
    client: 'Private & Institutional Commissions',
    category: 'event',
    subCategory: 'Fine Art Portraiture & Milestone',
    year: '2025',
    badge: '10 PHOTOS',
    aspectRatio: '4-5',
    folder: 'Grad Photos',
    coverFile: 'Picture-22.jpg',
    desc: 'Editorial cap & gown graduation portraits celebrating academic achievement and personal heritage.'
  }
];

// Commercial Videos
const commercialVideos = [
  {
    id: 'bk-thi-king-horizontal',
    title: 'Burger King - "Thi-King" Sandwich Commercial',
    client: 'Burger King TT',
    category: 'commercial',
    subCategory: 'Broadcast TV & Digital Spot',
    year: '2024',
    badge: '0:12 · 16:9 WIDE',
    aspectRatio: '16-9',
    type: 'video',
    aspect: '16:9',
    duration: '0:12',
    posterFile: 'Videos/BK - Thi_King Sandwich - Horizontal.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/BK%20-%20Thi_King%20Sandwich%20-%20Horizontal.mp4',
    desc: 'Broadcast television and digital commercial for Burger King\'s signature Thi-King sandwich, highlighting fresh culinary ingredients with dynamic speed-ramp cinematography.'
  },
  {
    id: 'bk-thi-king-vertical',
    title: 'Burger King - "Thi-King" Social Reel',
    client: 'Burger King TT',
    category: 'commercial',
    subCategory: 'Vertical Social & TikTok Campaign',
    year: '2024',
    badge: '0:12 · 9:16 VERTICAL',
    aspectRatio: '9-16',
    type: 'video',
    aspect: '9:16',
    duration: '0:12',
    posterFile: 'Videos/BK - Thi_King Sandwich Vertical.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/BK%20-%20Thi_King%20Sandwich%20Vertical.mp4',
    desc: 'Fast-paced vertical social motion ad engineered for mobile screens, high click-through rates, and social conversions.'
  },
  {
    id: 'kes-the-band-iz-we',
    title: 'Popeyes TT x Kes The Band - "Iz We" Concert Activation',
    client: 'Popeyes TT & Kes The Band',
    category: 'commercial',
    subCategory: 'Carnival Festival & Concert Reel',
    year: '2024',
    badge: '0:20 · 9:16 REEL',
    aspectRatio: '9-16',
    type: 'video',
    aspect: '9:16',
    duration: '0:20',
    posterFile: 'Videos/KES Iz We Promotion_REELS.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/KES%20Iz%20We%20Promotion_REELS.mp4',
    desc: 'High-energy concert ticket giveaway promotional reel combining Popeyes signature combos with Kes The Band Carnival energy.'
  },
  {
    id: 'bmobile-emerald-city',
    title: 'Bmobile - "Emerald City" Brand Spot',
    client: 'Bmobile Trinidad & Tobago',
    category: 'commercial',
    subCategory: 'National Telecom Brand Spot',
    year: '2024',
    badge: '0:14 · 16:9 WIDE',
    aspectRatio: '16-9',
    type: 'video',
    aspect: '16:9',
    duration: '0:14',
    posterFile: 'Videos/Bmobile Emerald City.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/Bmobile%20Emerald%20City.mp4',
    desc: 'Vibrant, stylized brand commercial showcasing high-speed mobile connectivity powering Trinidad & Tobago\'s urban creative culture.'
  },
  {
    id: 'digicel-back-to-school',
    title: 'Digicel - "Back to School" Commercial',
    client: 'Digicel TT',
    category: 'commercial',
    subCategory: 'Seasonal Retail Campaign',
    year: '2024',
    badge: '0:15 · 16:9 WIDE',
    aspectRatio: '16-9',
    type: 'video',
    aspect: '16:9',
    duration: '0:15',
    posterFile: 'Videos/Digicel Back to School.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/Digicel%20Back%20to%20School.mp4',
    desc: 'Energetic broadcast spot communicating nationwide back-to-school bundles, data plans, and family connectivity offers.'
  },
  {
    id: 'burger-king-maraval',
    title: 'Burger King - Maraval Drive-Thru Launch',
    client: 'Burger King TT',
    category: 'commercial',
    subCategory: 'Store Opening & Motion Billboard',
    year: '2024',
    badge: '0:15 · 16:9 WIDE',
    aspectRatio: '16-9',
    type: 'video',
    aspect: '16:9',
    duration: '0:15',
    posterFile: 'Videos/Burger King Maraval Motion Ad.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/Burger King Maraval Motion Ad.mp4',
    desc: 'High-impact motion spot celebrating the flagship Maraval restaurant opening, designed for synchronized digital screens and social launch.'
  },
  {
    id: 'bk-steakhouse-story',
    title: 'Burger King - Steakhouse Bacon Whopper',
    client: 'Burger King TT',
    category: 'commercial',
    secondaryCategories: ['digital'],
    subCategory: 'App & Social Story Campaign',
    year: '2024',
    badge: '0:10 · 9:16 STORY',
    aspectRatio: '9-16',
    type: 'video',
    aspect: '9:16',
    duration: '0:10',
    posterFile: 'Videos/Burger King - Steakhouse Bacon Whopper - Story.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/Burger%20King%20-%20Steakhouse%20Bacon%20Whopper%20-%20Story.mp4',
    desc: 'App-first interactive vertical story ad driving immediate mobile delivery orders for the limited-edition Steakhouse Bacon Whopper.'
  },
  {
    id: 'bk-mothers-day',
    title: "Burger King - Mother's Day Campaign",
    client: 'Burger King TT',
    category: 'commercial',
    secondaryCategories: ['digital'],
    subCategory: 'Feed Motion Special',
    year: '2024',
    badge: '0:15 · 4:5 FEED',
    aspectRatio: '4-5',
    type: 'video',
    aspect: '4:5',
    duration: '0:15',
    posterFile: 'Videos/BK MOTHER_S DAY OFFER 1080X1350.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/BK%20MOTHER_S%20DAY%20OFFER%201080X1350.mp4',
    desc: 'Custom 4:5 aspect ratio motion campaign engineered specifically for Instagram & Facebook feed visibility.'
  },
  {
    id: 'rbl-cpl-cricket',
    title: 'Republic Bank - Caribbean Premier League',
    client: 'Republic Bank Caribbean',
    category: 'commercial',
    subCategory: 'Sports Sponsorship & Stadium Commercial',
    year: '2024',
    badge: '0:30 · 16:9 WIDE',
    aspectRatio: '16-9',
    type: 'video',
    aspect: '16:9',
    duration: '0:30',
    posterFile: 'Videos/RBL_CPL.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/RBL_CPL.mp4',
    desc: 'High-energy Caribbean Premier League (CPL) commercial celebrating cricket culture, fan passion, and regional banking leadership.'
  },
  {
    id: 'icatt-conference',
    title: 'ICATT - Annual International Conference',
    client: 'ICATT Trinidad',
    category: 'commercial',
    subCategory: 'Conference Opener & Brand Anthem',
    year: '2024',
    badge: '0:30 · 16:9 WIDE',
    aspectRatio: '16-9',
    type: 'video',
    aspect: '16:9',
    duration: '0:30',
    posterFile: 'Videos/iCATT_2.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/iCATT_2.mp4',
    desc: 'Prestigious opening video for the Institute of Chartered Accountants of Trinidad & Tobago annual conference at Hyatt Regency.'
  },
  {
    id: 'tailgate-mardi-gras',
    title: 'Tailgate - Mardi Gras Carnival Event Spot',
    client: 'Tailgate Entertainment',
    category: 'commercial',
    subCategory: 'Carnival Event Promo & Teaser',
    year: '2024',
    badge: '0:30 · 16:9 WIDE',
    aspectRatio: '16-9',
    type: 'video',
    aspect: '16:9',
    duration: '0:30',
    posterFile: 'Videos/Tailgate_Mardi Gras.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/Tailgate_Mardi%20Gras.mp4',
    desc: 'Cinematic Carnival teaser capturing festival excitement, world-class DJs, and premium tailgate production.'
  }
];

// MotionMagic Cam & 360 Booths
const motionMagicProjects = [
  {
    id: 'mmc-glam-bot-1',
    title: 'Avionne & Anton Wedding - MotionMagic Glam Bot Experience',
    client: 'Private Wedding Commission',
    category: 'motionmagic',
    subCategory: 'High-Speed Precision Robotic Arm',
    year: '2025',
    badge: '0:10 · 9:16 BOT',
    aspectRatio: '9-16',
    type: 'video',
    aspect: '9:16',
    duration: '0:10',
    posterFile: 'Videos/MMC videos/Ex_1.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/MMC%20videos/Ex_1.mp4',
    desc: 'High-speed robotic cinema capturing red-carpet wedding arrivals on a scenic colonial estate.'
  },
  {
    id: 'mmc-glam-bot-2',
    title: 'Avionne & Anton Wedding - Nighttime Cinema Session',
    client: 'Private Wedding Commission',
    category: 'motionmagic',
    subCategory: 'High-Speed Precision Robotic Arm',
    year: '2025',
    badge: '0:10 · 9:16 BOT',
    aspectRatio: '9-16',
    type: 'video',
    aspect: '9:16',
    duration: '0:10',
    posterFile: 'Videos/MMC videos/Ex_2.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/MMC%20videos/Ex_2.mp4',
    desc: 'Evening high-speed robotic arm glam bot reel featuring dramatic lighting and fluid camera motion.'
  },
  {
    id: 'mmc-glam-bot-3',
    title: 'Fête de la Musique - French Embassy Cultural Showcase',
    client: 'French Embassy & Alliance Française',
    category: 'motionmagic',
    subCategory: 'High-Speed Precision Robotic Arm',
    year: '2025',
    badge: '0:10 · 9:16 BOT',
    aspectRatio: '9-16',
    type: 'video',
    aspect: '9:16',
    duration: '0:10',
    posterFile: 'Videos/MMC videos/Ex 5.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/MMC%20videos/Ex%205.mp4',
    desc: 'MotionMagic robotic camera capture at the Fête de la Musique festival celebrating French Caribbean arts.'
  },
  {
    id: 'booth-360-activation-1',
    title: "Naparima Girls' High School - Class of 2024 Graduation Ball",
    client: 'NGHS Class of 2024',
    category: 'motionmagic',
    subCategory: '360° Slow-Motion Video Booth',
    year: '2024',
    badge: '0:15 · 9:16 360°',
    aspectRatio: '9-16',
    type: 'video',
    aspect: '9:16',
    duration: '0:15',
    posterFile: 'Videos/360 videos/video_1720055785.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/360%20videos/video_1720055785.mp4',
    desc: 'Electrifying 360 revolving booth activation capturing graduate celebrations and formal gowns.'
  },
  {
    id: 'booth-360-activation-2',
    title: 'Rude Boy Drinks - Popcaan & Shenseea Concert Stage Experience',
    client: 'Rude Boy Beverages',
    category: 'motionmagic',
    subCategory: '360° Slow-Motion Video Booth',
    year: '2024',
    badge: '0:15 · 9:16 360°',
    aspectRatio: '9-16',
    type: 'video',
    aspect: '9:16',
    duration: '0:15',
    posterFile: 'Videos/360 videos/001be6de-ed6e-4332-ba73-a2893c873e55.webp',
    videoSrc: '/Portfolio/Our%20Work/Videos/360%20videos/001be6de-ed6e-4332-ba73-a2893c873e55.mp4',
    desc: 'High-octane 360 platform experience at the Rude Boy Stage Show featuring Caribbean music icons.'
  }
];

// Branding & Print
const brandingProjects = [
  {
    id: 'liqliquors-retail-launch',
    title: 'LIQLIQUORS - Retail Launch & Express Delivery Campaign',
    client: 'LIQLIQUORS Curepe',
    category: 'branding',
    subCategory: 'Retail Promotion & Print Collateral',
    year: '2024',
    badge: 'RETAIL PRINT',
    aspectRatio: '4-5',
    type: 'image',
    format: 'Retail Promotion & Print Collateral',
    coverFile: 'Ads/FLYER.webp',
    highRes: '/Portfolio/Our%20Work/Ads/FLYER.png',
    desc: 'Promotional retail store launch and home-delivery campaign collateral featuring top-shelf spirits and beers.'
  },
  {
    id: 'burger-king-value-deal',
    title: 'Burger King - $20 Value Deal Menu Architecture',
    client: 'Burger King Trinidad & Tobago',
    category: 'branding',
    secondaryCategories: ['digital'],
    subCategory: 'Retail Promotion & Tray Liner Print',
    year: '2024',
    badge: 'RETAIL PROMO',
    aspectRatio: '4-5',
    type: 'image',
    format: 'Retail Promotion & Tray Liner Print',
    coverFile: 'Ads/B-SIDE.webp',
    highRes: '/Portfolio/Our%20Work/Ads/B-SIDE.png',
    desc: 'High-impact value meal promotional architecture and counter card system designed for Burger King Trinidad.'
  },
  {
    id: 'burger-king-curbside-signage',
    title: 'Burger King - Curbside Drive-Thru Signage System',
    client: 'Burger King Trinidad & Tobago',
    category: 'branding',
    subCategory: 'In-Store OOH & Curbside Environmental Graphics',
    year: '2024',
    badge: 'ENVIRONMENTAL OOH',
    aspectRatio: '1-1',
    type: 'image',
    format: 'In-Store OOH & Curbside Environmental Graphics',
    coverFile: 'Ads/Door Print.webp',
    highRes: '/Portfolio/Our%20Work/Ads/Door%20Print.png',
    desc: 'Large-format branded door print and curbside pick-up graphics with dedicated order-ahead QR integration.'
  },
  {
    id: 'burger-king-trini-whopper',
    title: 'Burger King - Trini Whopper® Mobile Campaign',
    client: 'Burger King Trinidad & Tobago',
    category: 'branding',
    secondaryCategories: ['digital'],
    subCategory: 'Digital OOH & Social Story Creative',
    year: '2024',
    badge: 'DIGITAL OOH',
    aspectRatio: '9-16',
    type: 'image',
    format: 'Digital OOH & Social Story Creative',
    coverFile: 'Ads/Everyone wants a Piece_STORIES.webp',
    highRes: '/Portfolio/Our%20Work/Ads/Everyone%20wants%20a%20Piece_STORIES.png',
    desc: 'Mouthwatering culinary key visual and social story creative highlighting the signature Trini Whopper.'
  },
  {
    id: 'burger-king-united-by-taste',
    title: 'Burger King - "United By Taste" National Campaign',
    client: 'Burger King Trinidad & Tobago',
    category: 'branding',
    secondaryCategories: ['digital'],
    subCategory: 'National Brand Campaign & OOH Master',
    year: '2024',
    badge: 'NATIONAL CAMPAIGN',
    aspectRatio: '3-2',
    type: 'image',
    format: 'National Brand Campaign & OOH Master',
    coverFile: 'Ads/UNITED BY TASTE.webp',
    highRes: '/Portfolio/Our%20Work/Ads/UNITED%20BY%20TASTE.png',
    desc: 'High-impact lifestyle and culinary campaign celebration for Burger King Trinidad, deployed across digital billboards and print.'
  }
];

// Digital & Social
const digitalProjects = [
  {
    id: 'popeyes-free-chicken-sandwich',
    title: 'Popeyes TT - 1-Year Free Chicken Sandwich Giveaway',
    client: 'Popeyes Trinidad & Tobago',
    category: 'digital',
    subCategory: 'Social Media Contest & Feed Activation',
    year: '2024',
    badge: 'FEED ACTIVATION',
    aspectRatio: '4-5',
    type: 'image',
    format: 'Social Media Contest & Feed Activation',
    coverFile: 'General Content/5.webp',
    highRes: '/Portfolio/Our%20Work/General%20Content/5.png',
    desc: 'Vibrant Carnival-themed social media giveaway campaign driving engagement and app downloads across Trinidad.'
  },
  {
    id: 'popeyes-red-bean-sandwich',
    title: 'Popeyes TT - Red Bean Sandwich Product Launch',
    client: 'Popeyes Trinidad & Tobago',
    category: 'digital',
    subCategory: 'Culinary Social Creative & Menu Launch',
    year: '2024',
    badge: 'PRODUCT LAUNCH',
    aspectRatio: '4-5',
    type: 'image',
    format: 'Culinary Social Creative & Menu Launch',
    coverFile: 'General Content/FEED_1.webp',
    highRes: '/Portfolio/Our%20Work/General%20Content/FEED_1.png',
    desc: 'Bold, mouth-watering social feed creative announcing Popeyes TT vegetarian Red Bean Sandwich.'
  },
  {
    id: 'popeyes-chocolate-chip-biscuit',
    title: 'Popeyes TT - Carnival Chocolate Chip Biscuit Feature',
    client: 'Popeyes Trinidad & Tobago',
    category: 'digital',
    subCategory: 'Limited Time Offer Social Story',
    year: '2024',
    badge: 'LIMITED TIME OFFER',
    aspectRatio: '9-16',
    type: 'image',
    format: 'Limited Time Offer Social Story',
    coverFile: 'General Content/STORIES_2.webp',
    highRes: '/Portfolio/Our%20Work/General%20Content/STORIES_2.png',
    desc: 'Dynamic seasonal social story promotion celebrating Carnival sweetness with Popeyes Chocolate Chip Biscuits.'
  },
  {
    id: 'the-nook-outdoor-living',
    title: 'The Nook - Outdoor Living & Furniture Catalog',
    client: 'The Nook Home & Living',
    category: 'digital',
    secondaryCategories: ['branding'],
    subCategory: 'Product Catalog & Social Ad Suite',
    year: '2024',
    badge: 'PRODUCT CATALOG',
    aspectRatio: '4-5',
    type: 'image',
    format: 'Product Catalog & Social Ad Suite',
    coverFile: 'General Content/PATIO.webp',
    highRes: '/Portfolio/Our%20Work/General%20Content/PATIO.png',
    desc: 'Elegant social catalog and promotional flyer suite showcasing designer patio furniture and egg baskets.'
  }
];

// Combine and format
const finalProjects = [];

// 1. Process Albums
albums.forEach(alb => {
  const photos = getAlbumPhotos(alb.folder);
  const coverClean = path.parse(alb.coverFile).name.replace(/[^a-zA-Z0-9_-]/g, '_');
  let coverWebp = `/Portfolio/thumbnails/Photo%20Albums/${encodeURI(alb.folder)}/${encodeURI(coverClean)}.webp`;
  
  finalProjects.push({
    ...alb,
    type: 'album',
    cover: coverWebp,
    photos: photos
  });
});

// 2. Process Commercial Videos
commercialVideos.forEach(vid => {
  const posterWebp = `/Portfolio/thumbnails/${encodeURI(vid.posterFile.replace(/\\/g, '/'))}`;
  finalProjects.push({
    ...vid,
    cover: posterWebp,
    poster: posterWebp
  });
});

// 3. Process MotionMagic Videos
motionMagicProjects.forEach(mmc => {
  const posterWebp = `/Portfolio/thumbnails/${encodeURI(mmc.posterFile.replace(/\\/g, '/'))}`;
  finalProjects.push({
    ...mmc,
    cover: posterWebp,
    poster: posterWebp
  });
});

// 4. Process Branding
brandingProjects.forEach(br => {
  const coverWebp = `/Portfolio/thumbnails/${encodeURI(br.coverFile.replace(/\\/g, '/'))}`;
  finalProjects.push({
    ...br,
    cover: coverWebp
  });
});

// 5. Process Digital
digitalProjects.forEach(dig => {
  const coverWebp = `/Portfolio/thumbnails/${encodeURI(dig.coverFile.replace(/\\/g, '/'))}`;
  finalProjects.push({
    ...dig,
    cover: coverWebp
  });
});

// Output code
const outputContent = `/**
 * LENSCAPE - MASTER PORTFOLIO DATA REGISTRY (WEBP & TRUE ASPECT RATIOS)
 * Comprehensive data catalog containing 37 curated works:
 * - 12 Event Photo Albums (177 high-res photos)
 * - 11 Commercial Video Broadcasts & Social Motion Ads
 * - 5 MotionMagic Cam (Robotic Arm) & 360 Booth Outputs
 * - 5 Branding & Large-Format Outdoor Print Assets
 * - 4 Digital & Multi-Platform Social Campaigns
 */

export const PORTFOLIO_CATEGORIES = {
  all:         { id: 'all',         label: 'ALL WORK' },
  event:       { id: 'event',       label: 'EVENT & EXPERIENTIAL' },
  commercial:  { id: 'commercial',  label: 'COMMERCIAL & VIDEO' },
  motionmagic: { id: 'motionmagic', label: 'MOTIONMAGIC & 360' },
  branding:    { id: 'branding',    label: 'BRANDING & PRINT' },
  digital:     { id: 'digital',     label: 'DIGITAL & SOCIAL' }
};

export const PORTFOLIO_PROJECTS = ${JSON.stringify(finalProjects, null, 2)};
`;

fs.writeFileSync('portfolio-data.js', outputContent, 'utf8');
console.log(`Successfully generated portfolio-data.js with ${finalProjects.length} projects!`);
