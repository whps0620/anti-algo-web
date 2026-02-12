"use client";
import { useState } from "react";
import { db } from "@/lib/firebase"; 
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [username, setUsername] = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  
  // States for dropping a song
  const [songUrl, setSongUrl] = useState("");
  const [reason, setReason] = useState("");

  // State for receiving a song
  const [discoveredSong, setDiscoveredSong] = useState<any>(null);

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
    // Query for a random song dropped by someone else
    const q = query(
      collection(db, "recommendations"),
      where("randomId", ">=", rand),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setDiscoveredSong(querySnapshot.docs[0].data());
    } else {
      // Fallback if randomId check returns empty
      const fallback = await getDocs(query(collection(db, "recommendations"), limit(1)));
      if (!fallback.empty) setDiscoveredSong(fallback.docs[0].data());
    }
  };

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
          <section className="border-2 border-black p-6 flex flex-col gap-4 bg-gray-50">
            <h2 className="text-2xl font-black border-b-2 border-black pb-2">HEAR A STRANGER</h2>
            {!discoveredSong ? (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <button onClick={receiveSong} className="border-2 border-black p-6 font-black hover:bg-black hover:text-white transition-all">
                  PULL FROM THE DEPTHS
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700">
                <p className="text-xs uppercase opacity-50 mb-1">From: {discoveredSong.sender}</p>
                <div className="bg-black text-white p-4 mb-4">
                  <p className="italic text-lg">"{discoveredSong.reason}"</p>
                </div>
                <a 
                  href={discoveredSong.url} 
                  target="_blank" 
                  className="block text-center border-2 border-black p-3 font-bold hover:bg-black hover:text-white transition-all"
                >
                  LISTEN TO SONG!
                </a>
                <button onClick={() => setDiscoveredSong(null)} className="mt-4 text-xs underline opacity-50 hover:opacity-100">
                  FIND ANOTHER!
                </button>
              </div>
            )}
          </section>

        </div>
      )}
    </main>
  );
}