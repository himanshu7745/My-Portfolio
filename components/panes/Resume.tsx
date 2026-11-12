"use client";

import { profile } from "@/data/portfolio";
import { IconArrowUpRight, IconDownload } from "@/lib/icons";

export default function Resume() {
  return (
    <div className="resume">
      <div className="resume-bar">
        <div>
          <p className="eyebrow mono">Résumé</p>
          <p className="muted small">PDF · one page</p>
        </div>
        <div className="resume-actions">
          <a className="btn mono" href={profile.resume} target="_blank" rel="noreferrer">
            Open <IconArrowUpRight size={15} />
          </a>
          <a className="btn btn-primary mono" href={profile.resume} download="Himanshu_Mishra_Resume.pdf">
            Download <IconDownload size={15} />
          </a>
        </div>
      </div>
      <object className="resume-frame" data={`${profile.resume}#view=FitH`} type="application/pdf" aria-label="Résumé PDF">
        <a className="resume-fallback" href={profile.resume} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/resume-preview.png" alt={`${profile.name} résumé, page 1`} width={1275} height={1650} />
        </a>
      </object>
    </div>
  );
}
