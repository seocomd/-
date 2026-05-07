import React from 'react';
import { ModelSpec } from '../data/specs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface ComparisonProps {
  station1: ModelSpec;
  station2: ModelSpec | null;
  station3: ModelSpec | null;
}

export const Comparison = ({ station1, station2, station3 }: ComparisonProps) => {
  const powerData = [
    { 
      name: 'Мощность (кВт)', 
      st1: station1.nominalPowerKw, 
      st2: station2?.nominalPowerKw || 0,
      st3: station3?.nominalPowerKw || 0 
    },
  ];

  const consumptionData = [
    { name: '100% (л/ч)', st1: station1.fuelCons100, st2: station2?.fuelCons100 || 0, st3: station3?.fuelCons100 || 0 },
    { name: '75% (л/ч)', st1: station1.fuelCons75, st2: station2?.fuelCons75 || 0, st3: station3?.fuelCons75 || 0 },
    { name: '50% (л/ч)', st1: station1.fuelCons50, st2: station2?.fuelCons50 || 0, st3: station3?.fuelCons50 || 0 },
  ];

  const weightData = [
    { 
      name: 'Вес откр. (кг)', 
      st1: parseInt(station1.weightOpen) || 0, 
      st2: station2 ? (parseInt(station2.weightOpen) || 0) : 0,
      st3: station3 ? (parseInt(station3.weightOpen) || 0) : 0
    },
  ];

  return (
    <div className="space-y-10 py-10 page-break-avoid">
       <div className="relative h-12 w-full mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00296B] to-[#002F87] rounded-sm z-10">
          <div className="h-full flex items-center px-8 justify-between relative z-20">
            <span className="text-white text-[11px] font-black uppercase tracking-[0.4em]">Сравнительная характеристика выбранных ДЭС</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Power Comparison Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-brand-blue-op10 pb-2">
            <div className="w-2 h-2 bg-brand-blue rounded-full" />
            <h3 className="text-[11px] font-black text-brand-blue uppercase tracking-wider italic">Мощность и Весовые параметры</h3>
          </div>
          <div className="h-64 bg-doc-slate-50-op50 p-6 rounded-xl border border-doc-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...powerData, ...weightData]} layout="vertical" margin={{ left: 20, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 9, fontBold: true, fill: '#64748b' }} 
                  width={90} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Legend iconType="rect" iconSize={10} wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '15px' }} />
                <Bar dataKey="st1" name={station1.name} fill="#002F87" radius={[0, 4, 4, 0]} barSize={station3 ? 12 : 20} />
                {station2 && <Bar dataKey="st2" name={station2.name} fill="#104FBF" radius={[0, 4, 4, 0]} barSize={station3 ? 12 : 20} />}
                {station3 && <Bar dataKey="st3" name={station3.name} fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Comparison Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-brand-blue-op10 pb-2">
            <div className="w-2 h-2 bg-brand-blue rounded-full" />
            <h3 className="text-[11px] font-black text-brand-blue uppercase tracking-wider italic">Расход дизельного топлива (л/ч)</h3>
          </div>
          <div className="h-64 bg-doc-slate-50-op50 p-6 rounded-xl border border-doc-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData} margin={{ top: 10, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fontBold: true, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 9, fontWeight: 'medium' }} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{fill: '#f1f5f9'}}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Legend iconType="rect" iconSize={10} wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '15px' }} />
                <Bar dataKey="st1" name={station1.name} fill="#002F87" radius={[4, 4, 0, 0]} barSize={station3 ? 20 : 32} />
                {station2 && <Bar dataKey="st2" name={station2.name} fill="#104FBF" radius={[4, 4, 0, 0]} barSize={station3 ? 20 : 32} />}
                {station3 && <Bar dataKey="st3" name={station3.name} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Numerical Table Comparison */}
      <div className="overflow-hidden rounded-sm border border-doc-slate-200 shadow-sm">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-doc-slate-50 border-b-2 border-brand-blue">
              <th className="p-4 text-left text-doc-slate-400 font-bold uppercase tracking-widest text-[8px]">Техническая спецификация</th>
              <th className="p-4 text-center bg-brand-blue/5 text-brand-blue font-bold uppercase text-[9px] tracking-wider italic">{station1.name}</th>
              {station2 && <th className="p-4 text-center bg-brand-blue/10 text-brand-blue-dark font-bold uppercase text-[9px] tracking-wider italic">{station2.name}</th>}
              {station3 && <th className="p-4 text-center bg-brand-blue/15 text-brand-blue font-bold uppercase text-[9px] tracking-wider italic">{station3.name}</th>}
            </tr>
          </thead>
          <tbody className="font-semibold text-doc-slate-700">
            <CompRow label="Марка двигателя" v1={station1.engineModel} v2={station2?.engineModel} v3={station3?.engineModel} />
            <CompRow label="Марка генератора" v1={station1.generatorModel} v2={station2?.generatorModel} v3={station3?.generatorModel} />
            <CompRow label="Расход при 75%" v1={`${station1.fuelCons75} л/ч`} v2={station2 ? `${station2.fuelCons75} л/ч` : null} v3={station3 ? `${station3.fuelCons75} л/ч` : null} />
            <CompRow label="Масса (откр. исп.)" v1={`${station1.weightOpen} кг`} v2={station2 ? `${station2.weightOpen} кг` : null} v3={station3 ? `${station3.weightOpen} кг` : null} />
            <CompRow label="Бак ДЭС" v1={`${station1.fuelTankL} л`} v2={station2 ? `${station2.fuelTankL} л` : null} v3={station3 ? `${station3.fuelTankL} л` : null} />
            <CompRow 
              label="Удельный вес (кг/кВт)" 
              v1={station1.nominalPowerKw > 0 ? (parseInt(station1.weightOpen || '0') / station1.nominalPowerKw).toFixed(1) : '—'} 
              v2={station2 && station2.nominalPowerKw > 0 ? (parseInt(station2.weightOpen || '0') / station2.nominalPowerKw).toFixed(1) : (station2 ? '—' : null)}
              v3={station3 && station3.nominalPowerKw > 0 ? (parseInt(station3.weightOpen || '0') / station3.nominalPowerKw).toFixed(1) : (station3 ? '—' : null)}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CompRow = ({ label, v1, v2, v3 }: { label: string, v1: any, v2?: any, v3?: any }) => (
  <tr className="border-b border-doc-slate-100 hover:bg-doc-blue-50 transition-colors group">
    <td className="p-3.5 text-doc-slate-400 uppercase font-bold text-[8px] tracking-wider group-hover:text-brand-blue">{label}</td>
    <td className="p-3.5 text-center border-l border-doc-slate-100 font-bold text-brand-blue">{v1}</td>
    {v2 !== undefined && <td className="p-3.5 text-center border-l border-doc-slate-100 font-bold text-brand-blue-dark">{v2 || '—'}</td>}
    {v3 !== undefined && <td className="p-3.5 text-center border-l border-doc-slate-100 font-bold text-blue-600">{v3 || '—'}</td>}
  </tr>
);
