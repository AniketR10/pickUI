import '../App.css'
import { useState, useEffect } from 'react'

function App() {
  const [isPicking, setIsPicking] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [copyBtn, setCopyBtn] = useState<Boolean>(false);

  const copyBtnToggle = () => {
    navigator.clipboard.writeText(getHtmlCode());
    setCopyBtn(true);

    setTimeout(() => setCopyBtn(false), 500);
  }

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
      : "Couldn't get Data";

    return `<${data.tagName}${attrString}${styleAttr}>\n  ${cleanInnerHTML}\n</${data.tagName}>`;
  };

  return (
    <div className="w-full h-screen p-4 bg-emerald-100 overflow-y-auto flex flex-col">
      <div className="mb-4 text-center shrink-0">
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
          pick<span className="text-indigo-600">UI</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">Capture your favourite UI Component from any website</p>
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
                <pre className="text-[10px] leading-4 text-orange-300 font-mono whitespace-pre-wrap break-all overflow-y-auto custom-scrollbar">
                  {getHtmlCode()}
                </pre>
                <button 
                  onClick={copyBtnToggle}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white text-black px-2 py-1 rounded text-xs transition-opacity border border-white/20 cursor-pointer "
                >
                 {copyBtn ? "✓ Copied!" : "Copy"}
                </button>
             </div>
             <div className="bg-amber-50 border border-amber-400 rounded-lg p-3 shadow-sm mb-4 mt-4">
            <h3 className="text-xs font-bold uppercase text-amber-700 mb-2 flex items-center">
              ⚠️ Please Note:
            </h3>
            <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
              
              <li>This extension may not be able to capture the exact copy of components, need to have knowledge of HTML,CSS to tweak the components to suit your project, works largely fine in most of the cases.</li>
              <li>
  Put the <code>&lt;path /&gt;</code> element inside an <code>&lt;svg&gt;</code>, e.g.,
  <code>&lt;svg&gt;&lt;path /&gt;&lt;/svg&gt;</code>.
</li>
              <li>Hover over the exact element that you want to capture so that you don't end up capturing the parent element, in this case you may not be able to see your desired component.</li>
              <li>Media Queries and :hover states are NOT captured.</li>
              <li>Custom Fonts (like Google Fonts) must be manually loaded in your project.</li>
              <li>Relative URLs for images (`src`) might be broken and need updating.</li>
              <li>Lots of improvements/features are currently on the line.</li>
              <p className='bg-amber-500 rounded-md p-2 mt-1.5'>This is a Open Source Project, if you feel something that can be added/improved, feel free to <a href="https://github.com/AniketR10/pickUI" target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>contribute!</a></p>
            </ul>
          </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;