import React from 'react';
import { CheckCircle2, TrendingUp, Award, Activity, Users, MapPin, ShieldCheck, Globe } from 'lucide-react';

export const AboutCompany = () => {
  return (
    <div className="space-y-12 pt-12 border-t-2 border-brand-blue-op20">
      {/* Section 1: Leadership */}
      <div className="space-y-6 page-break-avoid">
        <h2 className="text-xl font-black text-brand-blue uppercase border-l-4 border-brand-blue pl-4">Лидирующий производитель ДЭС в России</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-doc-slate-50 p-6 rounded border border-doc-slate-100 flex flex-col gap-2">
            <Award className="w-8 h-8 text-brand-blue mb-2" />
            <p className="text-[12px] font-bold text-doc-slate-800 leading-tight">Каждая четвертая ДЭС российского производства выходит с завода компании Дизель</p>
          </div>
          <div className="bg-doc-slate-50 p-6 rounded border border-doc-slate-100 flex flex-col gap-2">
            <TrendingUp className="w-8 h-8 text-brand-blue mb-2" />
            <p className="text-[12px] font-bold text-doc-slate-800 leading-tight">С 2014 года занимает первое место по объёму поставленных ДЭС на объекты нефтегазового комплекса</p>
          </div>
          <div className="bg-doc-slate-50 p-6 rounded border border-doc-slate-100 flex flex-col gap-2">
            <Activity className="w-8 h-8 text-brand-blue mb-2" />
            <p className="text-[12px] font-bold text-doc-slate-800 leading-tight">7,03% среди всех эксплуатируемых ДЭС в России произведены на заводе компании Дизель</p>
          </div>
        </div>
      </div>

      {/* Section 2: Stats */}
      <div className="page-break-avoid bg-brand-blue text-white p-10 rounded-sm grid grid-cols-3 gap-8 shadow-brand-blue">
        <div className="text-center">
          <p className="text-3xl font-black mb-1">&gt; 20 260</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white-op80 leading-tight">Дизельных электростанций произведено и поставлено</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black mb-1">2 400 МВт</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white-op80 leading-tight">Суммарная электрическая мощность</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black mb-1">&gt; 64 млн ч</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white-op80 leading-tight">Суммарно отработали у наших клиентов</p>
        </div>
      </div>

      {/* Section 3: Modern Production */}
      <div className="page-break-avoid flex flex-row gap-4 md:gap-12 items-center">
        <div className="flex-1 space-y-4 min-w-0">
          <h2 className="text-xl font-black text-brand-blue uppercase leading-tight">Российский производитель европейского уровня</h2>
          <p className="text-[12px] text-doc-slate-600 leading-relaxed">
            Завод оборудован ультрасовременным оборудованием: компьютеризированные станки лазерной резки и гибки металла фирмы Warcom (Италия), 
            высокоточные кондукторы для сборки металлоизделий, двойная окрасочно-сушильная камера.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <p className="text-[14px] font-black text-brand-blue">215 специалистов</p>
              <p className="text-[10px] text-doc-slate-500 uppercase font-bold">Высочайшего класса</p>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 min-w-0">
          <div className="bg-doc-slate-50 p-8 border-r-4 border-brand-blue text-right">
            <h3 className="text-lg font-black text-brand-blue uppercase mb-2">Завод в г. Тутаев</h3>
            <p className="text-[11px] text-doc-slate-600 italic">Площадь 14 000 м², 30 км от Ярославля</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white border border-doc-slate-100 rounded">
              <p className="text-2xl font-black text-brand-blue">900</p>
              <p className="text-[9px] font-bold uppercase text-doc-slate-500-op60">блок-контейнеров / год</p>
            </div>
            <div className="text-center p-4 bg-white border border-doc-slate-100 rounded">
              <p className="text-2xl font-black text-brand-blue">1800</p>
              <p className="text-[9px] font-bold uppercase text-doc-slate-500-op60">дизель-генераторов / год</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Customers & Reach */}
      <div className="page-break-avoid space-y-6">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-brand-blue" />
              <h2 className="text-lg font-black text-brand-blue uppercase">Нам доверяют более 1700 клиентов</h2>
            </div>
            <p className="text-[11px] text-doc-slate-600 leading-relaxed text-justify">
              Дизельные электростанции производства Компании Дизель сегодня работают практически в каждом регионе России — от Москвы до Сочи, 
              от Калининграда до Владивостока — везде без устали трудятся наши дизельные электростанции. А также на Крайнем Севере, 
              в условиях вечной мерзлоты, в заболоченной местности и пустынях.
            </p>
            <div className="flex gap-2 items-center bg-accent-light p-4 rounded-sm">
              <Globe className="w-5 h-5 text-brand-blue" />
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-tight">Поставки в Казахстан, Туркменистан, Беларусь, Армению, Азербайджан и Сербию</p>
            </div>
          </div>
          <div className="w-full md:w-[350px] bg-white p-2 rounded border border-doc-slate-100 shadow-sm overflow-hidden">
            <img 
              src="/input_file_1.png" 
              alt="Карта расположения" 
              className="w-full h-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <p className="text-[8px] text-center text-doc-slate-400 mt-2 font-bold uppercase tracking-widest">География поставок и присутствия</p>
          </div>
        </div>
      </div>

      {/* Section 5: Advantages */}
      <div className="page-break-avoid flex flex-row gap-4 md:gap-8">
        <div className="flex-1 space-y-4 min-w-0">
          <h3 className="text-sm font-black text-brand-blue uppercase tracking-wider mb-4">Преимущества Компании Дизель</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-doc-slate-700">Собственный инжиниринг — свыше 20 инженеров-конструкторов</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-doc-slate-700">Отлаженная 5-ступенчатая система контроля качества</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-doc-slate-700">Огромный опыт реализации проектов любой сложности</p>
            </li>
          </ul>
        </div>
        <div className="flex-1 space-y-4 min-w-0">
          <h3 className="text-sm font-black text-brand-blue uppercase tracking-wider mb-4">Сервисная поддержка</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-doc-slate-700">Пуско-наладка и сервисное сопровождение 24/7</p>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-doc-slate-700">Оперативная поставка оригинальных запчастей</p>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-doc-slate-700">Online-консультирование по вопросам эксплуатации</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
