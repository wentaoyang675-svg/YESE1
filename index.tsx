import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Types & Data ---

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  imagePrompt: string;
  generatedImage?: string;
  placeholderColor: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "The Obsidian Heater",
    category: "Outdoor Living",
    price: 399,
    description: "Extend your evening soirees with the Obsidian Outdoor Heater. Crafted with aerospace-grade aluminum and a matte black ceramic finish, it delivers silent, radiant heat to your patio.",
    features: ["Infrared Technology", "Silent Operation", "Weatherproof IP65", "Remote Control"],
    imagePrompt: "Photorealistic luxury outdoor patio at night, a sleek matte black tall outdoor heater standing next to modern dark furniture, warm ambient lighting, fire pit nearby, gold accents, cinematic 8k resolution.",
    placeholderColor: "linear-gradient(135deg, #1a1a1a 0%, #2c1e05 100%)"
  },
  {
    id: "p2",
    name: "Velvet Foam Pro",
    category: "Kitchen",
    price: 129,
    description: "Experience the texture of pure silk. The Velvet Foam Pro uses magnetic induction to create the perfect micro-foam for your latte art, housed in a minimal black cylinder with a gold base.",
    features: ["Magnetic Drive", "4 Temperature Settings", "Dishwasher Safe Cup", "Silent Spinning"],
    imagePrompt: "Close up luxury product shot of a sleek black milk frother pouring creamy white milk foam into a black and gold ceramic cup, dark marble kitchen countertop, moody dramatic lighting, 8k.",
    placeholderColor: "linear-gradient(135deg, #1a1a1a 0%, #1c1c1c 100%)"
  },
  {
    id: "p3",
    name: "Precision Pour Artisan",
    category: "Coffee",
    price: 189,
    description: "Control every degree. The Precision Pour Artisan kettle features a gooseneck spout for exact flow rate and a stunning black-on-black interface with illuminated gold temperature readouts.",
    features: ["PID Temp Control", "Keep Warm (60m)", "Counterbalanced Handle", "OLED Display"],
    imagePrompt: "Elegant matte black electric gooseneck pour-over kettle on a dark wooden table, steam rising gently, professional barista setting, sharp focus, gold details, luxury aesthetic.",
    placeholderColor: "linear-gradient(135deg, #000000 0%, #222222 100%)"
  },
  {
    id: "p4",
    name: "Zephyr Tower",
    category: "Climate",
    price: 249,
    description: "Silence is golden. The Zephyr Tower Fan combines a bladeless air multiplier design with an active air purification filter, wrapped in a sculptural black monolith.",
    features: ["Bladeless Airflow", "HEPA Filtration", "Whisper Quiet", "Oscillation"],
    imagePrompt: "Modern bladeless tower fan standing in a minimalist luxury living room, dark interior design, black walls, subtle gold decor, soft breeze visualization, photorealistic 8k.",
    placeholderColor: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)"
  }
];

// --- Styles ---

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
  },
  nav: {
    position: "fixed" as const,
    top: 0,
    width: "100%",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(5, 5, 5, 0.85)",
    backdropFilter: "blur(10px)",
    zIndex: 1000,
    borderBottom: "1px solid rgba(212, 175, 55, 0.2)"
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#D4AF37",
    textTransform: "uppercase" as const,
  },
  navLinks: {
    display: "flex",
    gap: "30px",
  },
  navLink: {
    color: "#F5F5F5",
    textDecoration: "none",
    fontSize: "12px",
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    transition: "color 0.3s",
    cursor: "pointer",
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
    padding: "0 20px",
    background: "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
    overflow: "hidden"
  },
  heroContent: {
    zIndex: 10,
    maxWidth: "800px",
  },
  heroTitle: {
    fontSize: "clamp(40px, 6vw, 80px)",
    color: "#fff",
    marginBottom: "20px",
    lineHeight: 1.1,
  },
  heroSubtitle: {
    fontSize: "clamp(16px, 2vw, 20px)",
    color: "#D4AF37",
    marginBottom: "40px",
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
  },
  goldBtn: {
    padding: "15px 40px",
    backgroundColor: "transparent",
    border: "1px solid #D4AF37",
    color: "#D4AF37",
    fontSize: "14px",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    transition: "all 0.4s ease",
    position: "relative" as const,
    overflow: "hidden",
  },
  section: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  sectionReverse: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row-reverse" as const,
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  imageContainer: {
    flex: 1,
    height: "100vh",
    position: "relative" as const,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transition: "transform 1s ease",
  },
  textContainer: {
    flex: 1,
    padding: "60px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "flex-start",
    background: "#050505",
    height: "100vh",
  },
  category: {
    color: "#888",
    fontSize: "12px",
    letterSpacing: "2px",
    marginBottom: "10px",
    textTransform: "uppercase" as const,
  },
  productName: {
    fontSize: "48px",
    color: "#fff",
    marginBottom: "20px",
  },
  productPrice: {
    fontSize: "24px",
    color: "#D4AF37",
    marginBottom: "30px",
    fontFamily: "'Montserrat', sans-serif",
  },
  description: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#ccc",
    marginBottom: "40px",
    maxWidth: "500px",
  },
  featureList: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "40px",
    width: "100%",
    maxWidth: "500px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#D4AF37",
    fontSize: "14px",
  },
  buyButton: {
    padding: "15px 50px",
    background: "#D4AF37",
    color: "#000",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "1px",
    cursor: "pointer",
    textTransform: "uppercase" as const,
  },
  footer: {
    padding: "60px 20px",
    textAlign: "center" as const,
    borderTop: "1px solid #222",
    backgroundColor: "#050505",
  },
  loader: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column" as const,
    color: "#D4AF37",
  }
};

