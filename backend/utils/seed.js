/**
 * Database Seed Script
 * Creates admin user, demo user, and 55 recycling centers across all Indian states & UTs
 * Run with: node utils/seed.js
 * Re-seed centers: node utils/seed.js --fresh
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const RecycleCenter = require('../models/RecycleCenter');
const Reward = require('../models/Reward');

// ── Helper to generate standard operating hours ─────────────────────────────
const weekdayHours = (open = '09:00', close = '18:00') => ({
  monday:    { open, close },
  tuesday:   { open, close },
  wednesday: { open, close },
  thursday:  { open, close },
  friday:    { open, close },
  saturday:  { open: '10:00', close: '16:00' },
  sunday:    { closed: true }
});

// ── 55 Centers across all Indian States and Union Territories ────────────────
const ALL_CENTERS = [

  // ── Andhra Pradesh ─────────────────────────────────────────────────────────
  {
    name: "GreenTech E-Waste Visakhapatnam",
    address: "45 Beach Road, MVP Colony, Visakhapatnam 530017",
    location: { type: 'Point', coordinates: [83.2185, 17.7231] },
    phone: "+91 98100 11001", email: "greentech.vizag@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Tablets', 'Batteries', 'Cables'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.3, count: 89 }
  },
  {
    name: "EcoRecycle Vijayawada",
    address: "12 MG Road, Governorpet, Vijayawada 520002",
    location: { type: 'Point', coordinates: [80.6480, 16.5062] },
    phone: "+91 98100 11002", email: "ecorecycle.vjw@ecycle.com",
    acceptedItems: ['Computers', 'Monitors', 'Printers', 'Keyboards', 'TVs'],
    creditsPerKg: 13, operatingHours: weekdayHours(), rating: { average: 4.1, count: 62 }
  },

  // ── Arunachal Pradesh ──────────────────────────────────────────────────────
  {
    name: "HillState E-Waste Itanagar",
    address: "Ganga Market, Itanagar 791111",
    location: { type: 'Point', coordinates: [93.6156, 27.0844] },
    phone: "+91 98100 11003", email: "hillstate.itn@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Cables', 'Cameras', 'Other'],
    creditsPerKg: 16, operatingHours: weekdayHours(), rating: { average: 4.0, count: 28 }
  },

  // ── Assam ──────────────────────────────────────────────────────────────────
  {
    name: "NorthEast Recycle Hub Guwahati",
    address: "GS Road, Ulubari, Guwahati 781007",
    location: { type: 'Point', coordinates: [91.7362, 26.1445] },
    phone: "+91 98100 11004", email: "ne.recycle.ghy@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Tablets', 'Batteries', 'Gaming Consoles'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.4, count: 103 }
  },

  // ── Bihar ──────────────────────────────────────────────────────────────────
  {
    name: "BiharGreen E-Waste Patna",
    address: "Fraser Road, Patna 800001",
    location: { type: 'Point', coordinates: [85.1376, 25.5941] },
    phone: "+91 98100 11005", email: "bihargreen.patna@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Batteries', 'Cables', 'Monitors'],
    creditsPerKg: 12, operatingHours: weekdayHours(), rating: { average: 4.0, count: 74 }
  },

  // ── Chhattisgarh ───────────────────────────────────────────────────────────
  {
    name: "CG EcoTech Raipur",
    address: "Shankar Nagar, Raipur 492007",
    location: { type: 'Point', coordinates: [81.6296, 21.2514] },
    phone: "+91 98100 11006", email: "cgeco.raipur@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'TVs', 'Refrigerators', 'Batteries'],
    creditsPerKg: 13, operatingHours: weekdayHours(), rating: { average: 4.2, count: 55 }
  },

  // ── Goa ───────────────────────────────────────────────────────────────────
  {
    name: "GoaGreen Recycle Panaji",
    address: "18 June Road, Panaji 403001",
    location: { type: 'Point', coordinates: [73.8278, 15.4909] },
    phone: "+91 98100 11007", email: "goagreen.panaji@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Cameras', 'Tablets', 'Cables'],
    creditsPerKg: 17, operatingHours: weekdayHours('10:00', '19:00'), rating: { average: 4.6, count: 142 }
  },

  // ── Gujarat ───────────────────────────────────────────────────────────────
  {
    name: "Gujarat E-Waste Hub Ahmedabad",
    address: "CG Road, Navrangpura, Ahmedabad 380009",
    location: { type: 'Point', coordinates: [72.5714, 23.0225] },
    phone: "+91 98100 11008", email: "guj.ewaste.ahm@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Washing Machines', 'Air Conditioners', 'Batteries'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.5, count: 198 }
  },
  {
    name: "SuratRecycle Centre",
    address: "Ring Road, Surat 395002",
    location: { type: 'Point', coordinates: [72.8311, 21.1702] },
    phone: "+91 98100 11009", email: "surat.recycle@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Printers', 'Keyboards', 'Monitors'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.3, count: 116 }
  },

  // ── Haryana ───────────────────────────────────────────────────────────────
  {
    name: "HaryanaTech Recycle Gurugram",
    address: "Cyber Hub, DLF Phase 2, Gurugram 122002",
    location: { type: 'Point', coordinates: [77.0266, 28.4595] },
    phone: "+91 98100 11010", email: "hrtech.gurugram@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'Tablets', 'Computers', 'Gaming Consoles'],
    creditsPerKg: 18, operatingHours: weekdayHours('08:00', '20:00'), rating: { average: 4.7, count: 287 }
  },

  // ── Himachal Pradesh ──────────────────────────────────────────────────────
  {
    name: "HimGreen E-Waste Shimla",
    address: "The Mall Road, Shimla 171001",
    location: { type: 'Point', coordinates: [77.1734, 31.1048] },
    phone: "+91 98100 11011", email: "himgreen.shimla@ecycle.com",
    acceptedItems: ['Smartphones', 'Cameras', 'Laptops', 'Batteries', 'Cables'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.2, count: 47 }
  },

  // ── Jharkhand ─────────────────────────────────────────────────────────────
  {
    name: "JharkhandEco Ranchi",
    address: "Main Road, Ranchi 834001",
    location: { type: 'Point', coordinates: [85.3096, 23.3441] },
    phone: "+91 98100 11012", email: "jheco.ranchi@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Batteries', 'Monitors', 'Cables'],
    creditsPerKg: 12, operatingHours: weekdayHours(), rating: { average: 3.9, count: 41 }
  },

  // ── Karnataka ─────────────────────────────────────────────────────────────
  {
    name: "BangaloreTech Recyclers",
    address: "MG Road, Bengaluru 560001",
    location: { type: 'Point', coordinates: [77.6101, 12.9716] },
    phone: "+91 98100 11013", email: "blr.tech.recycle@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'Tablets', 'Gaming Consoles', 'Cameras'],
    creditsPerKg: 18, operatingHours: weekdayHours('09:00', '21:00'), rating: { average: 4.8, count: 412 }
  },
  {
    name: "GreenGadget Depot Bengaluru",
    address: "78 Park Avenue, Bengaluru 560002",
    location: { type: 'Point', coordinates: [77.5946, 12.9800] },
    phone: "+91 87654 32109", email: "greengadget@ecycle.com",
    acceptedItems: ['TVs', 'Gaming Consoles', 'Smartphones', 'Tablets', 'Cameras'],
    creditsPerKg: 18, operatingHours: weekdayHours('10:00', '19:00'), rating: { average: 4.7, count: 200 }
  },
  {
    name: "MysoreGreen E-Waste",
    address: "Sayyaji Rao Road, Mysuru 570001",
    location: { type: 'Point', coordinates: [76.6552, 12.2958] },
    phone: "+91 98100 11014", email: "mysore.green@ecycle.com",
    acceptedItems: ['Smartphones', 'Computers', 'Printers', 'Batteries', 'TVs'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.4, count: 134 }
  },

  // ── Kerala ────────────────────────────────────────────────────────────────
  {
    name: "KeralaEco Hub Kochi",
    address: "MG Road, Ernakulam, Kochi 682011",
    location: { type: 'Point', coordinates: [76.2673, 9.9312] },
    phone: "+91 98100 11015", email: "keralaeco.kochi@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Washing Machines', 'Air Conditioners', 'Refrigerators'],
    creditsPerKg: 16, operatingHours: weekdayHours(), rating: { average: 4.6, count: 221 }
  },
  {
    name: "Trivandrum E-Waste Depot",
    address: "Statue Junction, Thiruvananthapuram 695001",
    location: { type: 'Point', coordinates: [76.9366, 8.5241] },
    phone: "+91 98100 11016", email: "tvpm.ewaste@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Tablets', 'Batteries', 'Cables'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.3, count: 167 }
  },

  // ── Madhya Pradesh ────────────────────────────────────────────────────────
  {
    name: "MP EcoRecycle Bhopal",
    address: "New Market, Bhopal 462003",
    location: { type: 'Point', coordinates: [77.4126, 23.2599] },
    phone: "+91 98100 11017", email: "mp.eco.bhopal@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'TVs', 'Batteries', 'Monitors'],
    creditsPerKg: 13, operatingHours: weekdayHours(), rating: { average: 4.1, count: 88 }
  },
  {
    name: "Indore TechRecycle",
    address: "MG Road, Indore 452001",
    location: { type: 'Point', coordinates: [75.8577, 22.7196] },
    phone: "+91 98100 11018", email: "indore.techrecycle@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Washing Machines', 'Refrigerators', 'Cameras'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.3, count: 122 }
  },

  // ── Maharashtra ───────────────────────────────────────────────────────────
  {
    name: "Mumbai E-Waste Warriors",
    address: "Bandra Kurla Complex, Mumbai 400051",
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    phone: "+91 98100 11019", email: "mumbai.warriors@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'Refrigerators', 'Washing Machines', 'Air Conditioners'],
    creditsPerKg: 20, operatingHours: weekdayHours('08:00', '21:00'), rating: { average: 4.8, count: 534 }
  },
  {
    name: "Pune GreenCycle",
    address: "FC Road, Shivajinagar, Pune 411005",
    location: { type: 'Point', coordinates: [73.8553, 18.5204] },
    phone: "+91 98100 11020", email: "pune.greencycle@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Tablets', 'Gaming Consoles', 'Batteries'],
    creditsPerKg: 17, operatingHours: weekdayHours(), rating: { average: 4.6, count: 298 }
  },
  {
    name: "Nagpur EcoTech Depot",
    address: "Sitabuldi, Nagpur 440012",
    location: { type: 'Point', coordinates: [79.0882, 21.1458] },
    phone: "+91 98100 11021", email: "nagpur.ecotech@ecycle.com",
    acceptedItems: ['Smartphones', 'TVs', 'Monitors', 'Printers', 'Cables'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.2, count: 97 }
  },

  // ── Manipur ───────────────────────────────────────────────────────────────
  {
    name: "Manipur E-Waste Centre Imphal",
    address: "Thangal Bazaar, Imphal 795001",
    location: { type: 'Point', coordinates: [93.9368, 24.8170] },
    phone: "+91 98100 11022", email: "manipur.ewaste@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Cables', 'Laptops', 'Other'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.0, count: 32 }
  },

  // ── Meghalaya ─────────────────────────────────────────────────────────────
  {
    name: "Shillong GreenRecycle",
    address: "Police Bazaar, Shillong 793001",
    location: { type: 'Point', coordinates: [91.8933, 25.5788] },
    phone: "+91 98100 11023", email: "shillong.green@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Cameras', 'Batteries', 'Tablets'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.1, count: 38 }
  },

  // ── Mizoram ───────────────────────────────────────────────────────────────
  {
    name: "Aizawl E-Waste Hub",
    address: "Zarkawt, Aizawl 796001",
    location: { type: 'Point', coordinates: [92.7173, 23.7271] },
    phone: "+91 98100 11024", email: "aizawl.ewaste@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Cables', 'Other'],
    creditsPerKg: 16, operatingHours: weekdayHours(), rating: { average: 3.9, count: 21 }
  },

  // ── Nagaland ──────────────────────────────────────────────────────────────
  {
    name: "Kohima EcoCycle",
    address: "NST Junction, Kohima 797001",
    location: { type: 'Point', coordinates: [94.1086, 25.6701] },
    phone: "+91 98100 11025", email: "kohima.ecocycle@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Laptops', 'Cables', 'Other'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.0, count: 25 }
  },

  // ── Odisha ────────────────────────────────────────────────────────────────
  {
    name: "OdishaGreen Bhubaneswar",
    address: "Janpath, Bhubaneswar 751022",
    location: { type: 'Point', coordinates: [85.8245, 20.2961] },
    phone: "+91 98100 11026", email: "odisha.green.bbsr@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'TVs', 'Batteries', 'Monitors'],
    creditsPerKg: 13, operatingHours: weekdayHours(), rating: { average: 4.2, count: 86 }
  },

  // ── Punjab ────────────────────────────────────────────────────────────────
  {
    name: "Punjab EcoRecycle Chandigarh",
    address: "Sector 17, Chandigarh 160017",
    location: { type: 'Point', coordinates: [76.7794, 30.7333] },
    phone: "+91 98100 11027", email: "punjab.eco.chd@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'Tablets', 'Computers', 'Printers'],
    creditsPerKg: 16, operatingHours: weekdayHours(), rating: { average: 4.5, count: 178 }
  },
  {
    name: "Ludhiana TechWaste Hub",
    address: "Ferozepur Road, Ludhiana 141001",
    location: { type: 'Point', coordinates: [75.8573, 30.9010] },
    phone: "+91 98100 11028", email: "ludhiana.techwaste@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Washing Machines', 'Refrigerators', 'Batteries'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.2, count: 93 }
  },

  // ── Rajasthan ─────────────────────────────────────────────────────────────
  {
    name: "Jaipur E-Waste Recyclers",
    address: "MI Road, Jaipur 302001",
    location: { type: 'Point', coordinates: [75.7873, 26.9124] },
    phone: "+91 98100 11029", email: "jaipur.ewaste@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Air Conditioners', 'TVs', 'Batteries'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.4, count: 201 }
  },
  {
    name: "Jodhpur GreenDepot",
    address: "Station Road, Jodhpur 342001",
    location: { type: 'Point', coordinates: [73.0243, 26.2389] },
    phone: "+91 98100 11030", email: "jodhpur.green@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Batteries', 'Monitors', 'Cables'],
    creditsPerKg: 13, operatingHours: weekdayHours(), rating: { average: 4.1, count: 67 }
  },

  // ── Sikkim ────────────────────────────────────────────────────────────────
  {
    name: "Gangtok EcoCentre",
    address: "MG Marg, Gangtok 737101",
    location: { type: 'Point', coordinates: [88.6138, 27.3389] },
    phone: "+91 98100 11031", email: "gangtok.ecocentre@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Cables', 'Cameras', 'Laptops'],
    creditsPerKg: 16, operatingHours: weekdayHours(), rating: { average: 4.3, count: 29 }
  },

  // ── Tamil Nadu ────────────────────────────────────────────────────────────
  {
    name: "Chennai TechRecycle",
    address: "Anna Salai, Chennai 600002",
    location: { type: 'Point', coordinates: [80.2707, 13.0827] },
    phone: "+91 98100 11032", email: "chennai.techrecycle@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Laptops', 'Monitors', 'Printers'],
    creditsPerKg: 16, operatingHours: weekdayHours('09:00', '20:00'), rating: { average: 4.6, count: 312 }
  },
  {
    name: "TechRecycle India Chennai",
    address: "45 Mission Street, Chennai 600001",
    location: { type: 'Point', coordinates: [80.2650, 13.0750] },
    phone: "+91 98765 12345", email: "techrecycle@ecycle.com",
    acceptedItems: ['Computers', 'Monitors', 'Printers', 'Keyboards', 'Cameras'],
    creditsPerKg: 12, operatingHours: weekdayHours('08:00', '20:00'), rating: { average: 4.2, count: 85 }
  },
  {
    name: "Coimbatore E-Waste Hub",
    address: "DB Road, RS Puram, Coimbatore 641002",
    location: { type: 'Point', coordinates: [76.9558, 11.0168] },
    phone: "+91 98100 11033", email: "cbe.ewaste@ecycle.com",
    acceptedItems: ['Washing Machines', 'Air Conditioners', 'Refrigerators', 'TVs', 'Batteries'],
    creditsPerKg: 18, operatingHours: weekdayHours(), rating: { average: 4.5, count: 187 }
  },
  {
    name: "Madurai GreenCycle",
    address: "North Veli Street, Madurai 625001",
    location: { type: 'Point', coordinates: [78.1198, 9.9252] },
    phone: "+91 98100 11034", email: "madurai.greencycle@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Batteries', 'Cables', 'Cameras'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.2, count: 108 }
  },

  // ── Telangana ─────────────────────────────────────────────────────────────
  {
    name: "Hyderabad E-Waste Solutions",
    address: "Hitech City, Madhapur, Hyderabad 500081",
    location: { type: 'Point', coordinates: [78.3815, 17.4474] },
    phone: "+91 98100 11035", email: "hyd.ewaste.solutions@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'Tablets', 'Gaming Consoles', 'Cameras'],
    creditsPerKg: 19, operatingHours: weekdayHours('08:00', '21:00'), rating: { average: 4.7, count: 398 }
  },
  {
    name: "CircuitBreaker Hyderabad",
    address: "5 Tech Park Road, Hyderabad 500032",
    location: { type: 'Point', coordinates: [78.4867, 17.4400] },
    phone: "+91 65432 10987", email: "circuitbreaker@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Cables', 'Keyboards', 'Other'],
    creditsPerKg: 14, operatingHours: weekdayHours('08:30', '17:30'), rating: { average: 4.1, count: 55 }
  },
  {
    name: "Warangal RecycleTech",
    address: "Hanamkonda, Warangal 506001",
    location: { type: 'Point', coordinates: [79.5941, 17.9784] },
    phone: "+91 98100 11036", email: "warangal.recycletech@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Batteries', 'Monitors', 'Cables'],
    creditsPerKg: 13, operatingHours: weekdayHours(), rating: { average: 4.1, count: 54 }
  },

  // ── Tripura ───────────────────────────────────────────────────────────────
  {
    name: "Agartala E-Waste Centre",
    address: "HGB Road, Agartala 799001",
    location: { type: 'Point', coordinates: [91.2868, 23.8315] },
    phone: "+91 98100 11037", email: "agartala.ewaste@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Laptops', 'Cables', 'Other'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.0, count: 33 }
  },

  // ── Uttar Pradesh ─────────────────────────────────────────────────────────
  {
    name: "Lucknow EcoRecycle",
    address: "Hazratganj, Lucknow 226001",
    location: { type: 'Point', coordinates: [80.9462, 26.8467] },
    phone: "+91 98100 11038", email: "lucknow.ecorecycle@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Computers', 'TVs', 'Batteries'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.3, count: 156 }
  },
  {
    name: "Kanpur TechWaste Hub",
    address: "Mall Road, Kanpur 208001",
    location: { type: 'Point', coordinates: [80.3319, 26.4499] },
    phone: "+91 98100 11039", email: "kanpur.techwaste@ecycle.com",
    acceptedItems: ['Computers', 'Monitors', 'Printers', 'Keyboards', 'Cables'],
    creditsPerKg: 12, operatingHours: weekdayHours(), rating: { average: 4.0, count: 78 }
  },
  {
    name: "Varanasi GreenDepot",
    address: "Sigra, Varanasi 221010",
    location: { type: 'Point', coordinates: [82.9739, 25.3176] },
    phone: "+91 98100 11040", email: "varanasi.greendepot@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'TVs', 'Washing Machines', 'Cables'],
    creditsPerKg: 13, operatingHours: weekdayHours(), rating: { average: 4.1, count: 61 }
  },
  {
    name: "Agra E-Waste Recyclers",
    address: "Sanjay Place, Agra 282002",
    location: { type: 'Point', coordinates: [78.0081, 27.1767] },
    phone: "+91 98100 11041", email: "agra.ewaste@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Cameras', 'Batteries', 'Tablets'],
    creditsPerKg: 13, operatingHours: weekdayHours(), rating: { average: 4.0, count: 49 }
  },

  // ── Uttarakhand ───────────────────────────────────────────────────────────
  {
    name: "Dehradun EcoTech",
    address: "Rajpur Road, Dehradun 248001",
    location: { type: 'Point', coordinates: [78.0322, 30.3165] },
    phone: "+91 98100 11042", email: "dehradun.ecotech@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'Cameras', 'Batteries', 'Tablets'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.3, count: 82 }
  },

  // ── West Bengal ───────────────────────────────────────────────────────────
  {
    name: "Kolkata E-Waste Solutions",
    address: "Park Street, Kolkata 700016",
    location: { type: 'Point', coordinates: [88.3639, 22.5726] },
    phone: "+91 98100 11043", email: "kolkata.ewaste@ecycle.com",
    acceptedItems: ['Computers', 'Smartphones', 'Laptops', 'TVs', 'Refrigerators'],
    creditsPerKg: 16, operatingHours: weekdayHours('09:00', '20:00'), rating: { average: 4.5, count: 276 }
  },
  {
    name: "Howrah GreenRecycle",
    address: "GT Road, Howrah 711101",
    location: { type: 'Point', coordinates: [88.3297, 22.5958] },
    phone: "+91 98100 11044", email: "howrah.green@ecycle.com",
    acceptedItems: ['Washing Machines', 'Air Conditioners', 'Refrigerators', 'Batteries', 'Cables'],
    creditsPerKg: 17, operatingHours: weekdayHours(), rating: { average: 4.3, count: 118 }
  },

  // ── Delhi NCT ─────────────────────────────────────────────────────────────
  {
    name: "Delhi E-Waste Central",
    address: "Connaught Place, New Delhi 110001",
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    phone: "+91 98100 11045", email: "delhi.ewaste.central@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'Tablets', 'Computers', 'Gaming Consoles'],
    creditsPerKg: 20, operatingHours: weekdayHours('08:00', '21:00'), rating: { average: 4.8, count: 621 }
  },
  {
    name: "South Delhi RecycleTech",
    address: "Lajpat Nagar, New Delhi 110024",
    location: { type: 'Point', coordinates: [77.2410, 28.5677] },
    phone: "+91 98100 11046", email: "southdelhi.recycletech@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Cameras', 'Batteries', 'Cables'],
    creditsPerKg: 18, operatingHours: weekdayHours(), rating: { average: 4.6, count: 334 }
  },

  // ── Jammu & Kashmir ───────────────────────────────────────────────────────
  {
    name: "Srinagar EcoCentre",
    address: "Lal Chowk, Srinagar 190001",
    location: { type: 'Point', coordinates: [74.7973, 34.0837] },
    phone: "+91 98100 11047", email: "srinagar.ecocentre@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Laptops', 'Cameras', 'Cables'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.1, count: 44 }
  },

  // ── Ladakh ────────────────────────────────────────────────────────────────
  {
    name: "Leh E-Waste Drop Point",
    address: "Main Bazaar, Leh 194101",
    location: { type: 'Point', coordinates: [77.5771, 34.1526] },
    phone: "+91 98100 11048", email: "leh.ewaste@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Cables', 'Cameras', 'Other'],
    creditsPerKg: 17, operatingHours: weekdayHours(), rating: { average: 4.2, count: 18 }
  },

  // ── Puducherry ────────────────────────────────────────────────────────────
  {
    name: "EcoHub Recycling Center",
    address: "12 Green Street, Puducherry 605001",
    location: { type: 'Point', coordinates: [79.8083, 11.9416] },
    phone: "+91 98765 43210", email: "ecohub@ecycle.com",
    acceptedItems: ['Smartphones', 'Laptops', 'Tablets', 'Batteries', 'Cables'],
    creditsPerKg: 15, operatingHours: weekdayHours(), rating: { average: 4.5, count: 120 }
  },

  // ── Andaman & Nicobar Islands ─────────────────────────────────────────────
  {
    name: "Port Blair E-Waste Hub",
    address: "Aberdeen Bazaar, Port Blair 744101",
    location: { type: 'Point', coordinates: [92.7265, 11.6234] },
    phone: "+91 98100 11049", email: "portblair.ewaste@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Cameras', 'Cables', 'Other'],
    creditsPerKg: 18, operatingHours: weekdayHours(), rating: { average: 4.0, count: 22 }
  },

  // ── Lakshadweep ───────────────────────────────────────────────────────────
  {
    name: "Kavaratti EcoDrop",
    address: "Main Road, Kavaratti 682555",
    location: { type: 'Point', coordinates: [72.6369, 10.5626] },
    phone: "+91 98100 11050", email: "kavaratti.ecodrop@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Cables', 'Other'],
    creditsPerKg: 20, operatingHours: weekdayHours(), rating: { average: 4.0, count: 11 }
  },

  // ── Chandigarh UT ─────────────────────────────────────────────────────────
  {
    name: "Chandigarh Smart Recycle",
    address: "Sector 22, Chandigarh 160022",
    location: { type: 'Point', coordinates: [76.8154, 30.7412] },
    phone: "+91 98100 11051", email: "chd.smart.recycle@ecycle.com",
    acceptedItems: ['Laptops', 'Smartphones', 'Tablets', 'Printers', 'Monitors'],
    creditsPerKg: 16, operatingHours: weekdayHours(), rating: { average: 4.5, count: 143 }
  },

  // ── Dadra & Nagar Haveli / Daman & Diu ───────────────────────────────────
  {
    name: "Silvassa E-Waste Point",
    address: "Town Centre, Silvassa 396230",
    location: { type: 'Point', coordinates: [73.0169, 20.2766] },
    phone: "+91 98100 11052", email: "silvassa.ewaste@ecycle.com",
    acceptedItems: ['Smartphones', 'Batteries', 'Cables', 'Computers', 'Monitors'],
    creditsPerKg: 14, operatingHours: weekdayHours(), rating: { average: 4.0, count: 35 }
  },

];

// ── Seed Function ────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecycle');
    console.log('✅ Connected to MongoDB\n');

    // ── Admin user ──────────────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecycle.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'E-CYCLE Admin', email: adminEmail,
        password: adminPassword, role: 'admin', credits: 9999
      });
      await admin.save();
      console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    }

    // ── Demo user ───────────────────────────────────────────────────────────
    let demoUser = await User.findOne({ email: 'demo@ecycle.com' });
    if (!demoUser) {
      demoUser = new User({
        name: 'Demo User', email: 'demo@ecycle.com',
        password: 'Demo@123456', role: 'user',
        credits: 250, totalRecycled: 5, totalItemsWeight: 12.5
      });
      await demoUser.save();
      console.log('✅ Demo user created: demo@ecycle.com / Demo@123456');
    } else {
      console.log('ℹ️  Demo user already exists');
    }

    // ── Recycling Centers ───────────────────────────────────────────────────
    const freshSeed = process.argv.includes('--fresh');

    if (freshSeed) {
      await RecycleCenter.deleteMany({});
      console.log('\n🗑️  Cleared existing centers');
    }

    const existing = await RecycleCenter.countDocuments();

    if (existing === 0 || freshSeed) {
      await RecycleCenter.insertMany(ALL_CENTERS);
      console.log(`\n✅ ${ALL_CENTERS.length} recycling centers seeded across India`);
    } else {
      console.log(`\nℹ️  ${existing} centers already exist.`);
      console.log('   To replace them all, run: node utils/seed.js --fresh');
    }

    // ── Rewards Store ───────────────────────────────────────────────────────
    const existingRewards = await Reward.countDocuments();
    if (existingRewards === 0) {
      const SAMPLE_REWARDS = [
        {
          title: '₹100 Off on Electronics',
          description: 'Get ₹100 instant discount on electronics purchases above ₹999',
          category: 'Electronics',
          platform: 'Amazon',
          platformLogo: '🛒',
          creditCost: 500,
          discountValue: '₹100 Off',
          minOrderValue: '₹999',
          couponCodes: [
            { code: 'ECYCLE100AMZ', isUsed: false },
            { code: 'ECYCLE100AMZ2', isUsed: false },
            { code: 'ECYCLE100AMZ3', isUsed: false },
          ],
          totalStock: 3, availableStock: 3,
          termsAndConditions: 'Valid on electronics category only. One per user.'
        },
        {
          title: '₹50 Off on First Order',
          description: 'Flat ₹50 off on your next Flipkart order above ₹499',
          category: 'Shopping',
          platform: 'Flipkart',
          platformLogo: '🛍️',
          creditCost: 200,
          discountValue: '₹50 Off',
          minOrderValue: '₹499',
          couponCodes: [
            { code: 'ECOFLIP50A', isUsed: false },
            { code: 'ECOFLIP50B', isUsed: false },
            { code: 'ECOFLIP50C', isUsed: false },
            { code: 'ECOFLIP50D', isUsed: false },
          ],
          totalStock: 4, availableStock: 4,
          termsAndConditions: 'Valid on all categories. Cannot be combined with other offers.'
        },
        {
          title: '20% Off on Clothing',
          description: 'Get 20% discount on all clothing & accessories on Myntra',
          category: 'Fashion',
          platform: 'Myntra',
          platformLogo: '👗',
          creditCost: 300,
          discountValue: '20% Off',
          minOrderValue: '₹799',
          couponCodes: [
            { code: 'ECOMYN20A', isUsed: false },
            { code: 'ECOMYN20B', isUsed: false },
            { code: 'ECOMYN20C', isUsed: false },
          ],
          totalStock: 3, availableStock: 3,
          termsAndConditions: 'Valid on clothing and accessories only.'
        },
        {
          title: 'Free Delivery on 3 Orders',
          description: 'Get free delivery on your next 3 Swiggy orders',
          category: 'Food',
          platform: 'Swiggy',
          platformLogo: '🍔',
          creditCost: 150,
          discountValue: 'Free Delivery',
          minOrderValue: '₹149',
          couponCodes: [
            { code: 'ECOSWGY3A', isUsed: false },
            { code: 'ECOSWGY3B', isUsed: false },
            { code: 'ECOSWGY3C', isUsed: false },
            { code: 'ECOSWGY3D', isUsed: false },
            { code: 'ECOSWGY3E', isUsed: false },
          ],
          totalStock: 5, availableStock: 5,
          termsAndConditions: 'Valid for 3 consecutive orders within 7 days.'
        },
        {
          title: '₹200 Off on Travel',
          description: 'Flat ₹200 off on flights & hotels booked via MakeMyTrip',
          category: 'Travel',
          platform: 'MakeMyTrip',
          platformLogo: '✈️',
          creditCost: 800,
          discountValue: '₹200 Off',
          minOrderValue: '₹2000',
          couponCodes: [
            { code: 'ECOMMT200A', isUsed: false },
            { code: 'ECOMMT200B', isUsed: false },
          ],
          totalStock: 2, availableStock: 2,
          termsAndConditions: 'Valid on flights and hotels. Not valid on bus/cab.'
        },
        {
          title: '1 Month Premium Free',
          description: 'Get 1 month Zomato Pro membership absolutely free',
          category: 'Food',
          platform: 'Zomato',
          platformLogo: '🍕',
          creditCost: 400,
          discountValue: '1 Month Free',
          couponCodes: [
            { code: 'ECOZOM1MA', isUsed: false },
            { code: 'ECOZOM1MB', isUsed: false },
            { code: 'ECOZOM1MC', isUsed: false },
          ],
          totalStock: 3, availableStock: 3,
          termsAndConditions: 'For new Zomato Pro subscribers only.'
        },
        {
          title: '₹500 Off on Mobiles',
          description: 'Get ₹500 off on mobile phones above ₹5000 on Croma',
          category: 'Electronics',
          platform: 'Croma',
          platformLogo: '📱',
          creditCost: 1000,
          discountValue: '₹500 Off',
          minOrderValue: '₹5000',
          couponCodes: [
            { code: 'ECOCROMA500A', isUsed: false },
            { code: 'ECOCROMA500B', isUsed: false },
          ],
          totalStock: 2, availableStock: 2,
          termsAndConditions: 'Valid on mobile phones only. One per customer.'
        },
        {
          title: '15% Off on Medicines',
          description: 'Get 15% discount on all medicines and health products',
          category: 'Other',
          platform: 'PharmEasy',
          platformLogo: '💊',
          creditCost: 250,
          discountValue: '15% Off',
          couponCodes: [
            { code: 'ECOPHRM15A', isUsed: false },
            { code: 'ECOPHRM15B', isUsed: false },
            { code: 'ECOPHRM15C', isUsed: false },
          ],
          totalStock: 3, availableStock: 3,
          termsAndConditions: 'Valid on medicines and health products only.'
        },
      ];

      await Reward.insertMany(SAMPLE_REWARDS);
      console.log(`✅ ${SAMPLE_REWARDS.length} sample rewards seeded`);
    } else {
      console.log(`ℹ️  ${existingRewards} rewards already exist`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌿 Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Centers : ${ALL_CENTERS.length} across all states & UTs`);
    console.log(`Admin   : ${adminEmail} / ${adminPassword}`);
    console.log('Demo    : demo@ecycle.com / Demo@123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
