"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Save, Type, AlignLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import {
  OptimizedResume,
  ResumeStylePrefs,
  DEFAULT_RESUME_STYLE,
  previewResumePdf,
  api,
} from "@/lib/api";

interface ResumeEditorModalProps {
  resumeId: string;
  token: string;
  initialResume: OptimizedResume;
  initialStyle?: ResumeStylePrefs;
  onClose: () => void;
  onSave: (resume: OptimizedResume, style: ResumeStylePrefs) => void;
}

const FONT_OPTIONS = [
  "Helvetica Neue",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Calibri",
  "Garamond",
];

function StyleSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <Label>{label}</Label>
        <span>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}

export function ResumeEditorModal({
  resumeId,
  token,
  initialResume,
  initialStyle,
  onClose,
  onSave,
}: ResumeEditorModalProps) {
  const [draft, setDraft] = useState<OptimizedResume>(() => structuredClone(initialResume));
  const [style, setStyle] = useState<ResumeStylePrefs>(() => ({ ...DEFAULT_RESUME_STYLE, ...initialStyle }));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const refreshPreview = useCallback(async (resume: OptimizedResume, pdfStyle: ResumeStylePrefs) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPreviewLoading(true);
    setError("");
    try {
      const blob = await previewResumePdf(token, { optimizedResume: resume, pdfStyle });
      if (controller.signal.aborted) return;
      setPreviewUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return window.URL.createObjectURL(blob);
      });
    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Preview failed");
      }
    } finally {
      if (!controller.signal.aborted) setPreviewLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => refreshPreview(draft, style), 600);
    return () => clearTimeout(timer);
  }, [draft, style, refreshPreview]);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const updateContact = (field: keyof OptimizedResume["contact"], value: string) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, [field]: value } }));

  const updateExp = (idx: number, field: string, value: string) =>
    setDraft((d) => ({
      ...d,
      experience: d.experience.map((exp, i) => (i === idx ? { ...exp, [field]: value } : exp)),
    }));

  const updateBullet = (expIdx: number, bulletIdx: number, value: string) =>
    setDraft((d) => ({
      ...d,
      experience: d.experience.map((exp, i) =>
        i === expIdx
          ? { ...exp, bullets: exp.bullets.map((b, j) => (j === bulletIdx ? value : b)) }
          : exp
      ),
    }));

  const addBullet = (expIdx: number) =>
    setDraft((d) => ({
      ...d,
      experience: d.experience.map((exp, i) =>
        i === expIdx ? { ...exp, bullets: [...exp.bullets, ""] } : exp
      ),
    }));

  const removeBullet = (expIdx: number, bulletIdx: number) =>
    setDraft((d) => ({
      ...d,
      experience: d.experience.map((exp, i) =>
        i === expIdx ? { ...exp, bullets: exp.bullets.filter((_, j) => j !== bulletIdx) } : exp
      ),
    }));

  const updateEdu = (idx: number, field: string, value: string) =>
    setDraft((d) => ({
      ...d,
      education: d.education.map((edu, i) => (i === idx ? { ...edu, [field]: value } : edu)),
    }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.updateResumeBuilder(token, resumeId, { optimizedResume: draft, pdfStyle: style });
      onSave(draft, style);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3">
      <div className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121826] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div>
            <h3 className="font-semibold text-white">Edit Resume</h3>
            <p className="text-xs text-slate-400">Adjust text, fonts, and spacing — preview updates live</p>
          </div>
          <div className="flex items-center gap-2">
            {error && <span className="mr-2 self-center text-xs text-red-400">{error}</span>}
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-purple-500 to-pink-500">
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="w-[42%] space-y-5 overflow-y-auto border-r border-white/[0.06] p-4">
            <div className="space-y-3">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <Type className="h-4 w-4 text-purple-400" />
                Typography & Spacing
              </h4>
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select value={style.fontFamily} onChange={(e) => setStyle((s) => ({ ...s, fontFamily: e.target.value }))}>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
              </div>
              <StyleSlider label="Body Font Size" value={style.fontSize} min={8} max={14} step={0.5} unit="pt" onChange={(v) => setStyle((s) => ({ ...s, fontSize: v }))} />
              <StyleSlider label="Name Font Size" value={style.nameFontSize} min={18} max={36} step={1} unit="pt" onChange={(v) => setStyle((s) => ({ ...s, nameFontSize: v }))} />
              <StyleSlider label="Line Height" value={style.lineHeight} min={1.1} max={2} step={0.1} unit="" onChange={(v) => setStyle((s) => ({ ...s, lineHeight: v }))} />
              <StyleSlider label="Section Spacing" value={style.sectionSpacing} min={8} max={32} step={2} unit="px" onChange={(v) => setStyle((s) => ({ ...s, sectionSpacing: v }))} />
              <StyleSlider label="Page Padding" value={style.pagePadding} min={20} max={80} step={5} unit="px" onChange={(v) => setStyle((s) => ({ ...s, pagePadding: v }))} />
            </div>

            <div className="space-y-3 border-t border-white/[0.06] pt-4">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <AlignLeft className="h-4 w-4 text-purple-400" />
                Contact
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label>Name</Label>
                  <Input value={draft.contact.name} onChange={(e) => updateContact("name", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={draft.contact.email} onChange={(e) => updateContact("email", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={draft.contact.phone || ""} onChange={(e) => updateContact("phone", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={draft.contact.linkedin || ""} onChange={(e) => updateContact("linkedin", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>GitHub</Label>
                  <Input value={draft.contact.github || ""} onChange={(e) => updateContact("github", e.target.value)} className="mt-1" />
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/[0.06] pt-4">
              <Label>Professional Summary</Label>
              <Textarea value={draft.summary} onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))} rows={4} className="min-h-[80px]" />
            </div>

            <div className="space-y-2 border-t border-white/[0.06] pt-4">
              <Label>Skills (comma-separated)</Label>
              <Textarea
                value={draft.skills.join(", ")}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  }))
                }
                rows={2}
                className="min-h-[60px]"
              />
            </div>

            {draft.experience.map((exp, idx) => (
              <div key={idx} className="space-y-2 border-t border-white/[0.06] pt-4">
                <h4 className="text-sm font-semibold text-white">Experience {idx + 1}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Title</Label>
                    <Input value={exp.title} onChange={(e) => updateExp(idx, "title", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input value={exp.company} onChange={(e) => updateExp(idx, "company", e.target.value)} className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label>Duration</Label>
                    <Input value={exp.duration} onChange={(e) => updateExp(idx, "duration", e.target.value)} className="mt-1" />
                  </div>
                </div>
                <Label>Bullet Points</Label>
                {exp.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex gap-1">
                    <Textarea
                      value={bullet}
                      onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                      rows={2}
                      className="min-h-[50px] flex-1"
                    />
                    <button type="button" onClick={() => removeBullet(idx, bIdx)} className="self-start p-1 text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addBullet(idx)} className="text-xs">
                  <Plus className="mr-1 h-3 w-3" />
                  Add Bullet
                </Button>
              </div>
            ))}

            {draft.education.map((edu, idx) => (
              <div key={idx} className="space-y-2 border-t border-white/[0.06] pt-4">
                <h4 className="text-sm font-semibold text-white">Education {idx + 1}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Degree</Label>
                    <Input value={edu.degree} onChange={(e) => updateEdu(idx, "degree", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input value={edu.year} onChange={(e) => updateEdu(idx, "year", e.target.value)} className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label>Institution</Label>
                    <Input value={edu.institution} onChange={(e) => updateEdu(idx, "institution", e.target.value)} className="mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 flex-col bg-[#0a0f1a]">
            <div className="shrink-0 border-b border-white/[0.06] px-4 py-2 text-xs text-slate-400">
              {previewLoading ? "Updating preview…" : "Live PDF Preview"}
            </div>
            <div className="relative flex-1">
              {previewLoading && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500" />
                </div>
              )}
              {previewUrl && (
                <iframe src={previewUrl} title="Resume PDF Preview" className="h-full w-full bg-white" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
