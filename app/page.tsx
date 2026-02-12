"use client";
import { useState, useEffect } from "react"; 
import { db } from "@/lib/firebase"; 
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from "firebase/firestore";

export default function Home() {
  // 1. App State
  const [username, setUsername] = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  const [songUrl, setSongUrl] = useState("");
  const [reason, setReason] = useState("");
  const [discoveredSong, setDiscoveredSong] = useState<any>(null);

  // 2. Logic: Enter the App
  const enterOcean = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) setHasEntered(true);
  };

  // 3. Logic: Drop a Song into Firestore
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

  // 4. Logic: Receive a Random Song
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

  // 5. Logic: Convert URL to Embed Format (The "Screenshot" Preview)
  const getEmbedUrl = (url: string) => {
    if (url.includes("spotify.com")) {
      // Handles both open.spotify.com and embedded links
      return url.replace("open.spotify.com", "open.spotify.com/embed");
    }
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    return url;
  };

  // 6. Logic: 15-Second Timer (Washes song back to the ocean)
  useEffect(() => {
    if (discoveredSong) {
      const timer = setTimeout(() => {
        setDiscoveredSong(null);
        // Optional: alert("The song has returned to the depths.");
      }, 15000); 
      return () => clearTimeout(timer);
    }
  }, [discoveredSong]);

  // 7. UI Render
  return (
    <main className="min-h-screen bg-white text-black p-4 md:p-8 flex flex-col items-center font-mono">
      
      {/* HEADER SECTION */}
      <header className="text-center mb-8 mt-6">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic">ANTI-ALGO</h1>
        {hasEntered && <p className="mt-2 text-sm opacity-70 uppercase tracking-widest">Guest: {username}</p>}
      </header>

      {!hasEntered ? (
        /* LOGIN VIEW */
        <form onSubmit={enterOcean} className="flex flex-col gap-6 items-center justify-center min-h-[40vh]">
          <p className="text-center max-w-xs text-sm">Enter the ocean anonymously. Your discovery is powered by humans, not data.</p>
          <input 
            type="text" 
            placeholder="Choose a nickname..."
            className="p-4 border-2 border-black rounded-none text-center font-bold w-64 outline-none focus:bg-black focus:text-white transition-all"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button className="px-10 py-4 border-2 border-black font-black hover:bg-black hover:text-white transition-all uppercase">
            Enter the Ocean
          </button>
        </form>
      ) : (
        /* MAIN APP VIEW */
        <div className="w-full max-w-6xl flex flex-col items-center">
          
          {/* PHILOSOPHY BLOCK */}
          <section className="mb-12 max-w-2xl text-center border-y-2 border-black py-8 px-4">
            <h3 className="text-xl font-black uppercase mb-4 tracking-tighter text-center">The Human Ocean</h3>
            <div className="text-sm leading-relaxed space-y-4">
              <p>
                We’re tired of 'For You' pages that feel like they're for a robot. Algorithms create echo chambers, 
                locking us in a loop of the familiar. <strong>Anti-Algo</strong> aims for no tracking, no data points, 
                and no shortcuts.
              </p>
              <p>
                Just songs dropped into the ocean by real people, waiting for you to find them. 
                We think it’s cool that music is discovered through the ears of a stranger, not the logic of a machine. 
                <span className="block mt-4 font-bold uppercase tracking-widest text-xs">Discovery is better when it’s human.</span>
              </p>
            </div>
          </section>

          {/* INTERACTION GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
            
            {/* DROP SECTION */}
            <section className="border-2 border-black p-6 flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <h2 className="text-2xl font-black border-b-2 border-black pb-2 uppercase">Drop a Song</h2>
              <input 
                className="p-3 border-2 border-black outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Paste Spotify/YouTube URL"
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
              />
              <textarea 
                className="p-3 border-2 border-black h-24 outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Why should a stranger hear this?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button 
                onClick={dropSong} 
                className="bg-black text-white p-4 font-black uppercase hover:bg-white hover:text-black border-2 border-black transition-all"
              >
                Give to the Ocean
              </button>
            </section>

            {/* RECEIVE SECTION */}
            <section className="border-2 border-black p-6 flex flex-col gap-4 bg-gray-50 min-h-[450px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black border-b-2 border-black pb-2 uppercase text-center">Hear a Stranger</h2>
              
              {!discoveredSong ? (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <button 
                    onClick={receiveSong} 
                    className="group flex flex-col items-center gap-4 p-10 border-2 border-dashed border-black hover:border-solid hover:bg-black hover:text-white transition-all"
                  >
                    <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1.5" fill="none" className="group-hover:animate-bounce">
                      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                    </svg>
                    <span className="font-black tracking-widest uppercase text-sm">Pull from the Depths</span>
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* SONG PREVIEW (SCREENSHOT) */}
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

                  {/* REASON BOX */}
                  <div className="bg-black text-white p-4 mb-2">
                    <p className="italic text-lg">"{discoveredSong.reason}"</p>
                  </div>
                  
                  <p className="text-xs uppercase opacity-50 mb-6 text-right">— Shared by {discoveredSong.sender}</p>

                  <button 
                    onClick={() => setDiscoveredSong(null)} 
                    className="w-full border-2 border-black py-3 font-black hover:bg-black hover:text-white transition-all text-xs uppercase tracking-tighter"
                  >
                    Throw it back / Get Another
                  </button>
                </div>
              )}
            </section>

          </div>
        </div>
      )}
    </main>
  );
}