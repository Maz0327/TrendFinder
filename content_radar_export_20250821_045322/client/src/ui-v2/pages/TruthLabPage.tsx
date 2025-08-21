import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { extractSource, analyzeText, analyzeVisual, type TruthCheck } from "../services/truth";
import { useProjectContext } from "../app/providers";

type Tab = "url" | "text" | "visual";

export function TruthLabPage() {
  const { currentProjectId } = useProjectContext();
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [check, setCheck] = useState<TruthCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mExtract = useMutation({
    mutationFn: async () => {
      setError(null);
      const body: any = { projectId: currentProjectId || undefined };
      if (tab === "url") body.url = url;
      if (tab === "text") body.text = text;
      if (tab === "visual") body.imagePath = imageUrl;
      const resp = await extractSource(body);
      setCheck(resp.check);
      return resp;
    }
  });

  const mText = useMutation({
    mutationFn: async (quick: boolean) => {
      if (!check?.id) throw new Error("no check");
      const resp = await analyzeText(check.id, { quick });
      setCheck(resp.check);
      return resp;
    }
  });

  const mVisual = useMutation({
    mutationFn: async (quick: boolean) => {
      if (!check?.id) throw new Error("no check");
      const resp = await analyzeVisual(check.id, { quick });
      setCheck(resp.check);
      return resp;
    }
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Truth Lab</h1>

      <div className="flex gap-2 mb-4">
        <button className={`px-3 py-2 rounded ${tab==='url'?'bg-white/20':'bg-white/10'}`} onClick={()=>setTab("url")}>URL Extract</button>
        <button className={`px-3 py-2 rounded ${tab==='text'?'bg-white/20':'bg-white/10'}`} onClick={()=>setTab("text")}>Text Analysis</button>
        <button className={`px-3 py-2 rounded ${tab==='visual'?'bg-white/20':'bg-white/10'}`} onClick={()=>setTab("visual")}>Visual Check</button>
      </div>

      {tab === "url" && (
        <div className="glass-card p-4">
          <label className="block text-sm mb-2">Source URL</label>
          <input className="w-full p-2 rounded bg-white/5 border border-white/10" placeholder="https://example.com/post" value={url} onChange={e=>setUrl(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded bg-blue-600" disabled={mExtract.isPending} onClick={()=>mExtract.mutate()}>
              {mExtract.isPending? "Extracting…" : "Extract"}
            </button>
          </div>
        </div>
      )}

      {tab === "text" && (
        <div className="glass-card p-4">
          <label className="block text-sm mb-2">Paste text</label>
          <textarea className="w-full p-2 h-40 rounded bg-white/5 border border-white/10" value={text} onChange={e=>setText(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded bg-blue-600" disabled={mExtract.isPending} onClick={()=>mExtract.mutate()}>
              {mExtract.isPending? "Save Text" : "Save Text"}
            </button>
          </div>
        </div>
      )}

      {tab === "visual" && (
        <div className="glass-card p-4">
          <label className="block text-sm mb-2">Image URL</label>
          <input className="w-full p-2 rounded bg-white/5 border border-white/10" placeholder="https://..." value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded bg-blue-600" disabled={mExtract.isPending} onClick={()=>mExtract.mutate()}>
              {mExtract.isPending? "Save" : "Save"}
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4 text-red-400">{error}</div>}

      {check && (
        <div className="mt-6 space-y-4">
          <div className="glass-card p-4">
            <h2 className="font-semibold mb-2">Extracted</h2>
            {check.extracted_text ? <p className="text-sm whitespace-pre-wrap">{check.extracted_text.slice(0, 1200)}</p> : <p className="text-sm opacity-70">No extracted text</p>}
            {Array.isArray(check.extracted_images) && check.extracted_images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">{check.extracted_images.slice(0,6).map((src,i)=>(<img key={i} src={src} className="rounded border border-white/10" />))}</div>
            )}
          </div>

          <div className="glass-card p-4">
            <h2 className="font-semibold mb-2">Text Analysis</h2>
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-2 rounded bg-white/10" disabled={mText.isPending} onClick={()=>mText.mutate(true)}>{mText.isPending ? "Running…" : "Quick"}</button>
              <button className="px-3 py-2 rounded bg-white/10" disabled={mText.isPending} onClick={()=>mText.mutate(false)}>{mText.isPending ? "Running…" : "Deep"}</button>
            </div>
            <pre className="text-xs bg-black/30 p-3 rounded overflow-auto">{JSON.stringify({
              result_truth: check.result_truth,
              result_strategic: check.result_strategic,
              result_cohorts: check.result_cohorts
            }, null, 2)}</pre>
          </div>

          <div className="glass-card p-4">
            <h2 className="font-semibold mb-2">Visual Check</h2>
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-2 rounded bg-white/10" disabled={mVisual.isPending} onClick={()=>mVisual.mutate(true)}>{mVisual.isPending ? "Running…" : "Quick"}</button>
              <button className="px-3 py-2 rounded bg-white/10" disabled={mVisual.isPending} onClick={()=>mVisual.mutate(false)}>{mVisual.isPending ? "Running…" : "Deep"}</button>
            </div>
            <pre className="text-xs bg-black/30 p-3 rounded overflow-auto">{JSON.stringify(check.result_visual, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}