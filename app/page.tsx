"use client";

import { useState, useEffect } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, where, limit, getDocs, orderBy } from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [songUrl, setSongUrl] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discoveredSong, setDiscoveredSong] = useState<any>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const login = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (error.code !== 'auth/cancelled-popup-request') {
      console.error(error);
    }
  }

  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (e) { return null; }
    return null;
  };

  const dropSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songUrl || !reason) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "recommendations"), {
        url: songUrl,
        reason: reason,
        createdAt: serverTimestamp(),
        randomId: Math.random() 
      });
      setSongUrl("");
      setReason("");
      alert("Dropped into the ocean.");
    } catch (error) { console.error(error); } 
    finally { setIsSubmitting(false); }
  };

  const discoverRandom = async () => {
    setIsDiscovering(true);
    try {
      const randomVal = Math.random();
      const songsRef = collection(db, "recommendations");
      let q = query(songsRef, where("randomId", ">=", randomVal), orderBy("randomId"), limit(1));
      let querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        q = query(songsRef, orderBy("randomId"), limit(1));
        querySnapshot = await getDocs(q);
      }
      if (!querySnapshot.empty) {
        setDiscoveredSong(querySnapshot.docs[0].data());
      }
    } catch (error) { console.error(error); } 
    finally { setIsDiscovering(false); }
  };

  return (
    <main className="min-h-screen bg-white text-black p-8 flex flex-col items-center font-mono">
      
      {/* Centered Header */}
      <header className="text-center mb-12 mt-12">
        <h1 className="text-5xl font-black tracking-tighter cursor-pointer" onClick={() => setDiscoveredSong(null)}>
          ANTI-ALGO
        </h1>
        <p className="mt-4 text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
          Are you tired of the music recommended by the algorithm? <br />
          Try some music recommended by a stranger.
        </p>
      </header>

      {!user ? (
        <div className="flex-1 flex items-center">
          <button onClick={login} className="px-10 py-4 border-2 border-black font-bold text-lg hover:bg-black hover:text-white transition-all">
            CONNECT TO OCEAN
          </button>
        </div>
      ) : (
        <div className="w-full max-w-6xl mt-4 grid md:grid-cols-2 gap-12 items-stretch">
          
          {/* LEFT: GIVE (Minimal White) */}
          <section className="flex flex-col p-8 border-2 border-black rounded-xl">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">What do you want to share today?</h2>
            <form onSubmit={dropSong} className="flex-1 flex flex-col gap-4">
              <input 
                type="url" placeholder="URL (Spotify/YouTube)"
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
                value={songUrl} onChange={(e) => setSongUrl(e.target.value)}
              />
              <textarea 
                placeholder="The story behind this beautiful song..."
                className="w-full p-3 border border-gray-200 rounded-lg flex-1 min-h-[150px] outline-none focus:border-black transition-colors"
                value={reason} onChange={(e) => setReason(e.target.value)}
              />
              <button disabled={isSubmitting} className="w-full py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                {isSubmitting ? "SHIPPING..." : "DROP SONG"}
              </button>
            </form>
          </section>

          {/* RIGHT: TAKE (Minimal White) */}
          <section className="flex flex-col p-8 border-2 border-black rounded-xl">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">What do you want to hear today?</h2>
            
            <div className="flex-1 flex flex-col justify-center">
              {!discoveredSong ? (
                <button 
                  onClick={discoverRandom}
                  className="w-full h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-black transition-all group"
                >
                  <span className="text-3xl mb-4 grayscale group-hover:grayscale-0">🌊</span>
                  <p className="font-bold text-gray-400 group-hover:text-black">CAST YOUR LINE</p>
                </button>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 mb-2 tracking-widest uppercase">From a stranger:</p>
                    <p className="text-lg italic leading-snug">"{discoveredSong.reason}"</p>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-black shadow-md">
                    {getEmbedUrl(discoveredSong.url) ? (
                      <iframe 
                        src={getEmbedUrl(discoveredSong.url)} 
                        className="w-full aspect-video"
                        allow="autoplay; encrypted-media; fullscreen"
                      />
                    ) : (
                      <div className="p-8 text-center bg-black text-white">
                        <a href={discoveredSong.url} target="_blank" className="underline font-bold">Listen via Link</a>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={discoverRandom}
                    className="w-full py-3 border border-black rounded-lg font-bold hover:bg-black hover:text-white transition-all"
                  >
                    FIND ANOTHER
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {user && (
        <button onClick={() => signOut(auth)} className="mt-16 text-[10px] uppercase tracking-widest text-gray-300 hover:text-black transition-colors">
          Disconnect to the ocean
        </button>
      )}
    </main>
  );
}