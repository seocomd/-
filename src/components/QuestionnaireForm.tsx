import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  User,
  Phone,
  Mail,
  Zap,
  Activity,
  Maximize,
  Truck,
  Settings,
  Plus,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

interface QuestionnaireFormProps {
  slug: string;
  onComplete?: () => void;
}

const Input = ({ label, type = 'text', placeholder = '', value, onChange }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 leading-none">{label}</label>}
    <input 
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all placeholder:text-slate-300"
    />
  </div>
);

const Checkbox = ({ label, checked, onChange, name }: any) => (
  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-brand-blue/30 transition-all group">
    <div 
      className={cn(
        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
        checked ? 'bg-brand-blue border-brand-blue' : 'border-slate-200 bg-white group-hover:border-slate-300'
      )}
      onClick={() => onChange({ target: { checked: !checked, name: name } } as any)}
    >
      {checked && <ClipboardCheck className="w-3.5 h-3.5 text-white" />}
    </div>
    <span className="text-sm font-bold text-slate-600 select-none leading-tight">{label}</span>
  </label>
);

const RadioGroup = ({ label, options, value, onChange }: any) => (
  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
    <label className="block text-sm font-black text-doc-slate-600 mb-4 uppercase tracking-tighter">{label}</label>
    <div className="space-y-3">
      {options.map((opt: any) => (
        <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
          <div 
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
              value === opt.value ? 'border-brand-blue' : 'border-slate-200 group-hover:border-slate-300'
            )}
            onClick={() => onChange(opt.value)}
          >
            {value === opt.value && <div className="w-2.5 h-2.5 bg-brand-blue rounded-full" />}
          </div>
          <span className="text-sm text-slate-600 font-bold">{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const Textarea = ({ label, value, onChange, placeholder = "" }: any) => (
  <div className="space-y-2">
    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</label>
    <textarea 
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-blue/5 min-h-[140px] transition-all leading-relaxed"
    />
  </div>
);

export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ slug, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    inn: '',
    activity: '',
    activityOther: '',
    region: '',
    powerKw: '',
    powerKva: '',
    voltage: '400',
    mode: 'reserve',
    avr: 'on_site',
    locationType: '',
    equipmentTypes: '',
    climate: '',
    hasVariableLoad: false,
    hasDirectStart: false,
    hasWelding: false,
    hasPhaseImbalance: false,
    loadMaxKw: '',
    loadMaxKva: '',
    loadMinKw: '',
    loadMinKva: '',
    startCurrentAmps: '',
    executionType: 'container',
    containerControl: 'auto',
    mobileType: 'none',
    parallelWork: 'none',
    options: {
      electricHeater: false,
      preheater: false,
      batteryCharger: false,
      energyMeter: false,
      fuelTank: 'none',
      fuelTankOther: '',
      zip: 'none',
    },
    otherWishes: '',
    deliveryQuantity: '1',
    deliveryMethod: 'company_delivery',
    deliveryTransport: 'car',
    additionalServices: {
      pnr: false,
      supervision: false,
      oneTimeTo: false,
      serviceContract: false,
      training: false,
      leasing: false,
    }
  });

  useEffect(() => {
    fetch(`/api/questionnaires/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Опросный лист не найден');
        return res.json();
      })
      .then(data => {
        setQuestionnaire(data);
        if (data.data && Object.keys(data.data).length > 0) {
          setFormData({ ...formData, ...data.data });
        }
        if (data.status === 'completed') {
          setSuccess(true);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/questionnaires/${questionnaire.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questionnaire,
          data: formData,
          status: 'completed'
        })
      });
      if (!res.ok) throw new Error('Ошибка при сохранении');
      setSuccess(true);
      if (onComplete) onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !questionnaire) {
    return <div className="p-8 text-center">Загрузка опросного листа...</div>;
  }

  if (error && !questionnaire) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center py-20">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Спасибо!</h1>
        <p className="text-slate-600 mb-8">Ваш опросный лист успешно отправлен. Наш менеджер свяжется с Вами в ближайшее время.</p>
        
        <div className="flex flex-col gap-4 mb-8">
           <button 
             onClick={() => setSuccess(false)}
             className="text-brand-blue font-bold text-sm hover:underline"
           >
             Редактировать ответы
           </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left">
          <p className="text-sm font-medium text-slate-500 mb-1">Менеджер:</p>
          <p className="font-bold">{questionnaire.managerName}</p>
          {questionnaire.phone && <p className="text-sm">{questionnaire.phone}</p>}
          {questionnaire.email && <p className="text-sm">{questionnaire.email}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-brand-blue p-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Опросный лист</h1>
              <p className="text-blue-100 opacity-90">на проектирование и изготовление дизельной электростанции (ДЭС)</p>
            </div>
            <img src="/public/container.svg" alt="Diesel" className="w-24 h-24 hidden md:block opacity-20 filter invert grayscale" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Building2 className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider">Организация</span>
              </div>
              <p className="font-bold">{questionnaire.companyName}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <User className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider">Контактное лицо</span>
              </div>
              <p className="font-bold">{questionnaire.contactPerson}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Section 0: Company Details */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Info className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Информация об организации</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Input 
                label="ИНН организации" 
                value={formData.inn} 
                onChange={(e: any) => setFormData({...formData, inn: e.target.value})} 
                placeholder="12 знаков"
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 leading-none">Вид деятельности</label>
                <select 
                  value={formData.activity}
                  onChange={(e) => setFormData({...formData, activity: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                >
                  <option value="">Выберите из списка...</option>
                  <option value="agro">Агропромышленный комплекс</option>
                  <option value="zhkh">Жилищно-коммунального хозяйства (ЖКХ)</option>
                  <option value="industry">Промышленность</option>
                  <option value="construction">Строительство</option>
                  <option value="energy">Энергетика</option>
                  <option value="other">Другое</option>
                </select>
                {formData.activity === 'other' && (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                    <Input 
                      placeholder="Укажите Ваш вид деятельности" 
                      value={formData.activityOther}
                      onChange={(e: any) => setFormData({...formData, activityOther: e.target.value})}
                    />
                  </div>
                )}
              </div>
              <Input 
                label="Регион" 
                value={formData.region} 
                onChange={(e: any) => setFormData({...formData, region: e.target.value})} 
                placeholder="Напр: Ярославская обл."
              />
              <Input 
                label="Телефон" 
                value={formData.phone || questionnaire.phone} 
                onChange={(e: any) => setFormData({...formData, phone: e.target.value})} 
              />
              <Input 
                label="Электронная почта" 
                value={formData.email || questionnaire.email} 
                onChange={(e: any) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </section>

          {/* Section 1: Main Specs */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Zap className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">1. Основные характеристики ДЭС</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Мощность кВт" 
                  value={formData.powerKw} 
                  onChange={(e: any) => setFormData({...formData, powerKw: e.target.value})} 
                />
                <Input 
                  label="Мощность кВА" 
                  value={formData.powerKva} 
                  onChange={(e: any) => setFormData({...formData, powerKva: e.target.value})} 
                />
              </div>
            <RadioGroup 
              label="Номинальное напряжение"
              value={formData.voltage}
              onChange={(val: string) => setFormData({...formData, voltage: val})}
              options={[
                { value: '400', label: '400 В (3 фазы)' },
                { value: '230', label: '230 В (1 фаза)' }
              ]}
            />
            </div>
          </section>

          {/* Section 2: Work Mode */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Activity className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">2. Режим работы и АВР</h2>
            </div>
            <RadioGroup 
              label="Назначение ДЭС"
              value={formData.mode}
              onChange={(val: string) => setFormData({...formData, mode: val})}
              options={[
                { value: 'main', label: 'Основной источник электроэнергии' },
                { value: 'reserve', label: 'Резервный источник электроэнергии' }
              ]}
            />

            <RadioGroup 
              label="Необходимость АВР (Автозапуск)"
              value={formData.avr}
              onChange={(val: string) => setFormData({...formData, avr: val})}
              options={[
                { value: 'on_site', label: 'На объекте имеется собственный АВР' },
                { value: 'external', label: 'Поставить АВР в отдельном шкафу' },
                { value: 'combined', label: 'Поставить АВР, совмещенный с системой управления (до 100 кВт)' },
                { value: 'in_container', label: 'Установить АВР внутри блок-контейнера' }
              ]}
            />
          </section>

          {/* Section 3: Exploitation */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Maximize className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">3. Особенности эксплуатации</h2>
            </div>
            <div className="space-y-4">
              <Input 
                label="Местонахождение и тип объекта" 
                value={formData.locationType} 
                onChange={(e: any) => setFormData({...formData, locationType: e.target.value})} 
                placeholder="Где будет работать станция?"
              />
              <Input 
                label="Основные типы оборудования потребителей" 
                value={formData.equipmentTypes} 
                onChange={(e: any) => setFormData({...formData, equipmentTypes: e.target.value})} 
              />
              <Input 
                label="Климатические особенности" 
                value={formData.climate} 
                onChange={(e: any) => setFormData({...formData, climate: e.target.value})} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Checkbox 
                  label="Резко-переменная нагрузка (>25%)" 
                  checked={formData.hasVariableLoad} 
                  onChange={(e: any) => setFormData({...formData, hasVariableLoad: e.target.checked})} 
                />
                <Checkbox 
                  label="Прямой пуск мощных двигателей" 
                  checked={formData.hasDirectStart} 
                  onChange={(e: any) => setFormData({...formData, hasDirectStart: e.target.checked})} 
                />
                <Checkbox 
                  label="Сварочные аппараты / выпрямители" 
                  checked={formData.hasWelding} 
                  onChange={(e: any) => setFormData({...formData, hasWelding: e.target.checked})} 
                />
                <Checkbox 
                  label="Неравномерная нагрузка (перекос фаз)" 
                  checked={formData.hasPhaseImbalance} 
                  onChange={(e: any) => setFormData({...formData, hasPhaseImbalance: e.target.checked})} 
                />
              </div>
            </div>
          </section>

          {/* Section 4: Load Params */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Activity className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">4. Параметры нагрузки</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Макс. мощность кВт" value={formData.loadMaxKw} onChange={(e: any) => setFormData({...formData, loadMaxKw: e.target.value})} />
                <Input label="Макс. мощность кВА" value={formData.loadMaxKva} onChange={(e: any) => setFormData({...formData, loadMaxKva: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Мин. мощность кВт" value={formData.loadMinKw} onChange={(e: any) => setFormData({...formData, loadMinKw: e.target.value})} />
                <Input label="Мин. мощность кВА" value={formData.loadMinKva} onChange={(e: any) => setFormData({...formData, loadMinKva: e.target.value})} />
              </div>
              <Input label="Максимальный пусковой ток (А)" value={formData.startCurrentAmps} onChange={(e: any) => setFormData({...formData, startCurrentAmps: e.target.value})} />
            </div>
          </section>

          {/* Section 5: Execution */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Settings className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">5-6. Исполнение и Параллель</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <RadioGroup 
                  label="Тип исполнения"
                  name="execution"
                  value={formData.executionType}
                  onChange={(val: string) => setFormData({...formData, executionType: val})}
                  options={[
                    { value: 'open', label: 'Открытое (на раме)' },
                    { value: 'enclosure', label: 'В защитном кожухе' },
                    { value: 'container', label: 'В утепленном блок-контейнере' }
                  ]}
                />
                
                {formData.executionType === 'container' && (
                  <div className="ml-6 animate-in slide-in-from-left-2 duration-300">
                    <RadioGroup 
                      label="Управление контейнером"
                      name="containerControl"
                      value={formData.containerControl}
                      onChange={(val: string) => setFormData({...formData, containerControl: val})}
                      options={[
                        { value: 'manual', label: 'Ручное управление' },
                        { value: 'auto', label: 'Автоматическое управление' }
                      ]}
                    />
                  </div>
                )}
              </div>

              <div>
                <RadioGroup 
                  label="Работа в параллели"
                  name="parallel"
                  value={formData.parallelWork}
                  onChange={(val: string) => setFormData({...formData, parallelWork: val})}
                  options={[
                    { value: 'none', label: 'Не требуется' },
                    { value: 'possible', label: 'Предусмотреть возможность' },
                    { value: 'complex', label: 'Формирование энергокомплекса' }
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Section 7: Options */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Plus className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">7. Дополнительные опции</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="space-y-2">
                <Checkbox label="Электрический подогрев двигателя" checked={formData.options.electricHeater} onChange={(e: any) => setFormData({...formData, options: {...formData.options, electricHeater: e.target.checked}})} />
                <Checkbox label="Автономный подогреватель (Webasto)" checked={formData.options.preheater} onChange={(e: any) => setFormData({...formData, options: {...formData.options, preheater: e.target.checked}})} />
                <Checkbox label="Зарядка АКБ от сети" checked={formData.options.batteryCharger} onChange={(e: any) => setFormData({...formData, options: {...formData.options, batteryCharger: e.target.checked}})} />
                <Checkbox label="Учет выработки электроэнергии" checked={formData.options.energyMeter} onChange={(e: any) => setFormData({...formData, options: {...formData.options, energyMeter: e.target.checked}})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Бак</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm mb-4"
                  value={formData.options.fuelTank}
                  onChange={(e) => setFormData({...formData, options: {...formData.options, fuelTank: e.target.value}})}
                >
                  <option value="none">Стандартный</option>
                  <option value="500">500 л</option>
                  <option value="1000">1000 л</option>
                  <option value="other">Другой объем</option>
                </select>
                {formData.options.fuelTank === 'other' && (
                  <Input placeholder="Укажите объем" value={formData.options.fuelTankOther} onChange={(e: any) => setFormData({...formData, options: {...formData.options, fuelTankOther: e.target.value}})} />
                )}
              </div>
            </div>
            <RadioGroup 
              label="Комплект ЗИП"
              value={formData.options.zip}
              onChange={(val: string) => setFormData({...formData, options: {...formData.options, zip: val}})}
              options={[
                { value: 'none', label: 'Нет' },
                { value: '500', label: '500 м/ч' },
                { value: '1000', label: '1000 м/ч' },
                { value: '2000', label: '2000 м/ч' },
                { value: '3000', label: '3000 м/ч' },
                { value: '5000', label: '5000 м/ч' }
              ]}
            />
          </section>

          {/* Section 8: Delivery */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Truck className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">8. Условия поставки</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Количество единиц (шт)" type="number" value={formData.deliveryQuantity} onChange={(e: any) => setFormData({...formData, deliveryQuantity: e.target.value})} />
              <div className="space-y-4">
                <RadioGroup 
                  label="Способ доставки"
                  value={formData.deliveryMethod}
                  onChange={(val: string) => setFormData({...formData, deliveryMethod: val})}
                  options={[
                    { value: 'pickup', label: 'Самовывоз' },
                    { value: 'company_delivery', label: 'Доставка Компанией Дизель' }
                  ]}
                />
                {formData.deliveryMethod === 'company_delivery' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <Input 
                      label="Город доставки"
                      placeholder="Укажите город..."
                      value={formData.deliveryCity}
                      onChange={(e: any) => setFormData({...formData, deliveryCity: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 9: Services */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Send className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">9. Дополнительные услуги</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Checkbox label="Пусконаладка" checked={formData.additionalServices.pnr} onChange={(e: any) => setFormData({...formData, additionalServices: {...formData.additionalServices, pnr: e.target.checked}})} />
              <Checkbox label="Шеф-монтаж" checked={formData.additionalServices.supervision} onChange={(e: any) => setFormData({...formData, additionalServices: {...formData.additionalServices, supervision: e.target.checked}})} />
              <Checkbox label="Разовое ТО" checked={formData.additionalServices.oneTimeTo} onChange={(e: any) => setFormData({...formData, additionalServices: {...formData.additionalServices, oneTimeTo: e.target.checked}})} />
              <Checkbox label="Сервисный контракт" checked={formData.additionalServices.serviceContract} onChange={(e: any) => setFormData({...formData, additionalServices: {...formData.additionalServices, serviceContract: e.target.checked}})} />
              <Checkbox label="Инструктаж" checked={formData.additionalServices.training} onChange={(e: any) => setFormData({...formData, additionalServices: {...formData.additionalServices, training: e.target.checked}})} />
              <Checkbox label="Лизинг" checked={formData.additionalServices.leasing} onChange={(e: any) => setFormData({...formData, additionalServices: {...formData.additionalServices, leasing: e.target.checked}})} />
            </div>
          </section>

          {/* Section 10: Wishes */}
          <section>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
              <Plus className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">10. Другие пожелания</h2>
            </div>
            <Textarea 
              label="Дополнительные требования или комментарии"
              value={formData.otherWishes}
              onChange={(e: any) => setFormData({...formData, otherWishes: e.target.value})}
              placeholder="Напишите здесь любые дополнительные требования к ДЭС..."
            />
          </section>

          <footer className="pt-8 border-t border-slate-100 flex flex-col items-center">
            <button 
              type="submit"
              disabled={loading}
              className={cn(
                "w-full max-w-sm bg-brand-blue text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? "Сохранение..." : (
                <>
                  <Send className="w-6 h-6" />
                  Отправить анкету
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 max-w-md">
              Нажимая на кнопку, Вы соглашаетесь на обработку персональных данных и передачу информации специалистам ООО "Компания Дизель".
            </p>
          </footer>
        </form>
      </div>
    </div>
  );
};
