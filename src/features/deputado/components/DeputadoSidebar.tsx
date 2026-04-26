"use client";

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, GraduationCap, Calendar, Building2, Phone, Mail, ExternalLink } from 'lucide-react';
import { getSocialIcon } from '@/components/ui/SocialIcon';

interface DeputadoSidebarProps {
  dep: any;
}


export function DeputadoSidebar({ dep }: DeputadoSidebarProps) {
  const status = dep.ultimoStatus;
  const gabinete = status.gabinete;

  return (
    <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-8 space-y-6">
      <div className="bg-navy/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 space-y-8 overflow-hidden relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] -mr-16 -mt-16 rounded-full"></div>

        <div className="relative group/avatar flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/30 rounded-[3rem] blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-all duration-700 scale-90 group-hover/avatar:scale-100"></div>
            <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-[3rem] md:rounded-[3.5rem] p-1.5 bg-gradient-to-br from-gold/50 via-white/5 to-navy border border-white/10 shadow-2xl z-10 overflow-hidden group-hover/avatar:translate-y-[-4px] transition-transform duration-500">
              <div className="w-full h-full rounded-[3rem] overflow-hidden relative">
                <Image
                  src={status.urlFoto}
                  alt={status.nome}
                  width={208}
                  height={208}
                  className="object-cover w-full h-full scale-105 group-hover/avatar:scale-115 transition-transform duration-1000 ease-out"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60"></div>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] z-20 border border-white/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-[0.15em] whitespace-nowrap">
                {status.situacao}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4 pt-4 relative z-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tighter leading-[0.9] bg-gradient-to-b from-white via-white to-white/70 bg-clip-text">
              {status.nome}
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{dep.nomeCivil}</p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="group/badge relative">
              <div className="absolute inset-0 bg-gold/20 blur-lg opacity-0 group-hover/badge:opacity-100 transition-opacity"></div>
              <span className="relative px-4 py-1.5 bg-gold/10 text-gold text-[10px] font-black rounded-xl border border-gold/20 tracking-widest block transition-all group-hover/badge:bg-gold/20">
                {status.siglaPartido}
              </span>
            </div>
            <div className="group/badge relative">
              <div className="absolute inset-0 bg-white/10 blur-lg opacity-0 group-hover/badge:opacity-100 transition-opacity"></div>
              <span className="relative px-4 py-1.5 bg-white/5 text-slate-300 text-[10px] font-black rounded-xl border border-white/10 flex items-center gap-2 uppercase tracking-widest transition-all group-hover/badge:bg-white/10">
                <MapPin size={12} className="text-gold" />
                {status.siglaUf}
              </span>
            </div>
          </div>

          <a
            href={`https://www.camara.leg.br/deputados/${dep.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-gold/10 text-[9px] font-black text-slate-400 hover:text-gold uppercase tracking-[0.2em] rounded-xl border border-white/5 hover:border-gold/30 transition-all group/official shadow-sm mt-3"
          >
            <ExternalLink size={12} className="group-hover/official:translate-x-0.5 group-hover/official:-translate-y-0.5 transition-transform" />
            Perfil Oficial Câmara
          </a>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>

        <div className="space-y-4 px-2">
          <div className="flex items-center gap-4 group/bio">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover/bio:text-gold group-hover/bio:bg-gold/10 transition-all duration-300">
              <GraduationCap size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Escolaridade</span>
              <span className="text-white text-xs font-bold leading-tight block truncate">{dep.escolaridade}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 group/bio">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover/bio:text-gold group-hover/bio:bg-gold/10 transition-all duration-300">
              <Calendar size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Nascimento</span>
              <span className="text-white text-xs font-bold block">{new Date(dep.dataNascimento).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gabinete</p>
          </div>

          <div className="p-4 bg-white/5 rounded-[2rem] border border-white/5 space-y-4 group/gab transition-all hover:bg-white/10 hover:border-white/10 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-navy/60 rounded-xl flex items-center justify-center text-gold border border-white/5 group-hover/gab:scale-110 transition-transform"><Building2 size={16} /></div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-slate-500 font-black uppercase block mb-0.5">Endereço</span>
                <p className="text-white text-xs font-bold truncate">Prédio {gabinete.predio}, Sala {gabinete.sala}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-navy/60 rounded-xl flex items-center justify-center text-gold border border-white/5 group-hover/gab:scale-110 transition-transform"><Phone size={16} /></div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-slate-500 font-black uppercase block mb-0.5">Telefone</span>
                <p className="text-white text-xs font-bold">{gabinete.telefone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-navy/60 rounded-xl flex items-center justify-center text-gold border border-white/5 group-hover/gab:scale-110 transition-transform"><Mail size={16} /></div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-slate-500 font-black uppercase block mb-0.5">E-mail</span>
                <p className="text-white text-[10px] font-bold truncate hover:text-gold transition-colors cursor-pointer">{gabinete.email}</p>
              </div>
            </div>
          </div>
        </div>

        {dep.redeSocial?.length > 0 && (
          <div className="pt-2 px-2">
            <div className="flex flex-wrap gap-3">
              {dep.redeSocial.map((url: string, i: number) => (
                <a
                  key={`${url}-${i}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white/5 text-slate-400 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-navy hover:translate-y-[-4px] hover:shadow-[0_8px_20px_-6px_rgba(212,175,55,0.4)] transition-all duration-300 group/social"
                  title={new URL(url).hostname.replace('www.', '')}
                >
                  <div className="group-hover/social:scale-110 transition-transform duration-300">
                    {getSocialIcon(url)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
