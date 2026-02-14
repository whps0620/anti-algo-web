"use client";
import { useState } from "react"; 
import { db } from "@/lib/firebase"; 
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [username, setUsername] = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  const [songUrl, setSongUrl] = useState("");
  const [reason, setReason] = useState("");
  const [discoveredSong, setDiscoveredSong] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
      alert("Success: Your song is now drifting in the ocean.");
    } catch (error) { console.error(error); }
  };

  const receiveSong = async () => {
    setLoading(true);
    const rand = Math.random();
    const q = query(collection(db, "recommendations"), where("randomId", ">=", rand), limit(1));
    const querySnapshot = await getDocs(q);
    
    setTimeout(async () => {
      if (!querySnapshot.empty) {
        setDiscoveredSong(querySnapshot.docs[0].data());
      } else {
        const fallback = await getDocs(query(collection(db, "recommendations"), limit(1)));
        if (!fallback.empty) setDiscoveredSong(fallback.docs[0].data());
      }
      setLoading(false);
    }, 500);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return url;
  };

  return (
    <main className="min-h-screen bg-[#f0fdf4] text-black p-4 md:p-8 font-mono selection:bg-[#bef264]">
      
      {/* HEADER SECTION */}
      <header className="w-full flex flex-col items-center mb-12 py-10">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic bg-[#bef264] px-10 py-4 border-4 border-black rounded-[40px] shadow-[0px_8px_0px_0px_rgba(0,0,0,1)]">
          ANTI-ALGO
        </h1>
      </header>

      {!hasEntered ? (
        <div className="max-w-2xl mx-auto space-y-12">
          {/* PHILOSOPHY BLOCK */}
          <section className="bg-white border-4 border-black p-8 rounded-[30px] shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-md md:text-lg leading-relaxed space-y-4 font-medium italic">
              <p>Algorithms create echo chambers, locking us in a loop of the familiar. Anti-Algo aims for no tracking, no data points, and no shortcuts.</p>
              <p>Just songs dropped into the ocean by real people, waiting for you to find them. We think it’s cool that music is discovered through the ears of a stranger, not the logic of a machine.</p>
            </div>
          </section>

          {/* LOGIN VIEW */}
          <form onSubmit={enterOcean} className="flex flex-col gap-6 items-center justify-center p-12 bg-[#fefce8] border-4 border-black rounded-[40px] shadow-[0px_10px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black text-xl uppercase italic">Pick a nickname to start</p>
            <input 
              type="text" 
              placeholder="Username..."
              className="p-5 border-4 border-black rounded-full text-center font-bold w-full max-w-xs outline-none focus:bg-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button className="px-12 py-5 bg-[#bef264] border-4 border-black rounded-full font-black hover:bg-black hover:text-[#bef264] transition-all uppercase shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
              Enter the Ocean
            </button>
          </form>
        </div>
      ) : (
        /* MAIN APP VIEW */
        <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* DROP SECTION */}
            <section className="border-4 border-black p-8 flex flex-col gap-6 bg-white rounded-[40px] shadow-[0px_10px_0px_0px_rgba(190,242,100,1)]">
              <h2 className="text-3xl font-black border-b-4 border-black pb-2 uppercase italic mb-2">Drop a Bottle</h2>
              <div className="space-y-4 flex flex-col flex-1">
                <input 
                  className="w-full p-4 border-4 border-black bg-[#fefce8] rounded-2xl font-bold outline-none"
                  placeholder="Spotify/YouTube URL"
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                />
                <textarea 
                  className="w-full p-4 border-4 border-black bg-[#fefce8] rounded-2xl font-bold h-40 outline-none resize-none flex-1"
                  placeholder="Why should a stranger hear this?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button 
                  onClick={dropSong} 
                  className="w-full bg-black text-white py-6 rounded-full font-black text-xl uppercase hover:bg-[#bef264] hover:text-black border-4 border-black transition-all shadow-[0px_6px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  Give to the Ocean
                </button>
              </div>
            </section>

            {/* RECEIVE SECTION */}
            <section className="border-4 border-black p-8 flex flex-col gap-6 bg-white rounded-[40px] shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] min-h-[600px]">
              <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-2">
                <h2 className="text-3xl font-black uppercase italic">Hear a Stranger</h2>
              </div>
              
              {!discoveredSong ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc] border-4 border-dashed border-gray-300 rounded-[30px]">
                  <button 
                    onClick={receiveSong} 
                    disabled={loading}
                    className="group bg-white border-4 border-black p-12 rounded-full hover:bg-[#bef264] transition-all shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex flex-col items-center gap-4"
                  >
                    <span className="text-6xl">{loading ? "⏳" : "🎣"}</span>
                    <span className="font-black uppercase text-xl">{loading ? "Diving..." : "Pull from the Depths"}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 h-full flex-1">
                  <div className="border-4 border-black bg-black aspect-video relative rounded-[25px] overflow-hidden shadow-[0px_6px_0px_0px_rgba(0,0,0,1)]">
                    <iframe 
                      src={getEmbedUrl(discoveredSong.url)} 
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media; fullscreen" 
                    ></iframe>
                  </div>
                  
                  <div className="bg-[#fefce8] border-4 border-black p-6 rounded-2xl font-bold text-lg italic relative">
                    "{discoveredSong.reason}"
                    <p className="mt-4 text-[10px] not-italic uppercase opacity-50">— Shared by {discoveredSong.sender}</p>
                  </div>

                  {/* LARGE NEXT BUTTON AS REQUESTED */}
                  <div className="mt-auto grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => { setDiscoveredSong(null); receiveSong(); }} 
                      className="md:col-span-3 py-6 bg-[#bef264] border-4 border-black rounded-full font-black text-2xl uppercase hover:bg-black hover:text-[#bef264] transition-all shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                    >
                      NEXT ↻
                    </button>
                    <a 
                      href={discoveredSong.url} 
                      target="_blank" 
                      className="md:col-span-1 bg-white border-4 border-black rounded-full p-4 flex items-center justify-center font-black text-sm hover:bg-gray-100 uppercase"
                    >
                      Link ↗
                    </a>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}