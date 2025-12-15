import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Types & Data ---

interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  specs: Record<string, string>;
  imagePrompt: string;
  generatedImage?: string;
  placeholderColor: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Obsidian Heater",
    tagline: "Warmth. Redefined.",
    category: "Heating",
    price: 399,
    description: "The Obsidian Outdoor Heater isn't just a heat source; it's a centerpiece. Crafted with aerospace-grade aluminum and a matte black ceramic finish, it delivers silent, radiant heat that transforms your patio into an extension of your living room.",
    features: ["Infrared Core", "Silent Operation", "Weatherproof IP65", "Smart Remote"],
    specs: {
      "Heat Output": "1500W",
      "Material": "Anodized Aluminum",
      "Height": "42 inches",
      "Weight": "18 lbs"
    },
    imagePrompt: "Photorealistic luxury outdoor patio at night, a sleek matte black tall outdoor heater standing next to modern dark furniture, warm ambient lighting, fire pit nearby, gold accents, cinematic 8k resolution, apple product photography style.",
    placeholderColor: "linear-gradient(135deg, #1a1a1a 0%, #2c1e05 100%)"
  },
  {
    id: "p2",
    name: "Velvet Foam Pro",
    tagline: "Barista grade. At home.",
    category: "Kitchen",
    price: 129,
    description: "Experience the texture of pure silk. The Velvet Foam Pro uses magnetic induction to create the perfect micro-foam for your latte art, housed in a minimal black cylinder with a refined gold base. It’s not just milk; it’s velvet.",
    features: ["Magnetic Drive", "4 Temp Modes", "Dishwasher Safe", "Silent Spin"],
    specs: {
      "Capacity": "250ml",
      "Temp Range": "40°C - 70°C",
      "Power": "500W",
      "Finish": "Matte Black"
    },
    imagePrompt: "Close up luxury product shot of a sleek black milk frother pouring creamy white milk foam into a black and gold ceramic cup, dark marble kitchen countertop, moody dramatic lighting, 8k, minimalist composition.",
    placeholderColor: "linear-gradient(135deg, #1a1a1a 0%, #1c1c1c 100%)"
  },
  {
    id: "p3",
    name: "Precision Pour",
    tagline: "Master every degree.",
    category: "Coffee",
    price: 189,
    description: "Control is everything. The Precision Pour Artisan kettle features a gooseneck spout for exact flow rate and a stunning black-on-black interface with illuminated gold temperature readouts. Pour with intention.",
    features: ["PID Control", "60m Keep Warm", "Balanced Grip", "OLED Display"],
    specs: {
      "Capacity": "0.9 Liters",
      "Temp Accuracy": "+/- 1°F",
      "Heat Up Time": "3 Minutes",
      "Base": "360° Swivel"
    },
    imagePrompt: "Elegant matte black electric gooseneck pour-over kettle on a dark wooden table, steam rising gently, professional barista setting, sharp focus, gold details, luxury aesthetic, studio lighting.",
    placeholderColor: "linear-gradient(135deg, #000000 0%, #222222 100%)"
  },
  {
    id: "p4",
    name: "Zephyr Tower",
    tagline: "Pure air. Pure silence.",
    category: "Climate",
    price: 249,
    description: "Silence is golden. The Zephyr Tower Fan combines a bladeless air multiplier design with an active air purification filter, wrapped in a sculptural black monolith. It cleans as it cools, invisibly.",
    features: ["Bladeless", "HEPA Filter", "Whisper Quiet", "90° Oscillation"],
    specs: {
      "Airflow": "400 L/s",
      "Noise Level": "< 25dB",
      "Height": "1.1 Meters",
      "Filter Life": "12 Months"
    },
    imagePrompt: "Modern bladeless tower fan standing in a minimalist luxury living room, dark interior design, black walls, subtle gold decor, soft breeze visualization, photorealistic 8k, wide angle.",
    placeholderColor: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)"
  }
];

// --- Styles ---