// --- Components ---

function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [generating, setGenerating] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  // Initialize GenAI
  const apiKey = process.env.API_KEY;

  const generateImages = async () => {
    if (!apiKey) {
      alert("API Key missing. Cannot generate images.");
      return;
    }
    setGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Generate Hero Image
      // We do this in parallel with product images for speed, or sequentially to avoid rate limits depending on tier.
      // For this demo, we'll do promise.all for a few, but maybe batch them.
      
      const heroPrompt = "Abstract luxury black and gold artistic background, liquid gold flowing on black matte texture, cinematic lighting, 8k wallpaper style.";
      const heroResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: heroPrompt }] }
      });

      // Extract Hero Image
      let generatedHero = "";
      for (const part of heroResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedHero = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      if(generatedHero) setHeroImage(generatedHero);

      // Generate Product Images
      const newProducts = [...products];
      
      // We will generate them one by one to ensure we don't hit complexity limits quickly in this loop
      for (let i = 0; i < newProducts.length; i++) {
        const p = newProducts[i];
        try {
          const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash-image',
             contents: { parts: [{ text: p.imagePrompt }] }
          });
          
          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
               newProducts[i].generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
          }
        } catch (e) {
          console.error(`Failed to generate image for ${p.name}`, e);
        }
      }
      
      setProducts(newProducts);

    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate visuals. Please check API Key/Quota.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.logo}>YESERLI</div>
        <div style={styles.navLinks}>
          <a style={styles.navLink} href="#p1">Heating</a>
          <a style={styles.navLink} href="#p2">Kitchen</a>
          <a style={styles.navLink} href="#p3">Coffee</a>
          <a style={styles.navLink} href="#p4">Climate</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        ...styles.hero,
        backgroundImage: heroImage ? `url(${heroImage})` : styles.hero.background,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Overlay to ensure text readability */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1
        }} />

        <div style={styles.heroContent}>
          <h2 style={styles.heroSubtitle}>Est. 2025 • United States</h2>
          <h1 style={styles.heroTitle}>Refined Living.<br/>Elevated.</h1>
          <p style={{color: '#ddd', fontSize: '18px', marginBottom: '40px', fontFamily: 'Montserrat'}}>
            Discover the synthesis of shadow and light in our exclusive black & gold collection.
          </p>
          
          <button 
            style={{
              ...styles.goldBtn, 
              background: generating ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              borderColor: generating ? '#666' : '#D4AF37',
              color: generating ? '#666' : '#D4AF37',
              cursor: generating ? 'wait' : 'pointer'
            }}
            onClick={generating ? undefined : generateImages}
          >
            {generating ? (
              <span><i className="fas fa-circle-notch fa-spin"></i> CURATING VISUALS...</span>
            ) : (
              <span><i className="fas fa-wand-magic-sparkles"></i> EXPERIENCE THE VISION</span>
            )}
          </button>
          
          {!generating && !heroImage && (
            <p style={{marginTop: '15px', fontSize: '12px', color: '#666'}}>
              *Click to generate AI-powered lifestyle imagery
            </p>
          )}
        </div>
      </header>

      {/* Products */}
      {products.map((product, index) => {
        const isEven = index % 2 === 0;
        const currentStyle = isEven ? styles.section : styles.sectionReverse;

        return (
          <section key={product.id} id={product.id} style={currentStyle}>
            {/* Image Side */}
            <div style={styles.imageContainer}>
              {product.generatedImage ? (
                <img 
                  src={product.generatedImage} 
                  alt={product.name} 
                  style={styles.productImage} 
                />
              ) : (
                <div style={{
                  width: '100%', 
                  height: '100%', 
                  background: product.placeholderColor,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#444'
                }}>
                  <div style={{textAlign: 'center'}}>
                    <i className="fas fa-image" style={{fontSize: '48px', marginBottom: '20px', color: '#333'}}></i>
                    <p style={{textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px'}}>
                       Visual Pending
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Text Side */}
            <div style={styles.textContainer}>
              <span style={styles.category}>{product.category} Collection</span>
              <h2 style={styles.productName}>{product.name}</h2>
              <div style={styles.productPrice}>${product.price}</div>
              <p style={styles.description}>{product.description}</p>
              
              <div style={styles.featureList}>
                {product.features.map((feature, idx) => (
                  <div key={idx} style={styles.featureItem}>
                    <i className="fas fa-check" style={{color: '#D4AF37', fontSize: '10px'}}></i>
                    {feature}
                  </div>
                ))}
              </div>

              <button style={styles.buyButton}>
                Add to Cart
              </button>
            </div>
          </section>
        );
      })}

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{...styles.logo, marginBottom: '20px'}}>YESERLI</div>
        <p style={{color: '#666', fontSize: '12px', letterSpacing: '1px'}}>
          © 2025 YESERLI. DESIGNED IN CALIFORNIA.
        </p>
        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', color: '#D4AF37'}}>
          <i className="fab fa-instagram"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-pinterest"></i>
        </div>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
