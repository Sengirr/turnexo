import React, { useState } from 'react';
import { ShieldCheck, X, Check, Building2 } from 'lucide-react';
import { HostFiscalProfile } from '../lib/invoice';

interface Props {
  profile: HostFiscalProfile;
  onSave: (updated: HostFiscalProfile) => void;
  onClose: () => void;
}

export default function FiscalProfileModal({ profile, onSave, onClose }: Props) {
  const [formData, setFormData] = useState<HostFiscalProfile>({ ...profile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Building2 size={14} />
              Tus Datos Fiscales
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Perfil del Emisor / Anfitrión
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Estos datos aparecerán en el encabezado de todas tus facturas y facturas simplificadas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nombre y Apellidos o Razón Social *
            </label>
            <input
              type="text"
              value={formData.fullNameOrCompany}
              onChange={(e) =>
                setFormData({ ...formData, fullNameOrCompany: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              NIF / CIF / NIE *
            </label>
            <input
              type="text"
              value={formData.nifCif}
              onChange={(e) => setFormData({ ...formData, nifCif: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Dirección Fiscal *
            </label>
            <input
              type="text"
              value={formData.fiscalAddress}
              onChange={(e) =>
                setFormData({ ...formData, fiscalAddress: e.target.value })
              }
              placeholder="Calle, número, piso"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Código Postal *</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ciudad *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Serie Fact. Simplificada</label>
              <input
                type="text"
                value={formData.simplifiedSeriesPrefix}
                onChange={(e) =>
                  setFormData({ ...formData, simplifiedSeriesPrefix: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo IVA (%)</label>
              <input
                type="number"
                value={formData.defaultVatRate}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-emerald-700"
              />
              <span className="text-[10px] text-slate-400">10% régimen alojamiento</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Check size={15} />
              Guardar Datos Fiscales
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
