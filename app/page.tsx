"use client";
import { useState, useEffect } from "react"; // Added useEffect import
import { db } from "@/lib/firebase"; 
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [username, setUsername] = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  
  const [songUrl, setSongUrl] = useState("");
  const [reason, setReason] = useState("");
  const [discoveredSong, setDiscoveredSong] = useState<any>(null);

  // --- Logic Functions ---

  const enterOcean = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) setHasEntered(true);
  };

  const dropSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songUrl) return;
    try {
      await addDoc(collection(db, "recommendations"), {
        url: songUrl,
        reason: reason,
        sender: username,
        createdAt: serverTimestamp(),
        randomId: Math.random() 
      });
      setSongUrl("");
      setReason("");
      alert("Song dropped into the ocean.");
    } catch (error) { console.error(error); }
  };

  const receiveSong = async () => {
    const rand = Math.random();
    const q = query(
      collection(db, "recommendations"),
      where("randomId", ">=", rand),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setDiscoveredSong(querySnapshot.docs[0].data());
    } else {
      const fallback = await getDocs(query(collection(db, "recommendations"), limit(1)));
      if (!fallback.empty) setDiscoveredSong(fallback.docs[0].data());
    }
  };

  // Helper to convert standard links to Embed links for the "screenshot"
  const getEmbedUrl = (url: string) => {
    if (url.includes("spotify.com")) {
      // Handles various spotify link formats to embed format
      return url.replace("open.spotify.com/", "open.spotify.com/embed/");
    }
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    return url;
  };

  // 15-second "Washed away" timer
  useEffect(() => {
    if (discoveredSong) {
      const timer = setTimeout(() => {
        setDiscoveredSong(null);
        alert("The song has returned to the depths.");
      }, 15000); 
      return () => clearTimeout(timer);
    }
  }, [discoveredSong]);

  // --- UI Render ---

  return (
    <main className="min-h-screen bg-white text-black p-4 md:p-8 flex flex-col items-center font-mono">
      <header className="text-center mb-12 mt-6">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic">ANTI-ALGO</h1>
        <p className="mt-2 text-sm opacity-70">Logged in as: {username || 'Stranger'}</p>
      </header>

      {!hasEntered ? (
        <form onSubmit={enterOcean} className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
          <p className="text-center max-w-xs">To enter the ocean anonymously, pick a nickname.</p>
          <input 
            type="text" 
            placeholder="Your nickname..."
            className="p-4 border-2 border-black rounded-none text-center font-bold w-64 focus:bg-black focus:text-white transition-all outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button className="px-10 py-4 border-2 border-black font-black hover:bg-black hover:text-white transition-all uppercase tracking-widest">
            Enter the Ocean
          </button>
        </form>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* SECTION: DROP A SONG */}
          <section className="border-2 border-black p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-black border-b-2 border-black pb-2">DROP A SONG</h2>
            <input 
              className="p-2 border border-gray-300 outline-none focus:border-black"
              placeholder="Spotify/YouTube URL"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
            />
            <textarea 
              className="p-2 border border-gray-300 h-24 outline-none focus:border-black"
              placeholder="Why this song?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button onClick={dropSong} className="bg-black text-white p-3 font-bold hover:invert transition-all">
              DROP A SONG!
            </button>
          </section>

          {/* SECTION: RECEIVE A SONG */}
          <section className="border-2 border-black p-6 flex flex-col gap-4 bg-gray-50 min-h-[400px]">
            <h2 className="text-2xl font-black border-b-2 border-black pb-2 uppercase">Hear a Stranger</h2>
            
            {!discoveredSong ? (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <button 
                  onClick={receiveSong} 
                  className="group flex flex-col items-center gap-4 p-8 border-2 border-dashed border-black hover:border-solid hover:bg-black hover:text-white transition-all"
                >
                  <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1.5" fill="none" className="group-hover:animate-bounce">
                    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                  </svg>
                  <span className="font-black tracking-widest uppercase text-sm">Pull from the Ocean</span>
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* The "Screenshot" Block */}
                <div className="mb-4 border-2 border-black overflow-hidden bg-white">
                  <iframe
                    src={getEmbedUrl(discoveredSong.url)}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>

                <div className="bg-black text-white p-4 mb-2">
                  <p className="italic text-lg">"{discoveredSong.reason}"</p>
                </div>
                
                <p className="text-xs uppercase opacity-50 mb-4">— Shared by {discoveredSong.sender}</p>

                <button 
                  onClick={() => setDiscoveredSong(null)} 
                  className="w-full border-2 border-black py-2 font-bold hover:bg-black hover:text-white transition-all text-xs uppercase"
                >
                  Throw it back / Next Song
                </button>
              </div>
            )}
          </section>

        </div>
      )}
    </main>
  );
}