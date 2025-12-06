import '../App.css'
import { useState, useEffect } from 'react'

function App() {
  const [isPicking, setIsPicking] = useState(false);
  const [data, setData] = useState<any | null>(null);

  const togglePicker = async () => {
    if (!chrome.tabs) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const newState = !isPicking;
      setIsPicking(newState);
      chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_PICKER", payload: newState }).catch(() => {}); 
    }
  };

  useEffect(() => {
    const handleData = (payload: any) => {
      setData(payload);
      setIsPicking(false);
    };

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['latestCapture'], (res) => {
        if (res?.latestCapture) handleData(res.latestCapture);
      });
    }

    const listener = (req: any) => {
      if (req.action === "CAPTURED_STYLES") handleData(req.data);
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const getHtmlCode = () => {
    if (!data || !data.styles) return "";
    
    const styleEntries = Object.entries(data.styles)
      .map(([key, val]) => {
        const cleanVal = (val as string).replace(/"/g, "'"); 
        return `${key}: ${cleanVal}`;
      });
    
    const styleAttr = styleEntries.length > 0 
      ? ` style="${styleEntries.join('; ')}"` 
      : "";

    let attrString = "";
    if (data.attributes) {
      attrString = Object.entries(data.attributes)
        .filter(([key, val]) => val !== "" && key !== "class") 
        .map(([key, val]) => ` ${key}="${val}"`)
        .join("");
    }
    
    const voidTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'path', 'circle', 'rect'];
    if (voidTags.includes(data.tagName)) {
       return `<${data.tagName}${attrString}${styleAttr} />`;
    }

    const cleanInnerHTML = data.innerHTML
      ? data.innerHTML.replace(/ style=""/g, '') 
      : "Content";

    return `<${data.tagName}${attrString}${styleAttr}>\n  ${cleanInnerHTML}\n</${data.tagName}>`;
  };

  return (
    <div className="w-full h-screen p-4 bg-slate-50 overflow-y-auto flex flex-col">
      <div className="mb-4 text-center shrink-0">
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
          pick<span className="text-indigo-600">UI</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">Capture HTML & CSS</p>
      </div>

      <button
        onClick={togglePicker}
        className={`w-full py-3 rounded-lg font-bold text-sm mb-4 shrink-0 transition-all
          ${isPicking ? "bg-red-500 text-white" : "bg-indigo-600 text-white shadow-lg"}`}
      >
        {isPicking ? "Stop Scanning" : "🎯 Pick Element"}
      </button>

      {data && data.styles && (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="mb-4">
             <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold uppercase text-slate-400">Result</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-mono">
                  &lt;{data.tagName}&gt;
                </span>
             </div>
             <div className="relative bg-slate-900 rounded-lg p-3 shadow-inner group">
                <pre className="text-[10px] leading-4 text-orange-300 font-mono whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto custom-scrollbar">
                  {getHtmlCode()}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(getHtmlCode())}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/10 text-white px-2 py-1 rounded text-xs transition-opacity border border-white/20"
                >
                  Copy HTML
                </button>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;