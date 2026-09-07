import React from 'react';
import { Phone, CreditCard, Car, Building2, MapPin, Database, Shield } from 'lucide-react';

export default function PersonAssets({ assets = {} }) {
  const phones = assets.phones || [];
  const bankAccounts = assets.bank_accounts || [];
  const vehicles = assets.vehicles || [];
  const organization = assets.organization;
  const location = assets.location;

  const totalAssets = (assets.total_assets_count ?? (
    phones.length + bankAccounts.length + vehicles.length + (organization ? 1 : 0) + (location ? 1 : 0)
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Linked Assets & Identifiers</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {totalAssets} Indexed
          </span>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          Official assets, financial instruments, and registered telecom indicators.
        </p>
      </div>

      {totalAssets === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
          No external assets (phones, vehicles, bank accounts) registered for this person record.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Registered Phones */}
          {phones.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={14} className="text-emerald-600" />
                Registered Telecom Identifiers ({phones.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {phones.map((ph, idx) => (
                  <div key={`${ph.phone_id}-${idx}`} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                      <Phone size={15} />
                    </div>
                    <div className="text-xs space-y-0.5 overflow-hidden">
                      <div className="font-mono font-bold text-slate-900 text-sm">{ph.phone_number}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{ph.phone_id} • {ph.phone_type}</div>
                      <div className="text-[10px] text-slate-400">{ph.carrier}</div>
                      {ph.is_primary && (
                        <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                          Primary Device
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Accounts */}
          {bankAccounts.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-blue-600" />
                Financial & Banking Instruments ({bankAccounts.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bankAccounts.map((ba, idx) => (
                  <div key={`${ba.bank_account_id}-${idx}`} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                      <CreditCard size={15} />
                    </div>
                    <div className="text-xs space-y-0.5 overflow-hidden">
                      <div className="font-mono font-bold text-slate-900 truncate text-sm">
                        •••• {ba.account_number.slice(-4) || ba.account_number}
                      </div>
                      <div className="text-slate-700 font-medium truncate">{ba.bank_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{ba.bank_account_id} • {ba.account_type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicles */}
          {vehicles.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Car size={14} className="text-amber-600" />
                Registered Transport & Vehicles ({vehicles.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vehicles.map((v, idx) => (
                  <div key={`${v.vehicle_id}-${idx}`} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-start gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 mt-0.5">
                      <Car size={15} />
                    </div>
                    <div className="text-xs space-y-0.5 overflow-hidden">
                      <div className="font-mono font-bold text-slate-900 text-sm">{v.registration_number}</div>
                      <div className="text-slate-700 font-medium">{v.color} {v.model}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{v.vehicle_id} • {v.vehicle_type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organization & Location */}
          {(organization || location) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {organization && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} className="text-indigo-600" />
                    Commercial Affiliation
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                      <Building2 size={16} />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">{organization.organization_name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{organization.organization_id} • {organization.organization_type}</div>
                    </div>
                  </div>
                </div>
              )}

              {location && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-600" />
                    Primary Registered Location
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-start gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0 mt-0.5">
                      <MapPin size={16} />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">{location.location_name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{location.location_id} • {location.location_type}</div>
                      <div className="text-slate-600">
                        {location.city ? `${location.city}, ` : ''}{location.district}, {location.state}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