const styles = {
  nav: {
    position: "fixed" as const,
    top: 0,
    width: "100%",
    height: "48px",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    zIndex: 1000,
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
  },
  navInner: {
    maxWidth: "1000px",
    width: "100%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "18px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  navLinks: {
    display: "flex",
    gap: "32px",
  },
  navLink: {
    color: "#e8e8ed",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 400,
    letterSpacing: "-0.01em",
    transition: "color 0.2s",
    cursor: "pointer",
    opacity: 0.8,
  },
  hero: {
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center" as const,
    position: "relative" as const,
    background: "#000",
    overflow: "hidden"
  },
  heroContent: {
    zIndex: 10,
    maxWidth: "800px",
    padding: "0 20px",
    animation: "fadeIn 1s ease-out",
  },
  heroTitle: {
    fontSize: "clamp(48px, 8vw, 84px)",
    fontWeight: 700,
    color: "#f5f5f7",
    marginBottom: "8px",
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
  },
  heroSubtitle: {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: 500,
    color: "#D4AF37",
    marginBottom: "24px",
    letterSpacing: "0.01em",
  },
  ctaContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '30px'
  },
  primaryBtn: {
    padding: "12px 24px",
    borderRadius: "980px", // Pill shape
    backgroundColor: "#D4AF37",
    color: "#000",
    fontSize: "17px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, background-color 0.2s",
  },
  secondaryBtn: {
    padding: "12px 24px",
    borderRadius: "980px",
    backgroundColor: "transparent",
    color: "#2997ff", // Apple blue link color
    fontSize: "17px",
    fontWeight: 400,
    border: "none",
    cursor: "pointer",
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  detailPage: {
    minHeight: '100vh',
    background: '#000',
    paddingTop: '48px', // space for nav
    color: '#f5f5f7'
  },
  detailHero: {
    height: '85vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-start',
    alignItems: 'center',
    textAlign: 'center' as const,
    paddingTop: '80px',
    position: 'relative' as const,
  },
  productImageLarge: {
    marginTop: '40px',
    width: '90%',
    maxWidth: '1000px',
    height: '60vh',
    objectFit: 'cover' as const,
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  detailSection: {
    maxWidth: '980px',
    margin: '0 auto',
    padding: '100px 20px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center'
  },
  specGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '40px',
    marginTop: '60px',
    padding: '60px',
    background: '#1c1c1e',
    borderRadius: '30px',
  },
  specItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  specLabel: {
    color: '#86868b',
    fontSize: '14px',
    fontWeight: 600,
  },
  specValue: {
    color: '#f5f5f7',
    fontSize: '24px',
    fontWeight: 500,
  }
};

// --- Components ---

function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [currentView, setCurrentView] = useState<"home" | string>("home");
  const [generating, setGenerating] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  const apiKey = process.env.API_KEY;

  // Find current product if view is not home
  const activeProduct = products.find(p => p.id === currentView);

  const generateProductImage = async (product: Product) => {
    if (!apiKey) {
        alert("API Key missing");
        return;
    }
    setGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash-image',
             contents: { parts: [{ text: product.imagePrompt }] }
        });
        
        let imageUrl = "";
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
               imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        
        if (imageUrl) {
            const updatedProducts = products.map(p => 
                p.id === product.id ? { ...p, generatedImage: imageUrl } : p
            );
            setProducts(updatedProducts);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setGenerating(false);
    }
  };

  const generateHeroImage = async () => {
     if (!apiKey || heroImage) return;
     setGenerating(true);
     try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: "Abstract black and gold liquid metal flowing in dark void, cinematic apple wallpaper style, 8k, minimalistic" }] }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
               setHeroImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
     } catch(e) { console.error(e); }
     setGenerating(false);
  }

  // --- Views ---

  const HomeView = () => (
    <div style={{animation: 'fadeIn 0.5s ease'}}>
      <header style={{
        ...styles.hero,
        backgroundImage: heroImage ? `url(${heroImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
         {/* Simple gradient overlay for text protection */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: heroImage ? 'rgba(0,0,0,0.3)' : 'radial-gradient(circle, #222 0%, #000 100%)',
          zIndex: 1
        }} />
        
        <div style={styles.heroContent}>
          <h2 style={{color: '#D4AF37', fontSize: '21px', fontWeight: 600, marginBottom: '10px'}}>YESERLI</h2>
          <h1 style={styles.heroTitle}>Pro. Beyond.</h1>
          <p style={{fontSize: '24px', fontWeight: 400, color: '#86868b'}}>
            The new gold standard for home essentials.
          </p>
          <div style={styles.ctaContainer}>
            <button style={styles.primaryBtn} onClick={() => setCurrentView('p1')}>
              View Collection
            </button>
            <button style={styles.secondaryBtn} onClick={generateHeroImage}>
              {generating ? "Generating..." : "Refresh Visul"} <i className="fas fa-chevron-right" style={{fontSize: '12px'}}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Grid of Product Teasers */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px', background: '#000'}}>
         {products.map(p => (
             <div key={p.id} 
                onClick={() => setCurrentView(p.id)}
                style={{
                    height: '600px', 
                    background: '#121212', 
                    borderRadius: '30px', 
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.3s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
             >
                <div style={{
                    position: 'absolute', top: '40px', left: 0, right: 0, textAlign: 'center', zIndex: 10
                }}>
                    <h3 style={{fontSize: '32px', color: '#f5f5f7', marginBottom: '8px'}}>{p.name}</h3>
                    <p style={{fontSize: '17px', color: '#86868b'}}>{p.tagline}</p>
                </div>
                <div style={{
                    width: '100%', height: '100%', 
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    paddingBottom: '50px'
                }}>
                    {p.generatedImage ? (
                        <img src={p.generatedImage} style={{maxWidth: '80%', maxHeight: '60%', objectFit: 'contain'}} />
                    ) : (
                        <div style={{height: '50%', width: '100%', background: p.placeholderColor, opacity: 0.3}}></div>
                    )}
                </div>
             </div>
         ))}
      </div>
    </div>
  );

  const ProductDetailView = ({ product }: { product: Product }) => (
    <div style={styles.detailPage}>
        <div style={styles.detailHero}>
            <p style={{color: '#D4AF37', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px'}}>New</p>
            <h1 style={{fontSize: '80px', fontWeight: 700, letterSpacing: '-2px', marginBottom: '10px'}}>{product.name}</h1>
            <h2 style={{fontSize: '28px', fontWeight: 500, color: '#86868b'}}>{product.tagline}</h2>
            
            <div style={{marginTop: '30px', display: 'flex', gap: '20px', alignItems: 'center'}}>
                <span style={{fontSize: '21px', fontWeight: 600}}>${product.price}</span>
                <button style={{
                     padding: '8px 20px', borderRadius: '20px', background: '#0071e3', 
                     color: '#fff', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                }}>Buy</button>
            </div>

            {product.generatedImage ? (
                 <img src={product.generatedImage} style={styles.productImageLarge} alt={product.name} />
            ) : (
                <div style={{...styles.productImageLarge, background: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                     <button onClick={() => generateProductImage(product)} style={styles.secondaryBtn}>
                        {generating ? "Curating..." : "Generate Product Visual"}
                     </button>
                </div>
            )}
        </div>

        <div style={styles.detailSection}>
            <div style={styles.detailGrid}>
                <div>
                     <h3 style={{fontSize: '48px', fontWeight: 700, lineHeight: 1.1, marginBottom: '20px'}}>
                        {product.category}. <span style={{color: '#86868b'}}>Elevated to art.</span>
                     </h3>
                     <p style={{fontSize: '21px', color: '#86868b', lineHeight: 1.4}}>
                        {product.description}
                     </p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column' as const, gap: '20px'}}>
                    {product.features.map((f, i) => (
                        <div key={i} style={{padding: '20px', background: '#1c1c1e', borderRadius: '15px', color: '#f5f5f7'}}>
                            <span style={{color: '#D4AF37', marginRight: '10px'}}>✦</span> {f}
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.specGrid}>
                {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} style={styles.specItem}>
                        <span style={styles.specLabel}>{key}</span>
                        <span style={styles.specValue}>{value}</span>
                    </div>
                ))}
            </div>

            <div style={{marginTop: '100px', textAlign: 'center'}}>
                 <button 
                    onClick={() => setCurrentView('home')}
                    style={{color: '#2997ff', background: 'transparent', border: 'none', fontSize: '17px', cursor: 'pointer'}}
                 >
                    Back to Overview
                 </button>
            </div>
        </div>
    </div>
  );

  return (
    <div style={{width: "100%", minHeight: "100vh"}}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
            <div style={styles.logo} onClick={() => setCurrentView('home')}>YESERLI</div>
            <div style={styles.navLinks}>
            {products.map(p => (
                <span 
                    key={p.id} 
                    style={{...styles.navLink, color: currentView === p.id ? '#fff' : '#e8e8ed', opacity: currentView === p.id ? 1 : 0.8}}
                    onClick={() => setCurrentView(p.id)}
                >
                    {p.category}
                </span>
            ))}
            </div>
        </div>
      </nav>

      {/* Main Content Router */}
      {currentView === 'home' ? (
        <HomeView />
      ) : activeProduct ? (
        <ProductDetailView product={activeProduct} />
      ) : (
        <HomeView />
      )}

      {/* Footer */}
      <footer style={{padding: "40px", textAlign: "center", borderTop: "1px solid #1c1c1e", background: "#000", marginTop: "auto"}}>
        <p style={{color: '#86868b', fontSize: '11px'}}>
          Copyright © 2025 YESERLI Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
