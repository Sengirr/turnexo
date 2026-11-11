import { useState, FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  Users,
  Video,
  ShieldCheck,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  ChevronDown,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Mail,
  Globe,
} from 'lucide-react';
import HeroPhoneMockup from './HeroPhoneMockup';
import { LandingLanguage, LANDING_TRANSLATIONS } from '../lib/landingTranslations';
import { HostAccount } from '../lib/supabase';
import { isCommunityPromoCode } from '../lib/promo';

interface Props {
  hostAccount?: HostAccount | null;
  promoCode?: string | null;
  onNavigateToApp: (
    mode?: 'login' | 'register',
    plan?: 'plan_starter' | 'plan_pro' | 'plan_manager'
  ) => void;
  onOpenGuestDemo: () => void;
  onOpenCleanerDemo: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'legal') => void;
}

export default function LandingPageView({
  hostAccount,
  promoCode,
  onNavigateToApp,
  onOpenGuestDemo,
  onOpenCleanerDemo,
  onOpenLegal,
}: Props) {
  const hasCommunityPromo = isCommunityPromoCode(promoCode);
  // Estado de idioma (ES / EN) con persistencia en localStorage y detección automática
  const [lang, setLang] = useState<LandingLanguage>(() => {
    try {
      const saved = localStorage.getItem('turnexo_lang_preference');
      if (saved === 'es' || saved === 'en') return saved;
      if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en')) {
        return 'en';
      }
    } catch {
      // ignore
    }
    return 'es';
  });

  const changeLanguage = (newLang: LandingLanguage) => {
    setLang(newLang);
    try {
      localStorage.setItem('turnexo_lang_preference', newLang);
    } catch {
      // ignore
    }
  };

  const t = LANDING_TRANSLATIONS[lang];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Estado del acordeón de FAQ
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Estado del Modal de Contacto integrado
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactUnits, setContactUnits] = useState(t.contactModal.unitsOptions[3] || 'Más de 10 alojamientos');
  const [contactName, setContactName] = useState('');
  const [contactChannel, setContactChannel] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const openContactModal = (defaultUnits?: string) => {
    setContactUnits(defaultUnits || t.contactModal.unitsOptions[1] || '2 a 5 alojamientos');
    setContactSubmitted(false);
    setContactModalOpen(true);
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem('turnexo_contact_leads_v1') || '[]');
      existing.unshift({
        id: `lead-${Date.now()}`,
        name: contactName.trim(),
        contact: contactChannel.trim(),
        units: contactUnits,
        message: contactMessage.trim(),
        lang,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('turnexo_contact_leads_v1', JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }
    setContactSubmitted(true);
  };

  return (
    <div className={`min-h-screen bg-[#F6F4EE] text-[#141413] ${hasCommunityPromo ? 'pt-28 sm:pt-32' : 'pt-20'} overflow-x-clip`}>
      {/* NAVBAR SAAS DIRECTA Y LIMPIA FIJA SIEMPRE VISIBLE */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F6F4EE]/95 backdrop-blur-md border-b border-[#E2DDD2]">
        {hasCommunityPromo && (
          <div className="bg-[#141413] text-[#F6F4EE] px-4 py-2 border-b border-[#C85A32] text-xs shadow-sm">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="bg-[#C85A32] text-white text-[10px] font-mono uppercase font-bold px-2 py-0.5 tracking-wider">
                  PASE COMUNIDAD ANFITRIONES
                </span>
                <span className="text-white/90 text-xs hidden sm:inline">
                  Acceso exclusivo para el grupo: <strong>Módulo Fiscal de IVA 10% y Facturación Oficial activado gratis</strong>.
                </span>
                <span className="text-white/90 text-xs sm:hidden">
                  <strong>Pase IVA 10% gratis</strong> para tu grupo.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToApp('register', 'plan_starter')}
                className="bg-[#C85A32] hover:bg-[#b04b25] text-white font-bold px-3 py-1 text-xs transition whitespace-nowrap ml-auto"
              >
                Activar pase gratis →
              </button>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          {/* Columna 1: Identidad de Marca */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 whitespace-nowrap group">
            <div className="w-8 h-8 bg-[#141413] text-[#F6F4EE] flex items-center justify-center font-mono font-extrabold text-xs tracking-tighter group-hover:bg-[#C85A32] transition-colors">
              TX
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#141413]">
              Turnexo<span className="text-[#C85A32]">.</span>
            </span>
          </a>

          {/* Columna 2: Navegación Directa */}
          <nav className="hidden lg:flex items-center gap-2 text-sm font-medium text-[#57554F] whitespace-nowrap">
            <a
              href="#modulos"
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              {t.nav.includes}
            </a>

            <a
              href="#comparativa"
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              {t.nav.comparison}
            </a>

            <a
              href="#precios"
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              {t.nav.pricing}
            </a>

            <a
              href="#faq"
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              {t.nav.faq}
            </a>

            <button
              type="button"
              onClick={() => openContactModal(t.nav.contact)}
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              {t.nav.contact}
            </button>
          </nav>

          {/* Columna 3: Idioma + Acceso Clientes + CTA Principal */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
            {/* SELECTOR DE IDIOMA ULTRA-VISIBLE (ES / EN) */}
            <div className="flex items-center gap-1 border-2 border-[#141413] bg-white rounded-lg px-2 py-1 text-xs font-mono shadow-xs">
              <Globe size={14} className="text-[#C85A32] shrink-0" />
              <button
                type="button"
                onClick={() => changeLanguage('es')}
                className={`px-2 py-0.5 rounded transition-all font-bold ${
                  lang === 'es'
                    ? 'bg-[#141413] text-white shadow-xs'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
                title="Cambiar a Español"
                aria-label="Español"
              >
                ES
              </button>
              <span className="text-[#D5CFC0] font-sans">|</span>
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-2 py-0.5 rounded transition-all font-bold ${
                  lang === 'en'
                    ? 'bg-[#141413] text-white shadow-xs'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
                title="Switch to English"
                aria-label="English"
              >
                EN
              </button>
            </div>

            {hostAccount ? (
              <button
                type="button"
                onClick={() => onNavigateToApp()}
                className="bg-[#141413] hover:bg-[#2C2C29] text-white text-xs font-bold uppercase tracking-wider px-3 sm:px-5 py-2 sm:py-3 transition flex items-center gap-1.5 sm:gap-2 shadow-xs whitespace-nowrap"
              >
                <span>{t.nav.goToDashboard}</span>
                <ArrowUpRight size={14} className="shrink-0" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateToApp('login')}
                  className="hidden sm:inline-flex items-center text-sm font-semibold text-[#141413] hover:text-[#C85A32] px-3 py-2 transition whitespace-nowrap"
                >
                  {t.nav.login}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToApp('register')}
                  className="hidden md:inline-flex bg-[#C85A32] hover:bg-[#B04A25] text-white text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 transition items-center gap-2 shadow-xs whitespace-nowrap"
                >
                  <span>{t.nav.freeTrialBtn}</span>
                  <ArrowUpRight size={15} className="shrink-0" />
                </button>
              </>
            )}

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 border border-[#141413] bg-white text-[#141413]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Layers size={18} />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF9F5] border-t-2 border-[#141413] px-6 py-6 space-y-4 shadow-2xl">
            {/* Selector de idioma en móvil */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
              <span className="text-xs font-mono uppercase text-[#57554F] flex items-center gap-1.5 font-bold">
                <Globe size={14} className="text-[#C85A32]" />
                Idioma / Language:
              </span>
              <div className="flex items-center border border-[#D5CFC0] bg-white rounded-lg p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => changeLanguage('es')}
                  className={`px-3 py-1 rounded transition-all ${
                    lang === 'es' ? 'bg-[#141413] text-white font-bold' : 'text-[#57554F]'
                  }`}
                >
                  🇪🇸 Español
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1 rounded transition-all ${
                    lang === 'en' ? 'bg-[#141413] text-white font-bold' : 'text-[#57554F]'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm font-bold text-[#141413]">
              <a
                href="#modulos"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border border-[#D5CFC0]"
              >
                {t.nav.includes}
              </a>
              <a
                href="#comparativa"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border border-[#D5CFC0]"
              >
                {t.nav.comparison}
              </a>
              <a
                href="#precios"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border border-[#D5CFC0]"
              >
                {t.nav.pricing}
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border border-[#D5CFC0]"
              >
                {t.nav.faq}
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openContactModal(t.nav.contact);
                }}
                className="p-3 bg-[#E8E4D9] text-[#141413] border border-[#D5CFC0] text-left col-span-2"
              >
                {t.nav.contact}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToApp();
              }}
              className="w-full bg-[#141413] text-white font-sans text-xs font-bold uppercase py-3.5"
            >
              {t.nav.mobileLoginCta}
            </button>
          </div>
        )}
      </header>

      {/* SECCIÓN 1: HERO EDITORIAL + MAQUETA INTERACTIVA DE 3 PESTAÑAS */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-20 border-b border-[#E2DDD2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-7 pt-2">
            <div className="inline-flex items-center gap-2.5 border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-emerald-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#141413]">
              {t.hero.titleStart}{' '}
              <span className="text-[#C85A32] block sm:inline">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#57554F] leading-relaxed max-w-2xl font-normal">
              {t.hero.subtitle}
            </p>

            {/* 3 puntos con check (valor operativo) */}
            <ul className="space-y-3 max-w-2xl text-sm sm:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>{t.hero.check1Title}</strong> {t.hero.check1Desc}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>{t.hero.check2Title}</strong> {t.hero.check2Desc}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>{t.hero.check3Title}</strong> {t.hero.check3Desc}
                </span>
              </li>
            </ul>

            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigateToApp('register')}
                  className="bg-[#C85A32] hover:bg-[#B04A25] text-white text-sm sm:text-base font-bold px-7 py-4 transition flex items-center gap-2 shadow-md group"
                >
                  <span>{t.hero.ctaBtn}</span>
                </button>
              </div>

              <p className="text-xs font-mono text-[#57554F] flex items-center gap-1.5 pt-1">
                <span className="text-[#1F4E3D] font-bold">✓</span>
                <span>{t.hero.noCardNote}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-[#E2DDD2] max-w-xl">
              <div className="bg-white/60 sm:bg-transparent p-3 sm:p-0 border sm:border-0 border-[#E2DDD2]">
                <p className="font-mono text-2xl font-bold text-[#141413]">{t.hero.metric1Val}</p>
                <p className="text-xs text-[#57554F] mt-0.5">{t.hero.metric1Desc}</p>
              </div>
              <div className="bg-white/60 sm:bg-transparent p-3 sm:p-0 border sm:border-0 border-[#E2DDD2]">
                <p className="font-mono text-2xl font-bold text-emerald-700">{t.hero.metric2Val}</p>
                <p className="text-xs text-[#57554F] mt-0.5">{t.hero.metric2Desc}</p>
              </div>
              <div className="bg-white/60 sm:bg-transparent p-3 sm:p-0 border sm:border-0 border-[#E2DDD2]">
                <p className="font-mono text-2xl font-bold text-[#1F4E3D]">{t.hero.metric3Val}</p>
                <p className="text-xs text-[#57554F] mt-0.5">{t.hero.metric3Desc}</p>
              </div>
            </div>
          </div>

          {/* Mockup Realista de Smartphone Interactivo */}
          <div className="lg:col-span-5">
            <HeroPhoneMockup
              onOpenCleanerDemo={onOpenCleanerDemo}
              onOpenGuestDemo={onOpenGuestDemo}
              lang={lang}
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: LOS 3 MOTORES */}
      <section id="modulos" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="max-w-3xl space-y-3 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            {t.modules.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] leading-tight tracking-tight">
            {t.modules.title}
          </h2>
          <p className="text-sm text-[#57554F] leading-relaxed">
            {t.modules.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* MOTOR 1: EXPERIENCIA DEL HUÉSPED */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-5 sm:p-8 md:p-10 flex flex-col justify-between space-y-7">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold whitespace-nowrap">
                  {t.modules.mod1Num}
                </span>
                <span className="font-mono text-xs font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2.5 py-0.5 whitespace-nowrap">
                  {t.modules.mod1Badge}
                </span>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                  {t.modules.mod1Title}
                </h3>
                <p className="text-sm text-[#57554F] leading-relaxed">
                  {t.modules.mod1Desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Video size={14} className="text-[#C85A32]" />
                    {t.modules.mod1Card1Title}
                  </p>
                  <p className="text-[#57554F]">
                    {t.modules.mod1Card1Desc}
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#1F4E3D]" />
                    {t.modules.mod1Card2Title}
                  </p>
                  <p className="text-[#57554F]">
                    {t.modules.mod1Card2Desc}
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#C85A32]" />
                    {t.modules.mod1Card3Title}
                  </p>
                  <p className="text-[#57554F]">
                    {t.modules.mod1Card3Desc}
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#1F4E3D]" />
                    {t.modules.mod1Card4Title}
                  </p>
                  <p className="text-[#57554F]">
                    {t.modules.mod1Card4Desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={onOpenGuestDemo}
                className="text-xs sm:text-sm font-sans font-bold text-[#C85A32] hover:text-[#B04A25] inline-flex items-center gap-1.5 group"
              >
                <span>{t.modules.mod1Cta}</span>
                <ArrowUpRight
                  size={15}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
            </div>
          </div>

          {/* MOTOR 2: OPERATIVA DE LIMPIEZA */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-5 sm:p-8 md:p-10 flex flex-col justify-between space-y-7">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#1F4E3D] font-bold whitespace-nowrap">
                  {t.modules.mod2Num}
                </span>
                <span className="font-mono text-xs font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2.5 py-0.5 whitespace-nowrap">
                  {t.modules.mod2Badge}
                </span>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                  {t.modules.mod2Title}
                </h3>
                <p className="text-sm text-[#57554F] leading-relaxed">
                  {t.modules.mod2Desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Users size={14} className="text-[#1F4E3D]" />
                    {t.modules.mod2Card1Title}
                  </p>
                  <p className="text-[#57554F]">
                    {t.modules.mod2Card1Desc}
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#1F4E3D]" />
                    {t.modules.mod2Card2Title}
                  </p>
                  <p className="text-[#57554F]">
                    {t.modules.mod2Card2Desc}
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#1F4E3D]" />
                    {t.modules.mod2Card3Title}
                  </p>
                  <p className="text-[#57554F]">
                    {t.modules.mod2Card3Desc}
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Flame size={14} className="text-[#C85A32]" />
                    {t.modules.mod2Card4Title}
                  </p>
                  <p className="text-[#57554F]">
                    {t.modules.mod2Card4Desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={onOpenCleanerDemo}
                className="text-xs sm:text-sm font-sans font-bold text-[#1F4E3D] hover:text-[#16382B] inline-flex items-center gap-1.5 group"
              >
                <span>{t.modules.mod2Cta}</span>
                <ArrowUpRight
                  size={15}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>

        {/* MOTOR 3: FACTURACIÓN Y GESTORÍA */}
        <div className="mt-8 bg-[#FAF9F5] border border-[#D5CFC0] p-5 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DDD2] pb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-800 font-bold whitespace-nowrap">
                {t.modules.mod3Num}
              </span>
              <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 whitespace-nowrap">
                {t.modules.mod3Badge}
              </span>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                {t.modules.mod3Title}
              </h3>
              <p className="text-sm text-[#57554F] leading-relaxed">
                {t.modules.mod3Desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">{t.modules.mod3Card1Title}</p>
                <p className="text-[#57554F]">{t.modules.mod3Card1Desc}</p>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">{t.modules.mod3Card2Title}</p>
                <p className="text-[#57554F]">{t.modules.mod3Card2Desc}</p>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">{t.modules.mod3Card3Title}</p>
                <p className="text-[#57554F]">{t.modules.mod3Card3Desc}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#141413] text-[#F6F4EE] p-6 border border-[#2C2C29] space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3 font-mono">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                {t.modules.mod3SummaryTitle}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                {t.modules.mod3SummaryBadge}
              </span>
            </div>

            <div className="space-y-2 bg-white/5 p-3.5 border border-white/10 font-mono text-xs">
              <div className="flex justify-between text-white/70">
                <span>{t.modules.mod3SummaryInvoices}</span>
                <span className="font-bold text-white">{t.modules.mod3SummaryInvoicesVal}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>{t.modules.mod3SummaryBase}</span>
                <span className="font-bold text-white">11.420,00 €</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold border-t border-white/10 pt-2">
                <span>{t.modules.mod3SummaryVat}</span>
                <span>1.142,00 €</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono text-[11px]">
              <div className="bg-white/5 border border-white/10 px-3 py-2.5 flex items-center gap-2 text-white/90">
                <FileSpreadsheet size={15} className="text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-white truncate">{t.modules.mod3File1Name}</p>
                  <p className="text-[10px] text-white/55 truncate">{t.modules.mod3File1Sub}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 py-2.5 flex items-center gap-2 text-white/90">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-white truncate">{t.modules.mod3File2Name}</p>
                  <p className="text-[10px] text-white/55 truncate">{t.modules.mod3File2Sub}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: COMPARATIVA DIRECTA */}
      <section id="comparativa" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            {t.comparison.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] leading-tight tracking-tight">
            {t.comparison.title}
          </h2>
          <p className="text-sm text-[#57554F] leading-relaxed">
            {t.comparison.subtitle}
          </p>
        </div>

        {/* VISTA MÓVIL: TARJETAS COMPARATIVAS VERTICALES (SIN SCROLL HORIZONTAL) */}
        <div className="md:hidden space-y-4">
          {t.comparison.rows.map((row, idx) => (
            <div
              key={idx}
              className="bg-[#FAF9F5] border border-[#D5CFC0] p-4.5 space-y-3 shadow-2xs"
            >
              <h3 className="font-extrabold text-sm text-[#141413] border-b border-[#E2DDD2] pb-2">
                {row.task}
              </h3>

              {/* Opción Ganadora: Con Turnexo */}
              <div className="bg-[#141413] text-[#F6F4EE] p-3.5 space-y-1.5 border-l-4 border-[#C85A32]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#C85A32]">
                    {t.comparison.thTurnexo}
                  </span>
                  <Check size={14} className="text-[#C85A32]" />
                </div>
                <p className="text-xs leading-relaxed text-white font-medium">
                  {row.turnexo}
                </p>
              </div>

              {/* Opciones Tradicionales */}
              <div className="space-y-2 text-xs pt-0.5">
                <div className="bg-white p-2.5 border border-[#E2DDD2] space-y-0.5">
                  <span className="font-mono text-[10px] text-[#57554F] font-bold block uppercase">
                    {t.comparison.thManual}:
                  </span>
                  <p className="text-[#57554F] leading-snug">
                    {row.manual}
                  </p>
                </div>
                <div className="bg-white p-2.5 border border-[#E2DDD2] space-y-0.5">
                  <span className="font-mono text-[10px] text-[#57554F] font-bold block uppercase">
                    {t.comparison.thPms}:
                  </span>
                  <p className="text-[#57554F] leading-snug">
                    {row.pms}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* VISTA ORDENADOR: TABLA CLÁSICA DE 4 COLUMNAS */}
        <div className="hidden md:block bg-[#FAF9F5] border border-[#D5CFC0] overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5CFC0] bg-[#E8E4D9]/60 font-mono text-[11px] uppercase tracking-wider text-[#57554F]">
                <th className="py-4 px-5">{t.comparison.thTask}</th>
                <th className="py-4 px-5 text-[#57554F]">{t.comparison.thManual}</th>
                <th className="py-4 px-5 text-[#57554F]">{t.comparison.thPms}</th>
                <th className="py-4 px-5 bg-[#141413] text-[#F6F4EE] font-bold">{t.comparison.thTurnexo}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD2]">
              {t.comparison.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white transition">
                  <td className="py-4 px-5 font-bold text-[#141413]">{row.task}</td>
                  <td className="py-4 px-5 text-[#57554F]">{row.manual}</td>
                  <td className="py-4 px-5 text-[#57554F]">{row.pms}</td>
                  <td className={`py-4 px-5 bg-[#141413]/5 font-bold ${idx === t.comparison.rows.length - 1 ? 'text-[#C85A32]' : 'text-[#1F4E3D]'}`}>
                    {row.turnexo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN 4: PRECIOS CLAROS */}
      <section id="precios" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            {t.pricing.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] tracking-tight">
            {t.pricing.title}
          </h2>
          <p className="text-sm text-[#57554F]">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* SELECTOR INTERACTIVO FACTURACIÓN MENSUAL / ANUAL */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <div className="inline-flex items-center p-1 bg-[#E8E4D9] border border-[#D5CFC0] rounded-xl text-xs font-mono shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#141413] text-white shadow-xs'
                  : 'text-[#57554F] hover:text-[#141413]'
              }`}
            >
              {t.pricing.billingMonthly}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'text-[#57554F] hover:text-[#141413]'
              }`}
            >
              <span>{t.pricing.billingYearly}</span>
              <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                -20%
              </span>
            </button>
          </div>
          {billingCycle === 'yearly' && (
            <span className="text-xs font-mono font-bold text-[#1F4E3D] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fade-in flex items-center gap-1">
              {t.pricing.yearlyDiscountBadge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {t.pricing.plans.map((plan) => {
            const isYearly = billingCycle === 'yearly';
            const currentPrice = isYearly ? plan.priceYearly : plan.price;
            const currentNote = isYearly ? plan.noteYearly : plan.note;
            const showCrossedOut = isYearly && plan.priceYearly !== plan.price;

            return (
              <div
                key={plan.name}
                className={`p-6 sm:p-8 flex flex-col justify-between space-y-6 ${
                  plan.highlight
                    ? 'bg-[#141413] text-[#F6F4EE] border-2 border-[#141413] shadow-[8px_8px_0px_#C85A32]'
                    : 'bg-[#FAF9F5] text-[#141413] border border-[#D5CFC0]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold">{plan.name}</h3>
                    {plan.highlight && (
                      <span className="font-mono text-[10px] uppercase font-bold bg-[#C85A32] text-white px-2 py-0.5">
                        {t.pricing.mostChosenBadge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-mono uppercase ${plan.highlight ? 'text-white/60' : 'text-[#57554F]'}`}>
                    {plan.units}
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap font-sans">
                    {showCrossedOut && (
                      <span className={`text-2xl font-bold line-through ${plan.highlight ? 'text-white/40' : 'text-[#57554F]/50'}`}>
                        {plan.price}
                      </span>
                    )}
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight whitespace-nowrap">
                      {currentPrice}
                    </span>
                    <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${plan.highlight ? 'text-white/70' : 'text-[#57554F]'}`}>
                      {currentNote}
                    </span>
                  </div>
                  {isYearly && plan.savingsText && (
                    <p className={`text-[11px] font-mono font-bold ${plan.highlight ? 'text-emerald-300' : 'text-[#1F4E3D]'}`}>
                      ✓ {plan.savingsText}
                    </p>
                  )}
                  <p className={`text-xs leading-relaxed ${plan.highlight ? 'text-white/75' : 'text-[#57554F]'}`}>
                    {plan.summary}
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-current/10">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-[#C85A32]' : 'text-[#1F4E3D]'}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToApp('register', plan.planKey)}
                  className={`w-full font-sans font-semibold text-sm py-3.5 transition flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-[#C85A32] hover:bg-[#B04A25] text-white shadow-md'
                      : 'bg-[#141413] hover:bg-[#2C2C29] text-white'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bloque horizontal para Gestoras de +10 alojamientos */}
        <div className="mt-8 bg-[#FAF9F5] border border-[#D5CFC0] p-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2 py-0.5">
                {t.pricing.customBannerBadge}
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-[#141413]">
                {t.pricing.customBannerTitle}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#57554F]">
              {t.pricing.customBannerDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openContactModal(t.pricing.customBannerBadge)}
            className="shrink-0 font-sans text-xs sm:text-sm font-bold text-[#141413] hover:text-[#C85A32] border border-[#141413] hover:border-[#C85A32] bg-white px-5 py-3 transition inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>{t.pricing.customBannerCta}</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </section>

      {/* SECCIÓN 5: FAQ */}
      <section id="faq" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
              {t.faq.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] tracking-tight">
              {t.faq.title}
            </h2>
          </div>

          <div className="space-y-3">
            {t.faq.items.map((faqItem, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#FAF9F5] border border-[#D5CFC0] transition overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 font-bold text-sm sm:text-base text-[#141413] flex items-center justify-between gap-4"
                  >
                    <span>{faqItem.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#C85A32] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#57554F] leading-relaxed border-t border-[#E2DDD2]/60 animate-in fade-in duration-200">
                      {faqItem.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECCIÓN FINAL DE CIERRE DE CONVERSIÓN */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#141413] text-[#F6F4EE] border-2 border-[#141413] p-8 sm:p-14 shadow-[10px_10px_0px_#C85A32] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
              {t.bottomCta.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {t.bottomCta.title}{' '}
              <span className="text-[#C85A32]">{t.bottomCta.freeWord}</span>
            </h2>
            <p className="text-sm text-white/75 leading-relaxed">
              {t.bottomCta.desc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToApp('register')}
              className="bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans text-sm sm:text-base font-bold px-7 py-4 transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>{t.bottomCta.ctaBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO ESTRUCTURADO Y MODAL DE CONTACTO */}
      <footer className="border-t border-[#D5CFC0] bg-[#141413] text-[#F6F4EE] pt-14 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Columna 1: Marca + Contacto directo */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#C85A32] text-white flex items-center justify-center font-mono font-extrabold text-xs">
                TX
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Turnexo<span className="text-[#C85A32]">.</span>
              </span>
            </div>
            <p className="text-xs text-white/65 leading-relaxed max-w-sm">
              {t.footer.brandDesc}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono">
              <button
                type="button"
                onClick={() => openContactModal(t.footer.supportBtn)}
                className="bg-white/10 hover:bg-[#C85A32] text-white px-3.5 py-2 transition inline-flex items-center gap-1.5 font-bold"
              >
                <Mail size={13} />
                <span>{t.footer.supportBtn}</span>
              </button>
              <a
                href="mailto:info@turnexo.app"
                className="text-white/60 hover:text-white transition underline underline-offset-4"
              >
                info@turnexo.app
              </a>
            </div>
          </div>

          {/* Columna 2: Producto y Ejemplos */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/45 font-bold">
              {t.footer.col2Title}
            </p>
            <ul className="space-y-2.5 text-white/75">
              <li>
                <a href="#modulos" className="hover:text-white transition">
                  {t.footer.linkIncludes}
                </a>
              </li>
              <li>
                <a href="#comparativa" className="hover:text-white transition">
                  {t.footer.linkComparison}
                </a>
              </li>
              <li>
                <a href="#precios" className="hover:text-white transition">
                  {t.footer.linkPricing}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  {t.footer.linkFaq}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenGuestDemo}
                  className="text-[#C85A32] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>{t.footer.linkGuestDemo}</span>
                  <ArrowUpRight size={13} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCleanerDemo}
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>{t.footer.linkCleanerDemo}</span>
                  <ArrowUpRight size={13} />
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Acceso y Legal */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/45 font-bold">
              {t.footer.col3Title}
            </p>
            <ul className="space-y-2.5 text-white/75">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToApp('login')}
                  className="hover:text-white transition font-semibold"
                >
                  {t.footer.linkLogin}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToApp('register')}
                  className="text-[#C85A32] hover:underline font-bold"
                >
                  {t.footer.linkRegister}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openContactModal(t.footer.linkContact)}
                  className="hover:text-white transition"
                >
                  {t.footer.linkContact}
                </button>
              </li>
              {onOpenLegal && (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenLegal('privacy')}
                      className="hover:text-white transition"
                    >
                      {t.footer.linkPrivacy}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenLegal('terms')}
                      className="hover:text-white transition"
                    >
                      {t.footer.linkTerms}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenLegal('legal')}
                      className="hover:text-white transition"
                    >
                      {t.footer.linkLegal}
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/50 border-t border-white/10 mt-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-white/70">
              <Globe size={13} className="text-[#C85A32]" />
              Idioma / Language:
            </span>
            <div className="inline-flex items-center bg-white/10 rounded-md p-0.5 border border-white/15">
              <button
                type="button"
                onClick={() => changeLanguage('es')}
                className={`px-2 py-0.5 rounded transition ${
                  lang === 'es' ? 'bg-[#C85A32] text-white font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-2 py-0.5 rounded transition ${
                  lang === 'en' ? 'bg-[#C85A32] text-white font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
          <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
          <p>{t.footer.icalCompat}</p>
        </div>
      </footer>

      {/* MODAL DE CONTACTO INTEGRADO */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-[#141413] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-[10px_10px_0px_#C85A32]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2DDD2] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                  {t.contactModal.badge}
                </span>
                <h3 className="text-xl font-extrabold text-[#141413] mt-0.5">
                  {t.contactModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="w-8 h-8 border border-[#D5CFC0] bg-white flex items-center justify-center text-[#141413] hover:bg-[#141413] hover:text-white transition"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {contactSubmitted ? (
              <div className="space-y-4 py-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                  <p className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#1F4E3D]" />
                    <span>{t.contactModal.successTitle}</span>
                  </p>
                  <p className="text-[#57554F] leading-relaxed">
                    {t.contactModal.successDesc(contactUnits, contactChannel)}
                  </p>
                </div>
                <p className="text-xs text-[#57554F]">
                  {t.contactModal.supportAlternative}{' '}
                  <a href="mailto:info@turnexo.app" className="font-mono font-bold text-[#141413] underline">
                    info@turnexo.app
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="w-full bg-[#141413] text-white font-sans font-bold text-xs uppercase tracking-wider py-3.5"
                >
                  {t.contactModal.closeBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                    {t.contactModal.nameLabel}
                  </label>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={t.contactModal.namePlaceholder}
                    className="w-full bg-white border border-[#D5CFC0] px-3.5 py-2.5 text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                      {t.contactModal.channelLabel}
                    </label>
                    <input
                      required
                      value={contactChannel}
                      onChange={(e) => setContactChannel(e.target.value)}
                      placeholder={t.contactModal.channelPlaceholder}
                      className="w-full bg-white border border-[#D5CFC0] px-3.5 py-2.5 text-[#141413] focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                      {t.contactModal.unitsLabel}
                    </label>
                    <select
                      value={contactUnits}
                      onChange={(e) => setContactUnits(e.target.value)}
                      className="w-full bg-white border border-[#D5CFC0] px-3 py-2.5 text-[#141413] focus:outline-none focus:border-[#141413]"
                    >
                      {t.contactModal.unitsOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                    {t.contactModal.messageLabel}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={t.contactModal.messagePlaceholder}
                    className="w-full bg-white border border-[#D5CFC0] p-3.5 text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans font-bold text-sm py-3.5 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{t.contactModal.submitBtn}</span>
                  <ArrowRight size={15} />
                </button>

                <p className="text-[11px] text-[#57554F] text-center">
                  {t.contactModal.orDirectEmail}{' '}
                  <a href="mailto:info@turnexo.app" className="font-mono font-bold text-[#141413] underline">
                    info@turnexo.app
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
