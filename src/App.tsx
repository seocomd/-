import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Settings, 
  FileText, 
  Download, 
  Printer, 
  Zap, 
  Activity, 
  Gauge, 
  Droplets, 
  Wind, 
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Save,
  Share2,
  Eye,
  Calendar,
  History,
  Plus,
  ArrowLeft,
  ArrowRight,
  LogOut,
  LogIn,
  Layers,
  ClipboardCheck,
  Image as ImageIcon,
  Copy,
  Info,
  Trash2,
  MapPin,
  ShieldCheck,
  Globe,
  Maximize,
  Minus,
  ChevronUp,
  ChevronDown,
  Edit,
  Users,
  Star,
  X
} from 'lucide-react';
import { specsData, Manufacturer, ModelSpec } from './data/specs';
import { STATION_IMAGES } from './data/modelImages';
import { cn } from './lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import html2pdf from 'html2pdf.js';
import { AboutCompany } from './components/AboutCompany';
import { Comparison } from './components/Comparison';
import { InteractiveContainer } from './components/InteractiveContainer';

// --- Types ---
const translit = (text: string) => {
  const map: any = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', '_': '-', '.': '-', ',': '-'
  };
  return text.toLowerCase().split('').map(char => map[char] || char).join('').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const formatNumber = (num: number | string) => {
  if (num === null || num === undefined || num === '') return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return n.toLocaleString('ru-RU');
};

interface Block {
  id: string;
  type: 'header' | 'client-info' | 'manager' | 'message' | 'specs' | 'comparison' | 'costs' | 'control-panel' | 'about' | 'purpose' | 'contacts' | 'footer' | 'interactive-container' | 'reserve-input';
  isVisible: boolean;
  config?: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl: string;
  role?: 'admin' | 'manager';
  password?: string;
  proposalCount?: number;
  totalViews?: number;
}
interface ManagerInfo {
  id?: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  role?: 'admin' | 'manager';
  password?: string;
  proposalCount?: number;
  totalViews?: number;
}

interface ProposalItem {
  manufacturerId: string;
  modelName: string;
  variant: string;
  automationType?: 'manual' | 'auto'; // for container/sever
  mobileType?: string; // for mobile
  price?: number;
  recommended?: boolean;
}

interface AdditionalOption {
  id: string;
  name: string;
  price: number;
  isIncluded: boolean;
  subValue?: string; // for things like 500L, 1000m/h etc
}

interface DeliveryInfo {
  type: 'pickup' | 'delivery';
  transportType?: 'auto' | 'rail';
  address: string;
  price: number;
  isIncluded: boolean;
}

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  isIncluded: boolean;
}

interface ProposalData {
  id?: string;
  slug?: string;
  clientName: string;
  clientPersonName?: string;
  validUntil?: string;
  coverLetter?: string;
  modeOfOperation: 'main' | 'reserve';
  avrOption?: string;
  parallelWorkType: 'none' | 'possible' | 'complex';
  additionalOptions?: AdditionalOption[];
  services?: AdditionalService[];
  deliveryInfo?: DeliveryInfo;
  managerId: string;
  items: ProposalItem[];
  blocks: Block[];
  fuelPrice: number;
  toRate: number;
  showCompanyInfo: boolean;
  usePurpose: boolean;
  useControlPanel: boolean;
  purposeType: string;
  createdAt: any;
  viewCount: number;
  lastViewedAt: any;
  firstViewedAt: any;
}

interface QuestionnaireData {
  id?: string;
  slug?: string;
  managerId: string;
  managerName?: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
  data: any;
}

// --- Components ---

// --- Constants ---

const PURPOSES = {
  agro: {
    label: 'Агропромышленный комплекс',
    text: `Производственная Компания Дизель предлагает предприятиям агропромышленного комплекса приобрести дизельные агрегаты, генераторы и дизельные электростанции (АД, ДГУ, ДЭС) для обеспечения должного уровня энергобезопасности на объектах различного назначения. Все аграрные предприятия от небольших фермерских хозяйств до масштабных комбинатов в равной степени нуждаются в защите от аварийных, приводящих к убыткам инцидентов, связанных с перебоями в подаче электроэнергии.
Дизельные электростанции и другие типы резервного электрооборудования для агропромышленного комплекса.

Предприятия аграрного сектора зачастую находятся вдали от надежных централизованных источников электропитания – в этом состоит их производственная специфика.

Для многих населенных пунктов в сельской местности мелкие аварии в электроснабжении – повседневное явление. Разумеется, в таких районах можно и даже необходимо развивать аграрный сектор, обезопасив производство от энергетических форсмажоров. Для этих целей «Компания Дизель» выпускает серийное электрооборудование и разрабатывает модели с индивидуальными техническими характеристиками, если заказчик в таковых нуждается.`
  },
  zhkh: {
    label: 'Жилищно-коммунального хозяйства (ЖКХ)',
    text: `Производственная «Компания Дизель» предлагает предприятиям ЖКХ приобрести дизельные агрегаты, электростанции и дизель-генераторы (ДЭС, АД, ДГУ) для проведения работ с использованием автономных источников энергии. Уборка улиц, благоустройство придомовых территорий, ремонтные работы и другие мероприятия, типичные для жилищно-коммунального хозяйства, зачастую проводятся вдали от централизованных источников электроэнергии.
«Компания Дизель» – надежные дизельные электростанции для нужд ЖКХ.

Оборудование со стандартными характеристиками выпускается в рамках серийного производства. Возможен выпуск электрооборудования с индивидуальными параметрами мощности и функциональности по проектам заказчика.

От дизель-генератора могут получать электроэнергию осветительные приборы, используемые во время уборки или благоустройства улиц. Электроэнергия для бытовок и работы ремонтного оборудования также может подаваться от дизельного генератора. Чем надежнее энергоснабжение и энергобезопасность на каждом отдельно взятом объекте ЖКХ, тем более комфортной будет жизнь в городе или населенном пункте.`
  },
  industry: {
    label: 'Промышленность',
    text: `Большинство, если не все без какого-либо исключения промышленные предприятия в России электрифицированы – от централизованной электрической сети работают станки и компьютеры, отопительные установки, лифты, не говоря уже об освещении, сигнализации и бытовых приборах. В такой ситуации перебои или полное отключение электричества становятся техногенной катастрофой для отдельного предприятия или бизнеса.
ДГУ - дизельные генераторы и экономичные электростанции для промышленных производств.

За 10 лет продуктивной и эффективной как производственной, так и коммерческой деятельности «Компания Дизель» наладила выпуск множества моделей электрооборудования, позволяющего сформировать на заводе полноценную систему резервного энергоснабжения. Продукция бренда «Компания Дизель» освоила отечественный рынок и нашла потребителей за рубежом.

На официальном сайте производителя вниманию потенциальных заказчиков представлен полный подробный каталог серийного производства. Кроме того, команда инженеров Компании Дизель принимает заказы на разработку оборудования с индивидуальными техническими характеристиками.

Пятиэтапная система контроля качества продукции позволяет предприятию гарантировать потребителю длительную бесперебойную эксплуатацию всех предлагаемых типов электрооборудования.`
  },
  construction: {
    label: 'Строительство',
    text: `Современная строительная площадка как производственный объект практически полностью зависит от электроэнергии. Производственная «Компания Дизель» предлагает застройщикам приобрести дизель-генераторы, дизельные электростанции и агрегаты (ДГУ, ДЭС, АД), чтобы создать полноценную систему энергобезопасности для строительства объектов различных масштабов.

От электроэнергии работают строительные краны, подъемники, бурильные установки, осветительное оборудование. Таким образом, перебои в подаче электричества на стройплощадку или полное приостановление энергоснабжения влечёт за собой срывы сроков, отражается на качестве строительства, в общем, приводит к прямым убыткам.
Дизельная электростанция для бесперебойного качественного строительства.

Производственная «Компания Дизель» - авторитетный производитель промышленного электрооборудования, известный на профильном рынке России, выпускает целый ряд моделей автономных источников электропитания для строительных площадок.

С техническими характеристиками серийных моделей можно ознакомиться немедленно в официальном электронном каталоге продукции. Для строительных площадок с индивидуальными параметрами энергопотребления наши специалисты готовы разработать оборудование эксклюзивно.

Российский потребитель во многом привык ориентироваться на зарубежные бренды и торговые марки. «Компания Дизель», успешно участвуя в программе импортозамещения, оправдывает доверие заказчиков и клиентов на внутреннем рынке. В процессе производства каждая единица предлагаемой продукции проходит пять этапов контроля качества.`
  },
  energy: {
    label: 'Энергетика',
    text: `Объекты энергетики, как и другие промышленные объекты, нуждаются в обеспечении энергетической безопасности. Отечественная производственная «Компания Дизель» выпускает и реализует на внутреннем и достаточно обширном внешнем рынке дизельные генераторы, электростанции и агрегаты (ДГУ, ДЭС, АД), предназначенные для обеспечения бесперебойной автономной работы объектов энергетики в аварийном или плановом режиме.

Турбины и другие специальные установки, перерабатывающие механическую энергию в электроток, работают также от электроэнергии. В комплекс объекта энергетики входят административные здания и хозяйственные помещения.
Дизельная электростанция для энергетики – все, что необходимо для бесперебойной эксплуатации объекта.

В форс-мажорной ситуации объект энергетики должен продолжить производственный цикл в автономном режиме. Для обеспечения бесперебойного длительного автономного функционирования объекты энергетики нуждаются в мощном резервном дизельном электрооборудовании.

Модельный ряд продукции Компании Дизель включает несколько десятков дизель- генераторов, предназначенных для длительного интенсивного использования на объектах энергетики. Подробные технические характеристики всех моделей оборудования, выпускаемых серийно, представлены в официальном электронном каталоге продукции.

Помимо серийного выпуска оборудования «Компания Дизель» занимается разработкой и изготовлением электростанций специального назначения.`
  }
};

const VARIANT_DESCRIPTIONS = {
  open: {
    title: 'ДЭС на раме (открытая)',
    items: [
      'Минимальные габариты и вес',
      'Низкая стоимость по сравнению с вариантными решениями',
      'Удобство обслуживания за счет свободного доступа ко всем узлам ДЭС',
      'Требуется наличие специально подготовленного помещения (вентиляция, выхлоп, обогрев)',
      'Подходит для установки внутри зданий или существующих контейнеров',
      'Экономия на вводе в эксплуатацию при готовой инфраструктуре'
    ]
  },
  enclosure: {
    title: 'ДЭС в погодозащитном кожухе',
    items: [
      'Защита ДЭС от осадков и неблагоприятных погодных условий',
      'Экономия на вводе в эксплуатацию, не требует монтажа, достаточно ровной твердой площадки',
      'Средний уровень защиты ДЭС от осадков',
      'Базовая защита от несанкционированного доступа',
      'Запираемые эргономичные дверцы, обеспечивающие доступ ко всем основным узлам ДЭС для их осмотра и сервисного обслуживания',
      'Уровень демпфирования шума ДЭС – 12-15 дБ(А)',
      'Стойкая антикоррозийная покраска кожуха',
      'Срок эксплуатации кожуха – не менее 10 лет'
    ]
  },
  container: {
    title: 'ДЭС в контейнере',
    items: [
      'Жесткая, долговечная, эргономичная конструкция собственной разработки Компании Дизель, уникальная технология производства',
      'Надежный запуск и работа ДЭС до - 50°С',
      'Максимальная защита ДЭС от осадков',
      'Высокий комфорт при эксплуатации ДЭС, проведение ТО и ремонта в любую погоду',
      'Уровень демпфирования шума ДЭС - до 40 дБ(А)',
      'Средний уровень антивандальный защиты',
      'Высокая степень огнестойкости, защита от коррозии',
      'Полная автоматизация работы ДЭС, максимальные возможности по расширению функционала ДЭС',
      'Экономия на вводе ДЭС в эксплуатацию, не требует монтажа, простое многократное перемещение',
      'Срок эксплуатации контейнера – не менее 15 лет'
    ]
  },
  sever: {
    title: 'ДЭС в низкотемпературном блок-контейнере «Север-М»',
    items: [
      'Жесткая, долговечная, эргономичная конструкция на базе морского 20 / 40-футового ISO-контейнера',
      'Повышенная антивандальная защита',
      'Надежный запуск и работа ДЭС до - 50°С',
      'Максимальная защита ДЭС от осадков',
      'Высокий комфорт при эксплуатации ДЭС, проведение ТО и ремонта в любую погоду',
      'Уровень демпфирования шума ДЭС - до 40 дБ(А)',
      'Высокая степень огнестойкости, защита от коррозии',
      'Полная автоматизация работы ДЭС, максимальные возможности по расширению функционала ДЭС',
      'Стандартизированные ISO-крепления для погрузки',
      'Экономия на вводе ДЭС в эксплуатацию, не требует монтажа, простое многократное перемещение',
      'Срок эксплуатации контейнера – не менее 20 лет'
    ]
  },
  mobile: {
    title: 'Передвижная дизельная электростанция (ПЭС)',
    items: [
      'Максимальная мобильность и готовность к работе',
      'Идеальный вариант, если планируется частое перемещение ДЭС (обслуживание и ремонт удаленных инфраструктурных объектов, ремонтные бригады, службы МЧС и пр.).',
      'Экономия на вводе в эксплуатацию',
      'Тип устанавливаемого оборудования: дизельная электростанция в контейнере или кожухе',
      'ДЭС на шасси автомобильного прицепа - для перемещения по дорогам общего пользования, в том числе по дорогам без покрытия, максимальная скорость 90 км/ч (регистрация в ГИБДД, выдается паспорт транспортного средства – ПТС)',
      'ДЭС на шасси тракторного прицепа - для перемещения по дорогам общего пользования, по бездорожью, сильнопересечённой местности, макс. скорость 35 км/ч (регистрация в Гостехнадзоре - паспорт самоходной машины – ПСМ)',
      'ДЭС на салазках (съемные / стационарные) - для перемещения волоком по бездорожью (регистрация в гос. органах не требуется)',
      'ДЭС на шасси грузового автомобиля - для перемещения по дорогам общего пользования, в том числе по дорогам без покрытия.'
    ]
  }
};

const STANDARD_EQUIPMENT = [
  'Двигатель с навесным оборудованием',
  'Силовой синхронный генератор',
  'Базовая рама',
  'Система впуска воздуха с воздушным фильтром',
  'Система газовыхлопа с глушителем',
  'Система топливоподачи с встроенным топливным баком',
  'Система охлаждения с радиатором',
  'Система управления ДЭС с контроллером',
  'Электрооборудование с АКБ и зарядным устройством',
  'Предотгрузочное тестирование',
  'Машинное масло и антифриз',
  'Полный комплект документации'
];

const PREDEFINED_OPTIONS = [
  { id: 'opt-heat', name: 'Электрический подогрев двигателя' },
  { id: 'opt-webasto', name: 'Предпусковой подогреватель двигателя' },
  { id: 'opt-charge', name: 'Автоматическая подзарядка стартерных АКБ' },
  { id: 'opt-meter', name: 'Система учета выработанной электроэнергии' },
  { id: 'opt-tank', name: 'Увеличенный / дополнительный топливный бак', subOptions: ['500 литров', '1000 литров', 'Указать в ручную'] },
  { id: 'opt-zip', name: 'Комплект ЗИП', subOptions: ['500 м/ч', '1000 м/ч', '2000 м/ч', '3000 м/ч', '5000 м/ч'] },
];

const PREDEFINED_SERVICES = [
  { id: 'srv-pnr', name: 'Пусконаладка оборудования на объекте Заказчика' },
  { id: 'srv-shef', name: 'Шеф-монтаж оборудования' },
  { id: 'srv-to', name: 'Разовое техническое обслуживание (ТО)' },
  { id: 'srv-contract', name: 'Сервисный контракт' },
  { id: 'srv-train', name: 'Инструктаж / обучение персонала Заказчика' },
  { id: 'srv-leasing', name: 'Лизинг оборудования' },
];

const RESERVE_INPUT_TEXT = {
  no_avr: {
    title: 'Без АВР',
    description: 'Система ручного управления ДЭС. Запуск и переключение нагрузки осуществляется оператором вручную.',
    features: [
      'Максимальная простота',
      'Минимальная стоимость',
      'Высокая надежность',
      'Требуется постоянный персонал'
    ],
    icon: <Settings className="w-8 h-8" />,
    image: '/avr.png'
  },
  avr_1: {
    title: 'АВР 1 степени',
    description: 'Автоматический запуск ДЭС при исчезновении напряжения в основной сети без автоматического переключения нагрузки.',
    features: [
      'Автоматический прогрев ДВС',
      'Контроль параметров сети',
      'Готовность к приему нагрузки',
      'Защита двигателя и генератора'
    ],
    icon: <Zap className="w-8 h-8" />,
    image: '/avr.png'
  },
  avr_2: {
    title: 'АВР 2 степени',
    description: 'Полностью автоматическая система. Автоматический запуск ДЭС и автоматическое переключение нагрузки на резервный источник.',
    features: [
      'Без участия персонала',
      'Минимальное время простоя',
      'Автоматический возврат на сеть',
      'Интеллектуальный контроль ComAp'
    ],
    icon: <Zap className="w-8 h-8 text-brand-blue" />,
    image: '/avr.png'
  },
  avr_3: {
    title: 'АВР 3 степени',
    description: 'Система с автоматической дозаправкой топливом и маслом, обеспечивающая длительную автономную работу объекта.',
    features: [
      'Максимальная автономность',
      'Система подкачки топлива',
      'Долив масла в картер',
      'Расширенный мониторинг'
    ],
    icon: <Activity className="w-8 h-8 text-emerald-500" />,
    image: '/avr.png'
  },
  manual: {
    title: 'Ручной ввод резерва (РВР)',
    description: 'Система ручного ввода резерва (РВР) реализована на базе реверсивного рубильника с тремя положениями (Сеть — 0 — ДГУ). Данное решение отличается исключительной надежностью и простотой эксплуатации. Переключение осуществляется оператором вручную при исчезновении напряжения в основной сети.',
    features: [
      'Визуальный разрыв цепи',
      'Блокировка от одновременного включения двух источников',
      'Простота конструкции и обслуживания',
      'Минимальная стоимость решения',
      'Высокая надежность и большой ресурс работы'
    ],
    icon: <Settings className="w-8 h-8" />,
    image: '/input_file_3.png'
  },
  automatic: {
    title: 'Автоматический ввод резерва (АВР)',
    description: 'Система автоматического ввода резерва (АВР) обеспечивает непрерывность электроснабжения без участия персонала. Интеллектуальный контроллер постоянно мониторит состояние основной сети и, при отклонении параметров от нормы, автоматически подает сигнал на запуск ДЭС и переключает на нее нагрузку.',
    features: [
      'Полностью автономная работа 24/7',
      'Контроль фаз и защита от перекоса напряжений',
      'Программируемые задержки времени переключения',
      'Автоматический возврат на основную сеть при восстановлении питания',
      'Индикация состояния сети и ДЭС на лицевой панели'
    ],
    icon: <Zap className="w-8 h-8" />,
    image: '/input_file_4.png'
  }
};

const Header = () => (
  <div className="relative w-full h-[180px] overflow-hidden mb-8 print:mb-4 group-container page-break-avoid">
    <img 
      src="/input_file_2.png" 
      alt="Дизель Компания" 
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
    {/* Optional overlay for print quality if needed, but the image is high quality */}
    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,41,107,0.1)] to-transparent pointer-events-none" />
  </div>
);

import { QuestionnaireForm } from './components/QuestionnaireForm';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'editor' | 'proposal' | 'questionnaire'>('dashboard');
  const [activeTab, setActiveTab] = useState<'proposals' | 'questionnaires' | 'accounts'>('proposals');
  const [currentProposalId, setCurrentProposalId] = useState<string | null>(null);
  const [currentProposalSlug, setCurrentProposalSlug] = useState<string | null>(null);
  const [currentQuestionnaireSlug, setCurrentQuestionnaireSlug] = useState<string | null>(null);
  const [powerFilter, setPowerFilter] = useState<number | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedSpecs, setLoadedSpecs] = useState<Manufacturer[]>(specsData);

  // Manager state
  const [manager, setManager] = useState<ManagerInfo>(() => {
    const saved = localStorage.getItem('diesel_manager');
    return saved ? JSON.parse(saved) : { name: '', phone: '', email: '', photoUrl: '' };
  });

  // Editor state
  const [clientName, setClientName] = useState('');
  const [clientPersonName, setClientPersonName] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [additionalOptions, setAdditionalOptions] = useState<AdditionalOption[]>([]);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({ type: 'pickup', address: '', price: 0, isIncluded: false });
  const [modeOfOperation, setModeOfOperation] = useState<'main' | 'reserve'>('reserve');
  const [avrOption, setAvrOption] = useState<string>('На объекте имеется собственный АВР');
  const [parallelWorkType, setParallelWorkType] = useState<'none' | 'possible' | 'complex'>('none');
  
  const [isTwoStations, setIsTwoStations] = useState(false);
  const [isThreeStations, setIsThreeStations] = useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(true);
  const [showCostDetails, setShowCostDetails] = useState(true);
  const [station1, setStation1] = useState<ProposalItem>({
    manufacturerId: 'yuchai',
    modelName: 'на загрузке...',
    variant: 'open',
    price: 0,
    recommended: false
  });

  const [station2, setStation2] = useState<ProposalItem>({
    manufacturerId: 'yuchai',
    modelName: 'на загрузке...',
    variant: 'open',
    price: 0,
    recommended: false
  });

  const [station3, setStation3] = useState<ProposalItem>({
    manufacturerId: 'yuchai',
    modelName: 'на загрузке...',
    variant: 'open',
    price: 0,
    recommended: false
  });

  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'b2', type: 'contacts', isVisible: true },
    { id: 'b1', type: 'header', isVisible: true },
    { id: 'b3', type: 'client-info', isVisible: true },
    { id: 'b4', type: 'message', isVisible: true },
    { id: 'b5', type: 'purpose', isVisible: false },
    { id: 'b6', type: 'specs', isVisible: true },
    { id: 'b7', type: 'comparison', isVisible: true },
    { id: 'b8', type: 'costs', isVisible: true },
    { id: 'b9', type: 'control-panel', isVisible: true },
    { id: 'b13', type: 'reserve-input', isVisible: true },
    { id: 'b12', type: 'interactive-container', isVisible: true },
    { id: 'b10', type: 'about', isVisible: true },
    { id: 'b11', type: 'footer', isVisible: true },
  ]);

  const [fuelPrice, setFuelPrice] = useState<number>(74.94);
  const [toRate, setToRate] = useState<number>(150);
  const [usePurpose, setUsePurpose] = useState(false);
  const [useControlPanel, setUseControlPanel] = useState(true);
  const [purposeType, setPurposeType] = useState<keyof typeof PURPOSES>('agro');

  // --- SQLite API Sync ---

  useEffect(() => {
    if (loadedSpecs.length > 0 && station1.modelName === 'на загрузке...') {
      const firstMan = loadedSpecs[0];
      if (firstMan.models.length > 0) {
        const firstModel = firstMan.models[0];
        setStation1(prev => ({ ...prev, manufacturerId: firstMan.id, modelName: firstModel.name }));
        setStation2(prev => ({ ...prev, manufacturerId: firstMan.id, modelName: firstModel.name }));
        setStation3(prev => ({ ...prev, manufacturerId: firstMan.id, modelName: firstModel.name }));
      }
    }
  }, [loadedSpecs]);

  useEffect(() => {
    const init = async () => {
      // Restore user session if exists
      const savedUser = localStorage.getItem('proposal_user');
      if (savedUser) {
        const u = JSON.parse(savedUser) as User;
        setUser(u);
        loadProposals(u.id, u.role);
        
        // Refresh manager profile
        const resp = await fetch(`/api/managers/${u.id}`);
        if (resp.ok) {
          setManager(await resp.json());
        }
      }

      // Fetch dynamic specs
      try {
        const sResp = await fetch('/api/specs');
        if (sResp.ok) {
          const sData = await sResp.json();
          if (Array.isArray(sData) && sData.length > 0) {
            // Apply images from mapping
            const enriched = sData.map((man: Manufacturer) => ({
              ...man,
              models: man.models.map((model: ModelSpec) => ({
                ...model,
                imageUrl: STATION_IMAGES[model.name] || 
                          STATION_IMAGES[`Дизельный генератор ${model.name}`] || 
                          STATION_IMAGES[`Дизельная электростанция ${model.name}`] ||
                          model.imageUrl
              }))
            }));
            setLoadedSpecs(enriched);
          }
        }
      } catch (err) {
        console.error('Specs load error:', err);
      }

      // Check for proposal ID in URL
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('id');
      const qid = params.get('q');
      if (pid) {
        loadProposal(pid);
      } else if (qid) {
        setCurrentQuestionnaireSlug(qid);
        setView('questionnaire');
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadQuestionnaires = async (uid: string, role?: string) => {
    try {
      const url = role === 'admin' ? '/api/questionnaires' : `/api/questionnaires?managerId=${uid}`;
      const resp = await fetch(url);
      if (resp.ok) {
        setQuestionnaires(await resp.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProposals = async (uid: string, role?: string) => {
    try {
      const url = role === 'admin' ? '/api/proposals' : `/api/proposals?managerId=${uid}`;
      const resp = await fetch(url);
      if (resp.ok) {
        setProposals(await resp.json());
      }
      loadQuestionnaires(uid, role);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProposal = async (id: string, targetView: 'proposal' | 'editor' = 'proposal') => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/proposals/${id}`);
      if (resp.ok) {
        const data = await resp.json() as ProposalData;
        setClientName(data.clientName);
        setClientPersonName(data.clientPersonName || '');
        setValidUntil(data.validUntil || '');
        setCoverLetter(data.coverLetter || '');
        setAdditionalOptions(data.additionalOptions || []);
        setServices(data.services || []);
        setDeliveryInfo(data.deliveryInfo || { type: 'delivery', address: '', price: 0, isIncluded: false });
        setModeOfOperation(data.modeOfOperation || 'reserve');
        setAvrOption(data.avrOption || 'На объекте имеется собственный АВР');
        setParallelWorkType(data.parallelWorkType || 'none');
        setFuelPrice(data.fuelPrice);
        setToRate(data.toRate);
        setShowCompanyInfo(data.showCompanyInfo);
        setStation1(data.items[0]);
        if (data.items.length === 2) {
          setIsTwoStations(true);
          setIsThreeStations(false);
          setStation2(data.items[1]);
        } else if (data.items.length === 3) {
          setIsTwoStations(false);
          setIsThreeStations(true);
          setStation2(data.items[1]);
          setStation3(data.items[2]);
        } else {
          setIsTwoStations(false);
          setIsThreeStations(false);
        }
        setUsePurpose(data.usePurpose || false);
        setUseControlPanel(data.useControlPanel || false);
        setPurposeType((data.purposeType as any) || 'agro');
        if (data.blocks && data.blocks.length > 0) {
          setBlocks(data.blocks);
        } else {
          // Initialize default blocks if missing
          setBlocks([
            { id: 'b2', type: 'contacts', isVisible: true },
            { id: 'b1', type: 'header', isVisible: true },
            { id: 'b3', type: 'client-info', isVisible: true },
            { id: 'b4', type: 'message', isVisible: true },
            { id: 'b5', type: 'purpose', isVisible: data.usePurpose || false },
            { id: 'b6', type: 'specs', isVisible: true },
            { id: 'b7', type: 'comparison', isVisible: true },
            { id: 'b8', type: 'costs', isVisible: true },
            { id: 'b9', type: 'control-panel', isVisible: data.useControlPanel || true },
            { id: 'b10', type: 'about', isVisible: data.showCompanyInfo || true },
            { id: 'b11', type: 'footer', isVisible: true },
          ]);
        }
        setCurrentProposalId(data.id);
        setCurrentProposalSlug(data.slug || null);
        setView(targetView);

        // Fetch manager profile
        const mResp = await fetch(`/api/managers/${data.managerId}`);
        if (mResp.ok) {
          setManager(await mResp.json());
        }

        // Increment view count if public view
        if (targetView === 'proposal') {
          await fetch(`/api/proposals/${id}/view`, { method: 'POST' });
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveProposal = async () => {
    if (!user) return;
    if (!clientName.trim()) {
      alert('Пожалуйста, введите название клиента/компании. Это поле обязательно.');
      return;
    }
    const items = [station1];
    if (isTwoStations || isThreeStations) items.push(station2);
    if (isThreeStations) items.push(station3);

    const dateStr = new Date().toISOString().split('T')[0];
    const companySlug = translit(clientName);
    const slug = `${dateStr}-${companySlug}`;

    const data = {
      clientName,
      clientPersonName,
      validUntil,
      coverLetter,
      modeOfOperation,
      avrOption,
      parallelWorkType,
      additionalOptions,
      services,
      deliveryInfo,
      slug,
      managerId: user.id,
      items,
      blocks,
      fuelPrice,
      toRate,
      showCompanyInfo,
      usePurpose,
      useControlPanel,
      purposeType
    };

    try {
      if (currentProposalId) {
        await fetch(`/api/proposals/${currentProposalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        setCurrentProposalSlug(slug);
        alert('КП успешно обновлено!');
      } else {
        const resp = await fetch('/api/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await resp.json();
        setCurrentProposalId(result.id);
        setCurrentProposalSlug(result.slug);
        alert('КП успешно сохранено!');
      }
      loadProposals(user.id, user.role);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProposal = async (id: string) => {
    if (!user) return;
    if (!confirm('Вы уверены, что хотите удалить это предложение?')) return;
    
    try {
      await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
      loadProposals(user.id, user.role);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (email: string, password?: string) => {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (resp.ok) {
        const u = await resp.json();
        const userObj = { id: u.id, name: u.name, email: u.email, photoUrl: u.photoUrl, role: u.role };
        setUser(userObj);
        localStorage.setItem('proposal_user', JSON.stringify(userObj));
        setManager(u);
        loadProposals(u.id, u.role);
      } else {
        const err = await resp.json();
        alert(err.error || 'Ошибка входа');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('proposal_user');
    setProposals([]);
    setView('dashboard');
  };

  // Helper derivatives
  const getSpec = (item: ProposalItem) => {
    const man = loadedSpecs.find(m => m.id === item.manufacturerId) || loadedSpecs[0];
    if (!man) return { man: null, model: null };
    const model = (man.models || []).find((m: any) => m.name === item.modelName) || man.models?.[0];
    return { man, model };
  };

  const spec1 = getSpec(station1);
  const spec2 = getSpec(station2);
  const spec3 = getSpec(station3);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-gray">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-brand-blue">
          <Activity className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-gray overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <Dashboard 
            key="dashboard"
            proposals={proposals} 
            questionnaires={questionnaires}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onCreate={() => { setView('editor'); setCurrentProposalId(null); setClientName(''); }}
            onView={(id: string) => loadProposal(id, 'proposal')}
            onEdit={(id: string) => loadProposal(id, 'editor')}
            onDelete={handleDeleteProposal}
            onFillQuestionnaire={(slug: string) => {
              setCurrentQuestionnaireSlug(slug);
              setView('questionnaire');
            }}
            onConvertQuestionnaire={async (q: QuestionnaireData) => {
              setLoading(true);
              try {
                const resp = await fetch(`/api/questionnaires/${q.id}`);
                if (resp.ok) {
                  const fullQ = await resp.json();
                  const qData = fullQ.data || {};
                  
                  // Reset Proposal state
                  setCurrentProposalId(null);
                  setCurrentProposalSlug(null);
                  setClientName(fullQ.companyName);
                  setClientPersonName(fullQ.contactPerson);
                  setValidUntil('');
                  
                  // Summary for cover letter
                  const summary = `Подготовлено на основании опросного листа:\n` +
                                 `• Требуемая мощность: ${qData.powerKw} кВт / ${qData.powerKva} кВА\n` +
                                 `• Режим работы: ${qData.mode === 'main' ? 'Основной' : 'Резервный'}\n` +
                                 `• Тип объекта: ${qData.locationType || 'не указан'}\n` +
                                 `• Исполнение: ${qData.executionType === 'container' ? 'Контейнер' : qData.executionType === 'enclosure' ? 'Кожух' : 'Открытое'}`;
                  setCoverLetter(summary);
                  
                  // Map Options
                  const opts: AdditionalOption[] = [];
                  if (qData.options?.electricHeater) opts.push({ id: 'opt-heat', name: 'Электрический подогрев двигателя', price: 0, isIncluded: true });
                  if (qData.options?.preheater) opts.push({ id: 'opt-webasto', name: 'Предпусковой подогреватель двигателя', price: 0, isIncluded: false });
                  if (qData.options?.batteryCharger) opts.push({ id: 'opt-charge', name: 'Автоматическая подзарядка стартерных АКБ', price: 0, isIncluded: true });
                  if (qData.options?.energyMeter) opts.push({ id: 'opt-meter', name: 'Система учета выработанной электроэнергии', price: 0, isIncluded: false });
                  
                  setAdditionalOptions(opts);

                  // Map Services
                  const srvs: AdditionalService[] = [];
                  if (qData.additionalServices?.pnr) srvs.push({ id: 'srv-pnr', name: 'Пусконаладка оборудования на объекте Заказчика', price: 0, isIncluded: false });
                  if (qData.additionalServices?.supervision) srvs.push({ id: 'srv-smr', name: 'Шеф-монтаж оборудования', price: 0, isIncluded: false });
                  setServices(srvs);
                  
                  // Delivery
                  setDeliveryInfo({ 
                    type: qData.deliveryMethod === 'self_pickup' ? 'pickup' : 'delivery',
                    address: qData.activityRegion || '', 
                    price: 0, 
                    isIncluded: qData.deliveryMethod === 'company_delivery' 
                  });
                  
                  // Mode and AVR
                  setModeOfOperation(qData.mode === 'main' ? 'main' : 'reserve');
                  if (qData.avr) {
                    if (qData.avr === 'external') setAvrOption('Поставить АВР в отдельном шкафу');
                    else if (qData.avr === 'combined') setAvrOption('Поставить АВР, совмещенный с системой управления ДЭС');
                    else if (qData.avr === 'in_container') setAvrOption('Установить АВР внутри блок-контейнера');
                    else setAvrOption('На объекте имеется собственный АВР');
                  }
                  
                  // Parallel Work
                  if (qData.parallelWork) {
                    setParallelWorkType(qData.parallelWork === 'complex' ? 'complex' : 'possible');
                  } else {
                    setParallelWorkType('none');
                  }
                  
                  // Station Specs
                  const power = parseInt(qData.powerKw) || 0;
                  if (power > 0) setPowerFilter(power);
                  
                  const variant = qData.executionType === 'enclosure' ? 'enclosure' : 
                                  qData.executionType === 'container' ? 'container' : 
                                  qData.executionType === 'mobile' ? 'mobile' : 'open';
                  
                  // Find best matching model by power
                  let bestModel = loadedSpecs[0].models[0];
                  let bestManId = loadedSpecs[0].id;
                  
                  if (power > 0) {
                    let minDiff = Infinity;
                    loadedSpecs.forEach(m => {
                      m.models.forEach(mod => {
                        const diff = Math.abs(mod.nominalPowerKw - power);
                        if (diff < minDiff) {
                          minDiff = diff;
                          bestModel = mod;
                          bestManId = m.id;
                        }
                      });
                    });
                  }

                  setStation1({
                    manufacturerId: bestManId,
                    modelName: bestModel.name,
                    variant: variant,
                    automationType: qData.automation === 'auto' ? 'auto' : 'manual',
                    price: 0,
                    recommended: true
                  });
                  
                  setIsTwoStations(false);
                  setIsThreeStations(false);
                  
                  // Purpose
                  setUsePurpose(true);
                  if (fullQ.companyName.toLowerCase().includes('строй')) setPurposeType('construction');
                  else if (fullQ.companyName.toLowerCase().includes('энерг')) setPurposeType('energy');
                  else if (fullQ.companyName.toLowerCase().includes('водоканал') || fullQ.companyName.toLowerCase().includes('жкх')) setPurposeType('zhkh');
                  else setPurposeType('industry');

                  // Blocks
                  setBlocks([
                    { id: 'b2', type: 'contacts', isVisible: true },
                    { id: 'b1', type: 'header', isVisible: true },
                    { id: 'b3', type: 'client-info', isVisible: true },
                    { id: 'b4', type: 'message', isVisible: true },
                    { id: 'b5', type: 'purpose', isVisible: true },
                    { id: 'b6', type: 'specs', isVisible: true },
                    { id: 'b7', type: 'comparison', isVisible: false },
                    { id: 'b8', type: 'costs', isVisible: true },
                    { id: 'b9', type: 'control-panel', isVisible: true },
                    { id: 'b13', type: 'reserve-input', isVisible: true },
                    { id: 'b12', type: 'interactive-container', isVisible: true },
                    { id: 'b10', type: 'about', isVisible: true },
                    { id: 'b11', type: 'footer', isVisible: true },
                  ]);

                  setView('editor');
                }
              } catch (e) {
                console.error(e);
                alert('Ошибка при конвертации');
              }
              setLoading(false);
            }}
            loadQuestionnaires={loadQuestionnaires}
          />
        )}
        
        {view === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full h-full">
            <AdminSidebar 
              user={user}
              clientName={clientName}
              setClientName={setClientName}
              clientPersonName={clientPersonName}
              setClientPersonName={setClientPersonName}
              validUntil={validUntil}
              setValidUntil={setValidUntil}
              coverLetter={coverLetter}
              setCoverLetter={setCoverLetter}
              additionalOptions={additionalOptions}
              setAdditionalOptions={setAdditionalOptions}
              services={services}
              setServices={setServices}
              deliveryInfo={deliveryInfo}
              setDeliveryInfo={setDeliveryInfo}
              modeOfOperation={modeOfOperation}
              setModeOfOperation={setModeOfOperation}
              avrOption={avrOption}
              setAvrOption={setAvrOption}
              parallelWorkType={parallelWorkType}
              setParallelWorkType={setParallelWorkType}
              isTwoStations={isTwoStations}
              setIsTwoStations={setIsTwoStations}
              isThreeStations={isThreeStations}
              setIsThreeStations={setIsThreeStations}
              showCompanyInfo={showCompanyInfo}
              setShowCompanyInfo={setShowCompanyInfo}
              showCostDetails={showCostDetails}
              setShowCostDetails={setShowCostDetails}
              useControlPanel={useControlPanel}
              setUseControlPanel={setUseControlPanel}
              station1={station1}
              setStation1={setStation1}
              station2={station2}
              setStation2={setStation2}
              station3={station3}
              setStation3={setStation3}
              fuelPrice={fuelPrice}
              setFuelPrice={setFuelPrice}
              toRate={toRate}
              setToRate={setToRate}
              usePurpose={usePurpose}
              setUsePurpose={setUsePurpose}
              purposeType={purposeType}
              setPurposeType={setPurposeType}
              manager={manager}
              setManager={setManager}
              onSave={handleSaveProposal}
              onBack={() => setView('dashboard')}
              currentProposalId={currentProposalId}
              currentProposalSlug={currentProposalSlug}
              blocks={blocks}
              setBlocks={setBlocks}
              loadedSpecs={loadedSpecs}
              powerFilter={powerFilter}
              setPowerFilter={setPowerFilter}
            />
            <PreviewArea 
              blocks={blocks}
              station1={spec1.model}
              station2={isTwoStations || isThreeStations ? spec2.model : null}
              station3={isThreeStations ? spec3.model : null}
              p1={station1.price || 0}
              p2={station2.price || 0}
              p3={station3.price || 0}
              rec1={station1.recommended}
              rec2={station2.recommended}
              rec3={station3.recommended}
              manager={manager}
              fuelPrice={fuelPrice}
              toRate={toRate}
              showCompanyInfo={showCompanyInfo}
              showCostDetails={showCostDetails}
              usePurpose={usePurpose}
              useControlPanel={useControlPanel}
              purposeType={purposeType}
              v1={station1.variant as any}
              v2={station2.variant as any}
              v3={station3.variant as any}
              a1={station1.automationType}
              m1={station1.mobileType}
              a2={station2.automationType}
              m2={station2.mobileType}
              a3={station3.automationType}
              m3={station3.mobileType}
              modeOfOperation={modeOfOperation}
              avrOption={avrOption}
              parallelWorkType={parallelWorkType}
              services={services}
              clientName={clientName}
              clientPersonName={clientPersonName}
              validUntil={validUntil}
              coverLetter={coverLetter}
              additionalOptions={additionalOptions}
              deliveryInfo={deliveryInfo}
              onBack={() => setView('dashboard')}
              user={user}
              onUpdateBlocks={setBlocks}
            />
          </motion.div>
        )}

        {view === 'proposal' && (
          <PreviewArea 
            key="proposal"
            blocks={blocks}
            station1={spec1.model}
            station2={isTwoStations || isThreeStations ? spec2.model : null}
            station3={isThreeStations ? spec3.model : null}
            p1={station1.price || 0}
            p2={station2.price || 0}
            p3={station3.price || 0}
            rec1={station1.recommended}
            rec2={station2.recommended}
            rec3={station3.recommended}
            manager={manager}
            fuelPrice={fuelPrice}
            toRate={toRate}
            showCompanyInfo={showCompanyInfo}
            showCostDetails={showCostDetails}
            usePurpose={usePurpose}
            useControlPanel={useControlPanel}
            purposeType={purposeType}
            v1={station1.variant as any}
            v2={station2.variant as any}
            v3={station3.variant as any}
            a1={station1.automationType}
            m1={station1.mobileType}
            a2={station2.automationType}
            m2={station2.mobileType}
            a3={station3.automationType}
            m3={station3.mobileType}
            modeOfOperation={modeOfOperation}
            avrOption={avrOption}
            parallelWorkType={parallelWorkType}
            services={services}
            clientName={clientName}
            clientPersonName={clientPersonName}
            validUntil={validUntil}
            coverLetter={coverLetter}
            additionalOptions={additionalOptions}
            deliveryInfo={deliveryInfo}
            onBack={() => setView('dashboard')}
            isClientView
            user={user}
            onUpdateBlocks={setBlocks}
          />
        )}

        {view === 'questionnaire' && currentQuestionnaireSlug && (
          <motion.div 
            key="questionnaire" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="w-full h-full overflow-y-auto bg-slate-50"
          >
            {user && (
              <div className="max-w-4xl mx-auto p-4 pt-8 flex justify-start no-print">
                <button 
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 text-doc-slate-400 hover:text-brand-blue font-bold text-xs uppercase tracking-widest bg-white px-6 py-3 rounded-2xl shadow-sm border border-doc-slate-100 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Назад в панель
                </button>
              </div>
            )}
            <QuestionnaireForm 
              slug={currentQuestionnaireSlug} 
              onComplete={() => {
                if (user) loadQuestionnaires(user.id, user.role);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Subcomponents ---

const Dashboard = ({ proposals, questionnaires, user, onLogin, onLogout, onCreate, onView, onEdit, onDelete, onFillQuestionnaire, onConvertQuestionnaire, loadQuestionnaires }: any) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposals' | 'accounts'>('proposals');
  const [showQModal, setShowQModal] = useState(false);
  const [modalEditQ, setModalEditQ] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      onLogin(emailInput, passwordInput);
      setShowInput(false);
      setPasswordInput('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col w-full h-full p-8 overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-blue">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-doc-slate-800 uppercase tracking-tighter">Панель управления КП</h1>
              <p className="text-sm text-doc-slate-500 font-medium italic">Компания Дизель — Генератор Коммерческих Предложений</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div 
                  key="user-badge"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-4 bg-white p-2 pl-4 rounded-xl shadow-sm border border-doc-slate-100 font-bold"
                >
                  <div className="text-right">
                    <p className="text-sm font-black text-doc-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-doc-slate-400 font-bold uppercase">{user.email}</p>
                  </div>
                  <button onClick={onLogout} title="Выйти" className="p-2 text-doc-slate-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : showInput ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col items-end gap-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="email"
                      placeholder="Email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-white border border-doc-slate-200 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 w-48 shadow-sm"
                    />
                    <input
                      type="password"
                      placeholder="Пароль"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="bg-white border border-doc-slate-200 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 w-40 shadow-sm"
                    />
                    <button 
                      type="submit"
                      className="bg-brand-blue text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all uppercase"
                    >
                      OK
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowInput(false)}
                      className="text-doc-slate-400 hover:text-doc-slate-600 px-2 font-bold text-xs uppercase"
                    >
                      Отмена
                    </button>
                  </div>
                  <p className="text-[10px] text-doc-slate-400 font-bold uppercase tracking-tight">Регистрация возможна только администратором</p>
                </motion.form>
              ) : (
                <motion.button 
                  key="login-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setShowInput(true)}
                  className="flex items-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all uppercase tracking-wider"
                >
                  <LogIn className="w-4 h-4" /> Войти как менеджер
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<FileText />} label="Всего КП" value={proposals.length} color="bg-blue-500" />
          <StatCard icon={<Eye />} label="Общий охват" value={proposals.reduce((acc: number, p: any) => acc + (p.viewCount || 0), 0)} color="bg-emerald-500" />
          <StatCard icon={<History />} label="Активные ссылки" value={proposals.filter((p: any) => p.viewCount > 0).length} color="bg-amber-500" />
        </div>

        {/* Main Action Buttons for Manager */}
        {user && (
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onCreate}
              className="flex-1 min-w-[200px] h-24 bg-brand-blue text-white rounded-3xl shadow-lg shadow-brand-blue/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Создать новое КП</span>
            </button>

            <button 
              onClick={() => setShowQModal(true)}
              className="flex-1 min-w-[200px] h-24 bg-emerald-600 text-white rounded-3xl shadow-lg shadow-emerald-500/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Создать опросный лист</span>
            </button>
          </div>
        )}

        {/* Create Questionnaire Modal */}
        <AnimatePresence>
          {showQModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => { setShowQModal(false); setModalEditQ(null); }}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
              >
                <CreateQuestionnaireModal 
                  user={user} 
                  initialData={modalEditQ}
                  onClose={() => { setShowQModal(false); setModalEditQ(null); loadQuestionnaires(user.id, user.role); }} 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('proposals')}
              className={cn(
                "px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm",
                activeTab === 'proposals' ? "bg-brand-blue text-white" : "bg-white text-doc-slate-400 hover:bg-doc-slate-50"
              )}
            >
              Предложения
            </button>
            <button 
              onClick={() => setActiveTab('questionnaires')}
              className={cn(
                "px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm",
                activeTab === 'questionnaires' ? "bg-brand-blue text-white" : "bg-white text-doc-slate-400 hover:bg-doc-slate-50"
              )}
            >
              Опросные листы
            </button>
            {user?.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('accounts')}
                className={cn(
                  "px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm",
                  activeTab === 'accounts' ? "bg-brand-blue text-white" : "bg-white text-doc-slate-400 hover:bg-doc-slate-50"
                )}
              >
                Пользователи
              </button>
            )}
          </div>

        {activeTab === 'proposals' ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-doc-slate-100">
            <div className="p-6 border-b border-doc-slate-50 bg-doc-slate-50/50">
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Список моих предложений
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-doc-slate-50 text-[11px] font-black uppercase text-doc-slate-400 tracking-wider">
                    <th className="p-5 pl-8">Клиент</th>
                    {user?.role === 'admin' && <th className="p-5">Менеджер</th>}
                    <th className="p-5">Конфигурация</th>
                    <th className="p-5">Дата создания</th>
                    <th className="p-5">Просмотры</th>
                    <th className="p-5 text-center">Последний просмотр</th>
                    <th className="p-5 pr-8 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p: any) => (
                    <tr key={p.id} className="group hover:bg-doc-blue-50/30 transition-colors border-b border-doc-slate-50">
                      <td className="p-5 pl-8">
                        <div className="flex flex-col">
                          <span className="font-black text-doc-slate-800 text-base italic">{p.clientName || 'Без названия'}</span>
                          <span className="text-[10px] text-doc-slate-400 font-bold">ID: {p.id}</span>
                        </div>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="p-5">
                          <p className="text-xs font-black text-brand-blue uppercase tracking-tight">{p.managerName || '—'}</p>
                        </td>
                      )}
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {p.items?.map((item: any, idx: number) => (
                            <span key={idx} className="bg-white border border-doc-slate-100 px-3 py-1 rounded text-[10px] font-black text-brand-blue uppercase tracking-tight">
                              {item.modelName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="text-[12px] font-bold text-doc-slate-600">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('ru-RU') : '—'}
                        </p>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3 text-bold">
                          <div className="h-2 w-14 bg-doc-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${Math.min((p.viewCount || 0) * 10, 100)}%` }} />
                          </div>
                          <span className="text-[12px] font-black text-emerald-600">{p.viewCount || 0}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <p className="text-[12px] font-black text-doc-slate-700">
                          {p.lastViewedAt ? new Date(p.lastViewedAt).toLocaleDateString('ru-RU') : '—'}
                        </p>
                      </td>
                      <td className="p-5 pr-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => onView(p.id)}
                            className="p-3 bg-accent-light text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                            title="Просмотреть"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => onEdit && onEdit(p.id)}
                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Редактировать"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => onDelete(p.id)}
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Удалить"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!user && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <Info className="w-8 h-8 text-doc-slate-300 mx-auto mb-4" />
                        <p className="text-doc-slate-400 font-bold uppercase tracking-widest text-sm">Войдите в систему для просмотра ваших предложений</p>
                      </td>
                    </tr>
                  )}
                  {user && proposals.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-doc-slate-400 italic font-bold uppercase tracking-widest">У вас пока нет созданных предложений</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'questionnaires' ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-doc-slate-100">
            <QuestionnairesManagement 
              user={user} 
              questionnaires={questionnaires} 
              onRefresh={() => user && loadQuestionnaires(user.id, user.role)} 
              onFill={onFillQuestionnaire}
              onConvert={onConvertQuestionnaire}
              onEdit={(q: any) => {
                setModalEditQ(q);
                setShowQModal(true);
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-doc-slate-100">
            <AccountsManagement currentUser={user} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-doc-slate-100 flex items-center gap-6">
    <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl text-white shadow-lg", color)}>
      {React.cloneElement(icon, { className: "w-7 h-7" })}
    </div>
    <div>
      <p className="text-[12px] font-bold text-doc-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-doc-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

const AdminSidebar = ({ 
  user, clientName, setClientName, isTwoStations, setIsTwoStations, 
  isThreeStations, setIsThreeStations,
  showCompanyInfo, setShowCompanyInfo, useControlPanel, setUseControlPanel,
  showCostDetails, setShowCostDetails,
  station1, setStation1, station2, setStation2, station3, setStation3,
  fuelPrice, setFuelPrice, toRate, setToRate, 
  usePurpose, setUsePurpose, purposeType, setPurposeType,
  manager, setManager, onSave, onBack, currentProposalId, currentProposalSlug,
  blocks, setBlocks,
  loadedSpecs,
  clientPersonName, setClientPersonName,
  validUntil, setValidUntil,
  coverLetter, setCoverLetter,
  additionalOptions, setAdditionalOptions,
  services, setServices,
  deliveryInfo, setDeliveryInfo,
  modeOfOperation, setModeOfOperation,
  avrOption, setAvrOption,
  parallelWorkType, setParallelWorkType,
  powerFilter, setPowerFilter
}: any) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'blocks' | 'profile'>('settings');

  const updateProfile = async () => {
    try {
      const resp = await fetch(`/api/managers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manager)
      });
      if (resp.ok) alert('Профиль обновлен!');
    } catch (e) { alert('Ошибка обновления'); }
  };

  return (
    <aside className="w-[360px] bg-white border-r border-border-color p-0 flex flex-col h-full shadow-lg z-10 no-print">
      <div className="p-6 border-b border-doc-slate-50 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-doc-slate-50 rounded-lg text-doc-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue border-b-2 border-brand-blue pb-1">
          Конструктор КП
        </div>
        <div className="w-8" />
      </div>

      <div className="flex border-b border-doc-slate-50 bg-doc-slate-50">
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-4 h-4" />} label="КП" />
        {user?.role === 'admin' && <TabButton active={activeTab === 'blocks'} onClick={() => setActiveTab('blocks')} icon={<Layers className="w-4 h-4" />} label="Блоки" />}
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User className="w-4 h-4" />} label="Профиль" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <motion.div 
              key="settings-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6 pb-20"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-doc-slate-500 uppercase">Клиент / Компания</label>
                  <input 
                    placeholder="ООО 'Газпром'"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="admin-input font-bold text-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-doc-slate-500 uppercase">Имя контакта</label>
                  <input 
                    placeholder="Иван Иванович"
                    value={clientPersonName}
                    onChange={(e) => setClientPersonName(e.target.value)}
                    className="admin-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-doc-slate-500 uppercase">Действует до</label>
                  <input 
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="admin-input"
                  />
                </div>

                <div className="flex flex-col gap-2 p-3 bg-doc-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <Layers className="w-4 h-4 text-brand-blue" />
                      <span className="text-[11px] font-black text-brand-blue uppercase">Две станции</span>
                    </div>
                    <button 
                      onClick={() => {
                        const next = !isTwoStations;
                        setIsTwoStations(next);
                        if (next) setIsThreeStations(false);
                      }}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors",
                        isTwoStations ? 'bg-brand-blue' : 'bg-doc-slate-300'
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                        isTwoStations ? 'left-6' : 'left-1'
                      )} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-doc-slate-200 pt-2">
                    <div className="flex items-center gap-2 font-bold">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] font-black text-emerald-600 uppercase">Три станции</span>
                    </div>
                    <button 
                      onClick={() => {
                        const next = !isThreeStations;
                        setIsThreeStations(next);
                        if (next) setIsTwoStations(false);
                      }}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors",
                        isThreeStations ? 'bg-emerald-600' : 'bg-doc-slate-300'
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                        isThreeStations ? 'left-6' : 'left-1'
                      )} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-doc-slate-200 pt-2">
                    <div className="flex items-center gap-2 font-bold">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-[11px] font-black text-orange-500 uppercase">Блок Затраты</span>
                    </div>
                    <button 
                      onClick={() => setBlocks(blocks.map((b: Block) => b.type === 'costs' ? { ...b, isVisible: !b.isVisible } : b))}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors",
                        blocks.find((b: Block) => b.type === 'costs')?.isVisible ? 'bg-orange-500' : 'bg-doc-slate-300'
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                        blocks.find((b: Block) => b.type === 'costs')?.isVisible ? 'left-6' : 'left-1'
                      )} />
                    </button>
                  </div>
                </div>

                {/* Режим работы ДЭС */}
                <div className="space-y-3 pt-4 border-t border-doc-slate-100">
                   <p className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Режим работы ДЭС</p>
                   <div className="flex gap-1 p-1 bg-doc-slate-100 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setModeOfOperation('main')}
                        className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", modeOfOperation === 'main' ? "bg-white text-brand-blue shadow-sm" : "text-doc-slate-400")}
                      >
                        Основной источник
                      </button>
                      <button 
                        onClick={() => setModeOfOperation('reserve')}
                        className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", modeOfOperation === 'reserve' ? "bg-white text-brand-blue shadow-sm" : "text-doc-slate-400")}
                      >
                        Резервный источник
                      </button>
                   </div>

                   {modeOfOperation === 'reserve' && (
                     <div className="space-y-1.5 p-3 bg-doc-slate-50 rounded-xl border border-doc-slate-100 animate-in fade-in duration-300">
                        <label className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest pl-1 italic">Выбор АВР</label>
                        <select 
                          value={avrOption || 'На объекте имеется собственный АВР'}
                          onChange={e => setAvrOption(e.target.value)}
                          className="admin-input bg-white text-[10px] font-bold"
                        >
                           <option value="На объекте имеется собственный АВР">На объекте имеется собственный АВР</option>
                           <option value="Поставить АВР в отдельном шкафу">Поставить АВР в отдельном шкафу</option>
                           <option value="Поставить АВР, совмещенный с системой управления ДЭС">Поставить АВР, совмещенный с системой управления ДЭС</option>
                           <option value="Установить АВР внутри блок-контейнера">Установить АВР внутри блок-контейнера</option>
                        </select>
                     </div>
                   )}
                </div>

                {/* Параллельная работа */}
                <div className="space-y-3 pt-4 border-t border-doc-slate-100">
                   <p className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Работа ДЭС в параллели</p>
                   <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setParallelWorkType('none')}
                        className={cn("py-2.5 px-4 text-left text-[9px] font-black uppercase rounded-xl border transition-all", parallelWorkType === 'none' ? "bg-brand-blue text-white border-brand-blue shadow-md" : "bg-white text-doc-slate-400 border-doc-slate-200 hover:border-brand-blue/30")}
                      >
                        Не требуется
                      </button>
                      <button 
                        onClick={() => setParallelWorkType('possible')}
                        className={cn("py-2.5 px-4 text-left text-[9px] font-black uppercase rounded-xl border transition-all", parallelWorkType === 'possible' ? "bg-brand-blue text-white border-brand-blue shadow-md" : "bg-white text-doc-slate-400 border-doc-slate-200 hover:border-brand-blue/30")}
                      >
                        Предусмотреть возможность
                      </button>
                      <button 
                        onClick={() => setParallelWorkType('complex')}
                        className={cn("py-2.5 px-4 text-left text-[9px] font-black uppercase rounded-xl border transition-all", parallelWorkType === 'complex' ? "bg-brand-blue text-white border-brand-blue shadow-md" : "bg-white text-doc-slate-400 border-doc-slate-200 hover:border-brand-blue/30")}
                      >
                        Формирование энергокомплекса
                      </button>
                   </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-doc-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-brand-blue uppercase leading-none">Конфигурация Станции 1</p>
                    {powerFilter && (
                      <button 
                        onClick={() => setPowerFilter(null)}
                        className="text-[9px] font-black text-red-500 uppercase bg-red-50 px-2 py-1 rounded hover:bg-red-100"
                      >
                        Сбросить фильтр ({powerFilter} кВт)
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <StationFields config={station1} setConfig={setStation1} specs={loadedSpecs} powerFilter={powerFilter} />
                    <FormattedPriceInput label="Стоимость ДЭС 1" value={station1.price || 0} onChange={(val: number) => setStation1({...station1, price: val})} className="text-brand-blue" />
                  </div>
                </div>

                {(isTwoStations || isThreeStations) && (
                  <div className="space-y-4 pt-4 border-t border-brand-blue/10">
                    <p className="text-[10px] font-black text-brand-blue uppercase leading-none mb-2">Конфигурация Станции 2</p>
                    <div className="space-y-4">
                      <StationFields config={station2} setConfig={setStation2} specs={loadedSpecs} />
                      <FormattedPriceInput label="Стоимость ДЭС 2" value={station2.price || 0} onChange={(val: number) => setStation2({...station2, price: val})} className="text-brand-blue" />
                    </div>
                  </div>
                )}

                {isThreeStations && (
                  <div className="space-y-4 pt-4 border-t border-emerald-600/10">
                    <p className="text-[10px] font-black text-emerald-600 uppercase leading-none mb-2">Конфигурация Станции 3</p>
                    <div className="space-y-4">
                      <StationFields config={station3} setConfig={setStation3} specs={loadedSpecs} />
                      <FormattedPriceInput label="Стоимость ДЭС 3" value={station3.price || 0} onChange={(val: number) => setStation3({...station3, price: val})} className="text-emerald-600" />
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-doc-slate-100">
                  <FormattedPriceInput label="Тариф топлива (руб/л)" value={fuelPrice} onChange={setFuelPrice} className="bg-white" />
                  <FormattedPriceInput label="Тариф ТО (руб/час)" value={toRate} onChange={setToRate} className="bg-white" />
                </div>

                <div className="pt-4 border-t border-doc-slate-100 space-y-8">
                  <ExtraOptions options={additionalOptions} setOptions={setAdditionalOptions} />
                  <ServicesManager services={services} setServices={setServices} />
                  <DeliveryManager delivery={deliveryInfo} setDelivery={setDeliveryInfo} />
                </div>

                <div className="space-y-4 pt-4 border-t border-doc-slate-100">
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-doc-slate-500 uppercase pl-1">Сопроводительное письмо</label>
                      <textarea 
                        placeholder="Введите текст приветствия..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="admin-input min-h-[120px] py-3 leading-relaxed text-xs"
                      />
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-doc-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Назначение ДЭС</p>
                    <button 
                      onClick={() => {
                        setUsePurpose(!usePurpose);
                        const newBlocks = [...blocks];
                        const idx = newBlocks.findIndex(b => b.type === 'purpose');
                        if (idx !== -1) {
                          newBlocks[idx].isVisible = !usePurpose;
                          setBlocks(newBlocks);
                        }
                      }}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors",
                        usePurpose ? 'bg-brand-blue' : 'bg-doc-slate-300'
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                        usePurpose ? 'left-6' : 'left-1'
                      )} />
                    </button>
                  </div>
                  {usePurpose && (
                    <select 
                      value={purposeType}
                      onChange={(e) => setPurposeType(e.target.value as any)}
                      className="admin-input text-xs font-bold"
                    >
                      {Object.entries(PURPOSES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest leading-none">Таблица состава цены</p>
                    <button 
                      onClick={() => setShowCostDetails(!showCostDetails)}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors",
                        showCostDetails ? 'bg-brand-blue' : 'bg-doc-slate-300'
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                        showCostDetails ? 'left-6' : 'left-1'
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
        )}

          {activeTab === 'blocks' && (
            <motion.div 
              key="blocks-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Видимость и порядок</h3>
                <span className="text-[9px] text-brand-blue font-bold">Elementor View</span>
              </div>
              <div className="space-y-2">
                {blocks.map((block: Block, index: number) => (
                  <div 
                    key={block.id}
                    className="flex items-center gap-3 p-3 bg-doc-slate-50 border border-doc-slate-100 rounded-xl"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        disabled={index === 0}
                        onClick={() => {
                          const newBlocks = [...blocks];
                          [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
                          setBlocks(newBlocks);
                        }}
                        className="text-doc-slate-300 hover:text-brand-blue disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={index === blocks.length - 1}
                        onClick={() => {
                          const newBlocks = [...blocks];
                          [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
                          setBlocks(newBlocks);
                        }}
                        className="text-doc-slate-300 hover:text-brand-blue disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-doc-slate-800 uppercase tracking-tight leading-none mb-1">
                        {
                          block.type === 'interactive-container' ? 'Интерактивная схема' : 
                          block.type === 'header' ? 'Шапка КП (Лого)' :
                          block.type === 'contacts' ? 'Контакты' :
                          block.type === 'client-info' ? 'Клиент и менеджер' :
                          block.type === 'message' ? 'Сопроводительное письмо' :
                          block.type === 'purpose' ? 'Назначение ДЭС' :
                          block.type === 'reserve-input' ? 'Режим работы ДЭС' :
                          block.type === 'specs' ? 'Технические параметры' :
                          block.type === 'comparison' ? 'Таблица сравнения' :
                          block.type === 'costs' ? 'Эксплуатационные расходы' :
                          block.type === 'control-panel' ? 'Панель управления' :
                          block.type === 'about' ? 'О компании' :
                          block.type === 'footer' ? 'Подвал КП' :
                          block.type.replace('-', ' ')
                        }
                      </p>
                      <p className="text-[8px] text-doc-slate-400 font-bold uppercase tracking-widest">Блок #{index + 1}</p>
                    </div>

                    <button 
                      onClick={() => {
                        const newBlocks = [...blocks];
                        newBlocks[index].isVisible = !newBlocks[index].isVisible;
                        setBlocks(newBlocks);
                        // Sync legacy flags for backward compatibility
                        if (block.type === 'about') setShowCompanyInfo(newBlocks[index].isVisible);
                        if (block.type === 'purpose') setUsePurpose(newBlocks[index].isVisible);
                        if (block.type === 'control-panel') setUseControlPanel(newBlocks[index].isVisible);
                      }}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        block.isVisible ? "bg-brand-blue text-white shadow-sm" : "bg-white text-doc-slate-300"
                      )}
                    >
                      {block.isVisible ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
               key="profile-tab"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               className="space-y-4"
            >
               <h3 className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Мои данные</h3>
               <div className="space-y-3">
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">ФИО</label>
                     <input value={manager.name} onChange={e => setManager({...manager, name: e.target.value})} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">Email</label>
                     <input value={manager.email} onChange={e => setManager({...manager, email: e.target.value})} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">Телефон</label>
                     <input value={manager.phone} onChange={e => setManager({...manager, phone: e.target.value})} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">URL Фото</label>
                     <input value={manager.photoUrl} onChange={e => setManager({...manager, photoUrl: e.target.value})} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">Пароль</label>
                     <input type="password" value={manager.password || ''} onChange={e => setManager({...manager, password: e.target.value})} className="admin-input" />
                  </div>
                  <button onClick={updateProfile} className="w-full bg-brand-blue text-white font-black py-3 rounded-xl text-[10px] uppercase">Сохранить профиль</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 border-t border-doc-slate-50 space-y-4">
        <button 
          onClick={onSave}
          disabled={!user}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Сохранить КП
        </button>
        {currentProposalId && (
          <button 
            onClick={() => {
              const url = `${window.location.origin}/?id=${currentProposalSlug || currentProposalId}`;
              
              // More robust copy method
              const copyToClipboard = (text: string) => {
                if (navigator.clipboard && window.isSecureContext) {
                  return navigator.clipboard.writeText(text);
                } else {
                  // Fallback for non-secure contexts or older browsers
                  const textArea = document.createElement("textarea");
                  textArea.value = text;
                  textArea.style.position = "fixed";
                  textArea.style.left = "-9999px";
                  textArea.style.top = "0";
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return Promise.resolve();
                  } catch (err) {
                    document.body.removeChild(textArea);
                    return Promise.reject(err);
                  }
                }
              };

              copyToClipboard(url).then(() => {
                alert('Ссылка успешно скопирована!');
              }).catch(() => {
                alert('Не удалось скопировать автоматически. Ссылка: ' + url);
              });
            }}
            className="w-full bg-brand-blue/10 text-brand-blue font-black py-4 rounded-2xl shadow-sm hover:bg-brand-blue hover:text-white transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3"
          >
            <Copy className="w-4 h-4" /> Копировать ссылку
          </button>
        )}
      </div>
    </aside>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2",
      active ? "bg-white border-brand-blue text-brand-blue shadow-sm" : "border-transparent text-doc-slate-400 hover:text-doc-slate-600"
    )}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const CreateQuestionnaireModal = ({ user, onClose, initialData }: any) => {
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [newQ, setNewQ] = useState({ 
    companyName: initialData?.companyName || '', 
    contactPerson: initialData?.contactPerson || '', 
    phone: initialData?.phone || '', 
    email: initialData?.email || '' 
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      let resp;
      if (initialData?.id) {
        resp = await fetch(`/api/questionnaires/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...initialData,
            ...newQ
          })
        });
      } else {
        resp = await fetch('/api/questionnaires', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newQ, managerId: user.id })
        });
      }

      if (resp.ok) {
        if (initialData?.id) onClose();
        else {
          const data = await resp.json();
          setCreatedSlug(data.slug);
        }
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении');
    }
    setLoading(false);
  };

  const copyLink = () => {
    if (!createdSlug) return;
    const url = `${window.location.origin}/?q=${createdSlug}`;
    navigator.clipboard.writeText(url).then(() => alert('Ссылка скопирована!'));
  };

  if (createdSlug) {
    const url = `${window.location.origin}/?q=${createdSlug}`;
    return (
      <div className="p-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-center mb-2 uppercase tracking-tight">Ссылка создана!</h3>
        <p className="text-sm text-slate-500 text-center mb-8 italic">Скопируйте и оправьте клиенту удобным способом</p>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 break-all text-xs font-mono mb-6 text-center select-all">
          {url}
        </div>

        <div className="flex gap-3">
          <button onClick={copyLink} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" /> Копировать
          </button>
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">{initialData ? 'Редактирование' : 'Новый опросный лист'}</h3>
          <p className="text-xs text-brand-blue font-bold opacity-70 italic">{initialData ? 'Изменение данных контакта' : 'Создание уникальной ссылки для клиента'}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-doc-slate-400 uppercase tracking-widest pl-1">Название предприятия</label>
          <div className="relative">
             <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-doc-slate-300" />
             <input required placeholder="ООО 'Северная звезда'" value={newQ.companyName} onChange={e => setNewQ({...newQ, companyName: e.target.value})} className="admin-input bg-doc-slate-50 border-doc-slate-100 pl-11" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-doc-slate-400 uppercase tracking-widest pl-1">Имя контакта</label>
          <div className="relative">
             <User className="absolute left-4 top-3.5 w-4 h-4 text-doc-slate-300" />
             <input required placeholder="Александр Николаевич" value={newQ.contactPerson} onChange={e => setNewQ({...newQ, contactPerson: e.target.value})} className="admin-input bg-doc-slate-50 border-doc-slate-100 pl-11" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-doc-slate-400 uppercase tracking-widest pl-1">Телефон</label>
            <div className="relative">
               <Phone className="absolute left-4 top-3.5 w-3 h-3 text-doc-slate-300" />
               <input required placeholder="+7" value={newQ.phone} onChange={e => setNewQ({...newQ, phone: e.target.value})} className="admin-input bg-doc-slate-50 border-doc-slate-100 pl-11 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-doc-slate-400 uppercase tracking-widest pl-1">Email</label>
            <div className="relative">
               <Mail className="absolute left-4 top-3.5 w-3 h-3 text-doc-slate-300" />
               <input required type="email" placeholder="example@mail.ru" value={newQ.email} onChange={e => setNewQ({...newQ, email: e.target.value})} className="admin-input bg-doc-slate-50 border-doc-slate-100 pl-11 text-xs" />
            </div>
          </div>
        </div>
        <div className="pt-6">
          <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95">
            {loading ? 'Сохранение...' : (initialData ? 'Сохранить изменения' : 'Сформировать ссылку')}
          </button>
        </div>
      </form>
    </div>
  );
};

const QuestionnairesManagement = ({ user, questionnaires, onRefresh, onFill, onEdit, onConvert }: { user: any, questionnaires: QuestionnaireData[], onRefresh: () => void, onFill: (slug: string) => void, onEdit: (q: QuestionnaireData) => void, onConvert: (q: QuestionnaireData) => void }) => {
  const [viewingId, setViewingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот опросный лист?')) return;
    try {
      const resp = await fetch(`/api/questionnaires/${id}`, { method: 'DELETE' });
      if (resp.ok) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/?q=${slug}`;
    navigator.clipboard.writeText(url).then(() => alert('Ссылка скопирована!'));
  };

  const selectedQ = questionnaires.find(q => q.id === viewingId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-doc-slate-50 pb-4">
        <h2 className="text-sm font-black text-brand-blue uppercase tracking-widest flex items-center gap-2 italic">
          <ClipboardCheck className="w-4 h-4" /> Список опросных листов
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-doc-slate-50/50 text-[10px] font-black uppercase text-doc-slate-400 tracking-wider">
              <th className="p-4 pl-6">Клиент / Компания</th>
              {user?.role === 'admin' && <th className="p-4">Менеджер</th>}
              <th className="p-4">Контакт</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Создан</th>
              <th className="p-4 pr-6 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {questionnaires.map(q => (
              <tr key={q.id} className="border-b border-doc-slate-50 hover:bg-doc-blue-50/20 transition-colors">
                <td className="p-4 pl-6">
                  <p className="font-black text-doc-slate-800 text-base italic">{q.companyName}</p>
                </td>
                {user?.role === 'admin' && (
                  <td className="p-4">
                    <p className="text-[10px] font-black text-brand-blue uppercase tracking-tight">{q.managerName || '—'}</p>
                  </td>
                )}
                <td className="p-4">
                  <p className="text-xs font-bold text-doc-slate-600">{q.contactPerson}</p>
                  <p className="text-[10px] text-doc-slate-400">{q.email}</p>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-1 rounded-full border",
                    q.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  )}>
                    {q.status === 'completed' ? 'Заполнен' : 'Ожидает'}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-[11px] font-bold text-doc-slate-400">{new Date(q.createdAt).toLocaleDateString('ru-RU')}</p>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onConvert(q)}
                      className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-all shadow-sm font-black text-[9px] uppercase tracking-widest flex items-center gap-2"
                      title="Создать КП на базе опросного листа"
                    >
                      <Plus className="w-3 h-3" /> Создать КП
                    </button>

                    <button 
                      onClick={() => onFill(q.slug!)}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Заполнить самому"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => onEdit(q)}
                      className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-600 hover:text-white transition-all shadow-sm"
                      title="Редактировать данные контакта"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => copyLink(q.slug!)}
                      className="p-2 bg-accent-light text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                      title="Копировать ссылку"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {q.status === 'completed' && (
                      <button 
                        onClick={() => setViewingId(q.id!)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Просмотреть результаты"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(q.id!)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {questionnaires.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-doc-slate-300 font-bold uppercase italic text-xs tracking-widest">
                  Опросных листов пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {viewingId && selectedQ && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-doc-slate-100 flex justify-between items-center bg-brand-blue text-white">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Результаты опроса</h3>
                  <p className="text-xs opacity-70">{selectedQ.companyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => downloadPDF(selectedQ)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 text-xs font-bold transition-all"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button onClick={() => setViewingId(null)} className="p-2 hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Hidden PDF component for export */}
                <div className="hidden">
                  <QuestionnairePDF questionnaire={selectedQ} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-brand-blue uppercase mb-4 border-b pb-2">Основные данные</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <ResultRow label="ИНН" value={selectedQ.data?.inn} />
                    <ResultRow label="Регион" value={selectedQ.data?.activityRegion} />
                    <ResultRow label="Телефон" value={selectedQ.data?.phone || selectedQ.phone} />
                    <ResultRow label="Email" value={selectedQ.data?.email || selectedQ.email} />
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-brand-blue uppercase mb-4 border-b pb-2">Характеристики ДЭС</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <ResultRow label="Мощность (кВт)" value={selectedQ.data?.powerKw} />
                    <ResultRow label="Мощность (кВА)" value={selectedQ.data?.powerKva} />
                    <ResultRow label="Напряжение" value={selectedQ.data?.voltage === '400' ? '400 В (3 ф)' : '230 В (1 ф)'} />
                    <ResultRow label="Режим работы" value={selectedQ.data?.mode === 'main' ? 'Основной' : 'Резервный'} />
                    <ResultRow label="Тип АВР" value={selectedQ.data?.avr} />
                    <ResultRow label="Исполнение" value={selectedQ.data?.executionType} />
                  </div>
                </div>

                {selectedQ.data?.options && (
                  <div>
                    <h4 className="text-[10px] font-black text-brand-blue uppercase mb-4 border-b pb-2">Опции</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedQ.data.options.electricHeater && <span className="bg-doc-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-doc-slate-600">Эл. подогрев ДВС</span>}
                      {selectedQ.data.options.preheater && <span className="bg-doc-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-doc-slate-600">Webasto</span>}
                      {selectedQ.data.options.batteryCharger && <span className="bg-doc-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-doc-slate-600">Зарядка АКБ</span>}
                      {selectedQ.data.options.energyMeter && <span className="bg-doc-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-doc-slate-600">Учет энергии</span>}
                    </div>
                  </div>
                )}
                
                {selectedQ.data?.otherWishes && (
                  <div>
                    <h4 className="text-[10px] font-black text-brand-blue uppercase mb-4 border-b pb-2">Дополнительно</h4>
                    <p className="text-xs text-doc-slate-600 leading-relaxed bg-doc-slate-50 p-4 rounded-xl">
                      {selectedQ.data.otherWishes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultRow = ({ label, value }: { label: string, value: any }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-doc-slate-400 uppercase tracking-tighter">{label}</p>
    <p className="text-xs font-bold text-doc-slate-800">{value || '—'}</p>
  </div>
);

const QuestionnairePDF = ({ questionnaire }: { questionnaire: QuestionnaireData }) => {
  if (!questionnaire) return null;
  return (
    <div id={`q-pdf-${questionnaire.id}`} className="p-12 bg-white text-slate-800 font-sans max-w-[210mm] mx-auto">
      <div className="flex justify-between items-start border-b-2 border-brand-blue pb-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-brand-blue uppercase mb-2">ОПРОСНЫЙ ЛИСТ</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Дизельные электростанции</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase text-slate-400">Дата заполнения</p>
          <p className="text-sm font-bold">{questionnaire.completedAt ? new Date(questionnaire.completedAt).toLocaleDateString('ru-RU') : '—'}</p>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-black uppercase text-brand-blue border-b border-slate-100 pb-2 mb-6">Данные клиента</h2>
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <PDFItem label="КОМПАНИЯ" value={questionnaire.companyName} />
            <PDFItem label="ИНН" value={questionnaire.data?.inn} />
            <PDFItem label="КОНТАКТНОЕ ЛИЦО" value={questionnaire.contactPerson} />
            <PDFItem label="РЕГИОН" value={questionnaire.data?.region} />
            <PDFItem label="ТЕЛЕФОН" value={questionnaire.data?.phone || questionnaire.phone} />
            <PDFItem label="EMAIL" value={questionnaire.data?.email || questionnaire.email} />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black uppercase text-brand-blue border-b border-slate-100 pb-2 mb-6">Технические характеристики</h2>
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <PDFItem label="МОЩНОСТЬ" value={questionnaire.data?.power} />
            <PDFItem label="НАПРЯЖЕНИЕ" value={questionnaire.data?.voltage} />
            <PDFItem label="РЕЖИМ РАБОТЫ" value={questionnaire.data?.mode} />
            <PDFItem label="ТИП АВР" value={questionnaire.data?.avrType} />
            <PDFItem label="РАЗМЕЩЕНИЕ" value={questionnaire.data?.placement} />
            <PDFItem label="ИСПОЛНЕНИЕ" value={questionnaire.data?.design} />
          </div>
        </section>

        {questionnaire.data?.options && questionnaire.data.options.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase text-brand-blue border-b border-slate-100 pb-2 mb-6">Дополнительные опции</h2>
            <div className="flex flex-wrap gap-3">
              {questionnaire.data.options.map((opt: string, i: number) => (
                <div key={i} className="bg-slate-50 border border-slate-100 px-3 py-2 rounded text-[10px] font-bold">
                  {opt}
                </div>
              ))}
            </div>
          </section>
        )}

        {questionnaire.data?.description && (
          <section>
            <h2 className="text-xs font-black uppercase text-brand-blue border-b border-slate-100 pb-2 mb-4">Дополнительная информация</h2>
            <div className="bg-slate-50 p-6 rounded-xl text-xs leading-relaxed italic text-slate-600">
              {questionnaire.data.description}
            </div>
          </section>
        )}
      </div>

      <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-end">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase">Менеджер проекта</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-blue/5 rounded-lg border border-brand-blue/10 flex items-center justify-center font-black text-brand-blue">
               {questionnaire.managerName?.[0] || 'М'}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">{questionnaire.managerName || 'Менеджер ГК Дизель'}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">ГК ДИЗЕЛЬ — 2026</p>
          <p className="text-[8px] font-bold text-slate-300">Сгенерировано автоматически</p>
        </div>
      </div>
    </div>
  );
};

const PDFItem = ({ label, value }: { label: string, value: any }) => (
  <div className="space-y-1">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-xs font-bold text-slate-800 uppercase">{value || '—'}</p>
  </div>
);

const downloadPDF = (q: QuestionnaireData) => {
  const element = document.getElementById(`q-pdf-${q.id}`);
  if (!element) return;
  
  const opt = {
    margin: 10,
    filename: `Questionnaire_${q.companyName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
  };

  html2pdf().from(element).set(opt).save();
};

const FormattedPriceInput = ({ value, onChange, label, className = "" }: any) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(value ? value.toLocaleString('ru-RU') : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, '');
    const num = parseInt(raw);
    if (!isNaN(num) || raw === '') {
      onChange(isNaN(num) ? 0 : num);
    }
  };

  return (
    <div className="space-y-1">
      {label && <label className="text-[10px] font-black underline uppercase">{label}</label>}
      <input 
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="0"
        className={cn("admin-input font-black", className)}
      />
    </div>
  );
};

const AccountsManagement = ({ currentUser }: { currentUser: User }) => {
  const [managers, setManagers] = useState<ManagerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newManager, setNewManager] = useState({ name: '', email: '', phone: '', password: '', role: 'manager' });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const resp = await fetch('/api/managers');
      if (resp.ok) setManagers(await resp.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newManager)
      });
      if (resp.ok) {
        setShowAdd(false);
        setNewManager({ name: '', email: '', phone: '', password: '', role: 'manager' });
        fetchManagers();
      }
    } catch (e) { alert('Ошибка при создании'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот аккаунт?')) return;
    try {
      const resp = await fetch(`/api/managers/${id}`, { method: 'DELETE' });
      if (resp.ok) fetchManagers();
    } catch (e) { alert('Ошибка при удалении'); }
  };

  if (loading) return <div className="text-center p-4">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Список менеджеров</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="text-brand-blue p-1 hover:bg-brand-blue/5 rounded">
          {showAdd ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-doc-slate-50 p-4 rounded-xl space-y-3 shadow-inner">
          <input placeholder="Имя" value={newManager.name} onChange={e => setNewManager({...newManager, name: e.target.value})} className="admin-input bg-white text-xs" required />
          <input placeholder="Email" type="email" value={newManager.email} onChange={e => setNewManager({...newManager, email: e.target.value})} className="admin-input bg-white text-xs" required />
          <input placeholder="Пароль" type="password" value={newManager.password} onChange={e => setNewManager({...newManager, password: e.target.value})} className="admin-input bg-white text-xs" required />
          <select value={newManager.role} onChange={e => setNewManager({...newManager, role: e.target.value})} className="admin-input bg-white text-xs">
            <option value="manager">Менеджер</option>
            <option value="admin">Администратор</option>
          </select>
          <button type="submit" className="w-full bg-brand-blue text-white font-black py-2 rounded text-[10px] uppercase tracking-wide">Добавить</button>
        </form>
      )}

      <div className="space-y-2">
        {managers.map(m => (
          <div key={m.id} className="p-3 bg-white border border-doc-slate-100 rounded-xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-doc-slate-800 leading-none mb-1">{m.name}</p>
                <p className="text-[9px] text-doc-slate-400 font-bold">{m.email}</p>
                <span className={cn(
                  "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                  m.role === 'admin' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                )}>
                  {m.role === 'admin' ? 'Админ' : 'Менеджер'}
                </span>
              </div>
              <div className="flex gap-1">
                 <button onClick={() => handleDelete(m.id!)} className="p-1.5 text-doc-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-doc-slate-50 pt-2">
               <div className="flex gap-4">
                  <div className="text-center">
                     <p className="text-[8px] text-doc-slate-400 font-black uppercase">КП</p>
                     <p className="text-xs font-black text-brand-blue">{m.proposalCount || 0}</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[8px] text-doc-slate-400 font-black uppercase">Просм.</p>
                     <p className="text-xs font-black text-emerald-600">{m.totalViews || 0}</p>
                  </div>
               </div>
               <div className="text-[9px] font-bold text-doc-slate-300">
                  {m.password ? 'Пароль установлен' : 'Без пароля'}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const StationFields = ({ config, setConfig, specs, powerFilter }: any) => {
  const currentMan = specs.find((m: any) => m.id === config.manufacturerId) || specs[0] || { models: [] };
  const filteredModels = powerFilter ? currentMan.models.filter((m: any) => Math.abs(m.nominalPowerKw - powerFilter) <= Math.max(powerFilter * 0.2, 5)) : currentMan.models;

  return (
    <div className="space-y-3">
      <select 
        value={config.manufacturerId}
        onChange={(e) => {
          const selectedMan = specs.find((m: any) => m.id === e.target.value)!;
          setConfig({ ...config, manufacturerId: e.target.value, modelName: selectedMan.models[0].name });
        }}
        className="admin-input text-xs font-bold"
      >
        {specs.map((m: any) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <select 
        value={config.modelName}
        onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
        className="admin-input text-xs font-bold"
      >
        {filteredModels.map((m: any) => (
          <option key={m.name} value={m.name}>{m.nominalPowerKw} кВт ({m.engineModel})</option>
        ))}
        {powerFilter && filteredModels.length === 0 && (
          <option disabled>Нет подходящих моделей ({powerFilter} кВт)</option>
        )}
      </select>

      <select 
        value={config.variant}
        onChange={(e) => setConfig({ ...config, variant: e.target.value })}
        className="admin-input text-xs font-bold"
      >
        <option value="open">На раме (открытая)</option>
        <option value="enclosure">В кожухе</option>
        <option value="container">В контейнере</option>
        <option value="sever">В контейнере Север</option>
        <option value="mobile">Передвижная</option>
      </select>

      {(config.variant === 'container' || config.variant === 'sever') && (
        <div className="space-y-1.5 p-3 bg-doc-slate-50 rounded-xl border border-doc-slate-100">
          <label className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest pl-1">Управление контейнером</label>
          <select 
            value={config.automationType || 'manual'} 
            onChange={e => setConfig({...config, automationType: e.target.value})}
            className="admin-input bg-white text-[10px] font-bold"
          >
            <option value="manual">С ручным управлением</option>
            <option value="auto">С автоматическим управлением</option>
          </select>
        </div>
      )}

      {config.variant === 'mobile' && (
        <div className="space-y-1.5 p-3 bg-doc-slate-50 rounded-xl border border-doc-slate-100">
          <label className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest pl-1">Тип перемещения</label>
          <select 
            value={config.mobileType || 'На шасси автомобильного прицепа'} 
            onChange={e => setConfig({...config, mobileType: e.target.value})}
            className="admin-input bg-white text-[10px] font-bold"
          >
            <option value="На шасси автомобильного / тракторного прицепа">На шасси автомобильного / тракторного прицепа</option>
            <option value="На шасси грузового автомобиля">На шасси грузового автомобиля</option>
            <option value="На салазках">На салазках</option>
          </select>
        </div>
      )}
    </div>
  );
};

const ExtraOptions = ({ options, setOptions }: any) => {
  const [selectedPre, setSelectedPre] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState(0);

  const addOption = (preId: string) => {
    if (!preId) return;
    const opt = PREDEFINED_OPTIONS.find(o => o.id === preId);
    if (!opt) return;
    if (options.find((o: any) => o.id === preId)) return; // Already added
    setOptions([...options, { id: opt.id, name: opt.name, price: 0, isIncluded: false }]);
    setSelectedPre('');
  };

  const addCustom = () => {
    if (!customName) return;
    setOptions([...options, { id: 'custom-' + Date.now(), name: customName, price: customPrice, isIncluded: false }]);
    setCustomName('');
    setCustomPrice(0);
    setShowCustom(false);
  };

  const removeOption = (id: string) => {
    setOptions(options.filter((o: any) => o.id !== id));
  };

  const updateOption = (id: string, field: string, value: any) => {
    setOptions(options.map((o: any) => o.id === id ? { ...o, [field]: value } : o));
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-black text-brand-blue uppercase tracking-widest border-b border-doc-slate-100 pb-2 flex items-center gap-2">
         <Settings className="w-3 h-3"/> Доп. опции
      </p>

      <div className="flex gap-2">
        <select 
          value={selectedPre}
          onChange={e => {
            if (e.target.value === 'custom') {
              setShowCustom(true);
              setSelectedPre('');
            } else {
              addOption(e.target.value);
            }
          }}
          className="admin-input flex-1 text-xs"
        >
          <option value="">+ Выберите опцию...</option>
          {PREDEFINED_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id} disabled={!!options.find((o: any) => o.id === opt.id)}>
              {opt.name}
            </option>
          ))}
          <option value="custom" className="text-brand-blue font-bold">Своя опция...</option>
        </select>
      </div>

      {showCustom && (
        <div className="p-4 bg-brand-blue-op5 rounded-2xl border border-brand-blue/10 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-brand-blue uppercase">Название опции</label>
            <input 
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="admin-input bg-white text-xs"
              placeholder="Напр: Дополнительная шумоизоляция"
            />
          </div>
          <div className="flex gap-3">
             <FormattedPriceInput label="Цена" value={customPrice} onChange={setCustomPrice} className="bg-white text-xs" />
             <div className="flex items-end gap-2 flex-1">
                <button 
                  onClick={addCustom}
                  className="w-full h-10 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase hover:bg-brand-blue-dark transition-all"
                >
                  Добавить
                </button>
                <button 
                  onClick={() => setShowCustom(false)}
                  className="h-10 px-4 bg-doc-slate-100 text-doc-slate-400 rounded-xl hover:bg-doc-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {options.map((opt: any) => {
          const schema = PREDEFINED_OPTIONS.find(o => o.id === opt.id);
          return (
            <div key={opt.id} className="p-4 bg-white rounded-2xl border border-brand-blue/10 shadow-sm space-y-3 group relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black text-doc-slate-800 uppercase leading-tight pr-8">{opt.name}</span>
                <button 
                  onClick={() => removeOption(opt.id)}
                  className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {schema?.subOptions && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest italic">Параметры</label>
                  <select 
                    value={opt.subValue || schema.subOptions[0]} 
                    onChange={e => updateOption(opt.id, 'subValue', e.target.value)}
                    className="admin-input text-xs bg-doc-slate-50 border-none"
                  >
                    {schema.subOptions.map(so => <option key={so} value={so}>{so}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                 <FormattedPriceInput value={opt.price || 0} onChange={(val: number) => updateOption(opt.id, 'price', val)} className="bg-doc-slate-50 border-none text-brand-blue" />
                 <div className="flex items-end pb-1.5 flex-1 justify-end">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                      <input 
                        type="checkbox" 
                        className="accent-emerald-500"
                        checked={opt.isIncluded}
                        onChange={e => updateOption(opt.id, 'isIncluded', e.target.checked)}
                      />
                      <span className="text-[9px] font-black uppercase text-emerald-600">Включено</span>
                    </label>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ServicesManager = ({ services, setServices }: any) => {
  const [selectedPre, setSelectedPre] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState(0);

  const addService = (preId: string) => {
    if (!preId) return;
    const srv = PREDEFINED_SERVICES.find(s => s.id === preId);
    if (!srv) return;
    if (services.find((s: any) => s.id === preId)) return;
    setServices([...services, { id: srv.id, name: srv.name, price: 0, isIncluded: false }]);
    setSelectedPre('');
  };

  const addCustom = () => {
    if (!customName) return;
    setServices([...services, { id: 'custom-' + Date.now(), name: customName, price: customPrice, isIncluded: false }]);
    setCustomName('');
    setCustomPrice(0);
    setShowCustom(false);
  };

  const removeService = (id: string) => {
    setServices(services.filter((s: any) => s.id !== id));
  };

  const updateService = (id: string, field: string, value: any) => {
    setServices(services.map((s: any) => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-black text-brand-blue uppercase tracking-widest border-b border-doc-slate-100 pb-2 flex items-center gap-2">
         <ShieldCheck className="w-3 h-3"/> Доп. услуги
      </p>

      <div className="flex gap-2">
        <select 
          value={selectedPre}
          onChange={e => {
            if (e.target.value === 'custom') {
              setShowCustom(true);
              setSelectedPre('');
            } else {
              addService(e.target.value);
            }
          }}
          className="admin-input flex-1 text-xs"
        >
          <option value="">+ Выберите услугу...</option>
          {PREDEFINED_SERVICES.map(srv => (
            <option key={srv.id} value={srv.id} disabled={!!services.find((s: any) => s.id === srv.id)}>
              {srv.name}
            </option>
          ))}
          <option value="custom" className="text-brand-blue font-bold">Своя услуга...</option>
        </select>
      </div>

      {showCustom && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-emerald-600 uppercase">Название услуги</label>
            <input 
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="admin-input bg-white text-xs"
              placeholder="Напр: Монтаж кабельных линий"
            />
          </div>
          <div className="flex gap-3">
             <FormattedPriceInput label="Цена" value={customPrice} onChange={setCustomPrice} className="bg-white text-xs" />
             <div className="flex items-end gap-2 flex-1">
                <button 
                  onClick={addCustom}
                  className="w-full h-10 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all"
                >
                  Добавить
                </button>
                <button 
                  onClick={() => setShowCustom(false)}
                  className="h-10 px-4 bg-doc-slate-100 text-doc-slate-400 rounded-xl hover:bg-doc-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {services.map((srv: any) => (
          <div key={srv.id} className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-3 group relative overflow-hidden">
            <div className="flex justify-between items-start">
               <span className="text-xs font-black text-doc-slate-800 uppercase leading-tight pr-8">{srv.name}</span>
               <button 
                  onClick={() => removeService(srv.id)}
                  className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
            </div>
            <div className="flex gap-3">
               <FormattedPriceInput value={srv.price || 0} onChange={(val: number) => updateService(srv.id, 'price', val)} className="bg-emerald-50 border-none text-emerald-600" />
               <div className="flex items-end pb-1.5 flex-1 justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-emerald-500"
                      checked={srv.isIncluded}
                      onChange={e => updateService(srv.id, 'isIncluded', e.target.checked)}
                    />
                    <span className="text-[9px] font-black uppercase text-emerald-600">Включено</span>
                  </label>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeliveryManager = ({ delivery, setDelivery }: any) => {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-black text-brand-blue uppercase tracking-widest border-b border-doc-slate-100 pb-2 flex items-center gap-2">
         <Globe className="w-3 h-3"/> Доставка
      </p>
      <div className="space-y-4">
        <div className="flex gap-1 p-1 bg-doc-slate-100 rounded-xl overflow-hidden">
           <button 
             onClick={() => setDelivery({...delivery, type: 'pickup'})}
             className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", delivery.type === 'pickup' ? "bg-white text-brand-blue shadow-sm" : "text-doc-slate-400 hover:text-doc-slate-600")}
           >
             Самовывоз
           </button>
           <button 
             onClick={() => setDelivery({...delivery, type: 'delivery'})}
             className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", delivery.type === 'delivery' ? "bg-white text-brand-blue shadow-sm" : "text-doc-slate-400 hover:text-doc-slate-600")}
           >
             Наша доставка
           </button>
        </div>

        {delivery.type === 'delivery' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-1 p-1 bg-doc-slate-50 rounded-xl border border-doc-slate-100">
               <button 
                 onClick={() => setDelivery({...delivery, transportType: 'auto'})}
                 className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", delivery.transportType === 'auto' ? "bg-brand-blue text-white shadow-sm" : "text-doc-slate-400")}
               >
                 Авто
               </button>
               <button 
                 onClick={() => setDelivery({...delivery, transportType: 'rail'})}
                 className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", delivery.transportType === 'rail' ? "bg-brand-blue text-white shadow-sm" : "text-doc-slate-400")}
               >
                 Ж/Д
               </button>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest pl-1 italic">Адрес / Регион</label>
              <input value={delivery.address} onChange={e => setDelivery({...delivery, address: e.target.value})} className="admin-input text-xs" placeholder="Санкт-Петербург" />
            </div>
            <div className="flex gap-4">
               <div className="flex-1 space-y-1">
                 <label className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest pl-1 italic">Стоимость</label>
                 <FormattedPriceInput value={delivery.price || 0} onChange={(val: number) => setDelivery({...delivery, price: val})} className="bg-white text-xs" />
               </div>
               <div className="flex items-end pb-1.5 px-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="accent-brand-blue"
                      checked={delivery.isIncluded}
                      onChange={e => setDelivery({...delivery, isIncluded: e.target.checked})}
                    />
                    <span className="text-[9px] font-black uppercase text-brand-blue">В цене ДЭС</span>
                  </label>
               </div>
            </div>
          </div>
        )}

        {delivery.type === 'pickup' && (
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
             <p className="text-[10px] text-blue-600 font-bold italic leading-relaxed text-center">Самовывоз со склада ООО «Компания Дизель»:</p>
             <p className="text-[10px] text-dark-blue font-black uppercase tracking-tight text-center mt-1">г. Тутаев, ул. Промзона, 10</p>
             <p className="text-[9px] text-emerald-600 font-black uppercase text-center mt-1">— Бесплатно</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PreviewArea = ({ 
  blocks, station1, station2, station3, p1, p2, p3, manager, fuelPrice, toRate, 
  showCompanyInfo, showCostDetails, usePurpose, useControlPanel, purposeType, v1, v2, v3, 
  a1, m1, a2, m2, a3, m3,
  modeOfOperation, avrOption, parallelWorkType, services = [],
  rec1, rec2, rec3, onBack, isClientView,
  user, onUpdateBlocks,
  clientName, clientPersonName, validUntil, coverLetter, 
  additionalOptions = [], 
  deliveryInfo = { type: 'pickup', address: '', price: 0, isIncluded: false }
}: any) => {
  const [zoom, setZoom] = useState(1.25); 
  const [activeStationTab, setActiveStationTab] = useState(1);

  const updateBlockConfig = (blockId: string, config: any) => {
    onUpdateBlocks((prev: any) => prev.map((b: any) => b.id === blockId ? { ...b, config } : b));
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1.25);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('proposal-document');
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `KP_Diesel_${station1.nominalPowerKw}kW.pdf`,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        onclone: (clonedDoc: Document) => {
          clonedDoc.body.classList.add('pdf-capture');
          const clonedElement = clonedDoc.getElementById('proposal-document');
          if (clonedElement) {
            clonedElement.classList.add('pdf-mode');
          }
          
          // Fix for html2canvas crashing on oklch/oklab colors (Tailwind 4 default)
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const originalEl = element.getElementsByTagName('*')[i] as HTMLElement;
            
            if (originalEl) {
              const style = window.getComputedStyle(originalEl);
              const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
              
              props.forEach(prop => {
                const value = style[prop as any];
                // If it's a modern color function, html2canvas will crash. 
                // We attempt to set a safe fallback or just let it be if it's already rgb/hex.
                if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('color('))) {
                  // Fallback to a safe hex if it's a brand related element, otherwise black/inherit
                  el.style.setProperty(prop, '#002F87', 'important'); 
                }
              });
            }
          }

          // Also strip from any style tags to be safe
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            styleTags[i].innerHTML = styleTags[i].innerHTML
              .replace(/oklch\([^)]+\)/g, '#002F87')
              .replace(/oklab\([^)]+\)/g, '#002F87')
              .replace(/color-mix\([^)]+\)/g, '#002F87')
              .replace(/color\([^)]+\)/g, '#002F87');
          }
        }
      },
      jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.page-break-avoid', 'img', 'table', 'tr'] }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className={cn(
      "bg-[#ccd5de] p-10 overflow-y-auto no-scrollbar print:p-0 print:bg-white relative print:overflow-visible print:h-auto",
      isClientView ? "w-full" : "flex-1"
    )}>
      {isClientView && !user && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 no-print pointer-events-none z-50">
          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest shadow-sm pointer-events-auto border border-white/5 italic">
            Режим просмотра КП
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      {!isClientView && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/50 no-print z-50">
           <button onClick={handleZoomOut} className="p-2 hover:bg-doc-slate-100 rounded-full transition-colors text-doc-slate-600">
             <Minus className="w-5 h-5" />
           </button>
           <div className="h-6 w-[1px] bg-doc-slate-200 mx-2" />
           <button onClick={handleZoomReset} className="px-3 hover:bg-doc-slate-100 rounded-lg transition-colors text-xs font-black text-brand-blue uppercase">
             {Math.round(zoom * 100 / 1.25)}%
           </button>
           <div className="h-6 w-[1px] bg-doc-slate-200 mx-2" />
           <button onClick={handleZoomIn} className="p-2 hover:bg-doc-slate-100 rounded-full transition-colors text-doc-slate-600">
             <Plus className="w-5 h-5" />
           </button>
        </div>
      )}

      {(onBack && (!isClientView || user)) && (
          <button 
            onClick={onBack}
            className="fixed top-6 right-24 md:right-32 p-4 bg-white text-doc-slate-600 rounded-full shadow-lg no-print transition-all z-50 flex items-center gap-2 group"
          >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden md:inline text-xs font-black uppercase">Назад в панель</span>
        </button>
      )}

  <div className="flex justify-center items-start min-h-full">
    <div 
      id="proposal-document" 
      style={{ transform: `scale(${zoom})` }}
      className="bg-white w-[210mm] shadow-brand-blue origin-top transition-transform print:transform-none print:shadow-none print:w-full flex flex-col pt-0 pb-12"
    >
      <div className="p-0 space-y-0 flex-1 flex flex-col">
        {blocks.filter((b: Block) => b.isVisible).map((block: Block) => {
          switch (block.type) {
            case 'interactive-container':
              return (
                <div key={block.id} className="page-break-avoid page-break-before">
                  <InteractiveContainer 
                    config={block.config}
                    onUpdateConfig={(config) => updateBlockConfig(block.id, config)}
                    isAdmin={user?.role === 'admin'}
                  />
                </div>
              );
            case 'header':
              return <Header key={block.id} />;
            case 'contacts':
              return <div key={block.id} className="px-10 pt-8"><ContactsBar /></div>;
            case 'client-info':
              return (
                <div key={block.id} className="px-10 pt-2 flex justify-between items-start page-break-avoid relative">
                  <div className="space-y-4 flex-1">
                    <div className="text-[10px] text-doc-slate-500 leading-relaxed text-left px-6 py-4 bg-doc-slate-50 rounded-sm border-l-4 border-brand-blue font-medium italic uppercase max-w-sm">
                      Дизельные электростанции в данном предложении спроектированы для обеспечения максимальной надежности 
                      в самых суровых российских условиях. {station2 ? 'Сравнение представленных моделей позволит выбрать оптимальное решение.' : ''}
                    </div>
                    <div className="flex flex-col">
                       <h1 className="text-2xl font-black text-brand-blue uppercase tracking-tighter border-b border-doc-slate-100 pb-2">
                        Коммерческое предложение
                       </h1>
                       {coverLetter && (
                         <div className="mt-4 p-4 bg-emerald-50/30 border-l-2 border-emerald-500/20 text-[10px] text-doc-slate-600 italic leading-relaxed whitespace-pre-wrap">
                            {coverLetter}
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end pt-4 min-w-[240px]">
                     <div className="text-right">
                       <p className="text-[7px] text-doc-slate-400 font-black uppercase tracking-[0.2em] mb-1">Заказчик / Компания</p>
                       <p className="text-sm font-black text-brand-blue uppercase tracking-tighter leading-none">{clientName || 'НАЗВАНИЕ КОМПАНИИ'}</p>
                       {clientPersonName && <p className="text-[10px] font-bold text-doc-slate-800 mt-1 uppercase tracking-tight">{clientPersonName}</p>}
                       {validUntil && (
                         <div className="flex items-center gap-1.5 justify-end mt-4 text-[9px] font-bold text-doc-slate-400">
                           <Calendar className="w-3 h-3" />
                           <span>ДЕЙСТВИТЕЛЬНО ДО: <span className="text-brand-blue font-black">{new Date(validUntil).toLocaleDateString('ru-RU')}</span></span>
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              );
            case 'message':
               return null; 
            case 'reserve-input':
               return (
                 <div key={block.id} className="px-10 page-break-avoid mt-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start border-t-2 border-brand-blue/10 pt-8">
                       <div className="flex-1 space-y-5">
                          <h3 className="text-xl font-black text-brand-blue uppercase leading-tight border-b-2 border-brand-blue pb-2 flex items-center gap-3">
                            <Zap className="w-6 h-6" /> 
                            Режим работы ДЭС
                          </h3>
                          
                          <div className="flex items-center gap-4">
                             <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", modeOfOperation === 'main' ? "bg-brand-blue text-white shadow-md" : "bg-doc-slate-50 text-doc-slate-400 border border-doc-slate-100")}>
                                {modeOfOperation === 'main' ? 'Основной источник' : 'Резервный источник'}
                             </div>
                             {parallelWorkType !== 'none' && (
                               <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                  <Layers className="w-3.5 h-3.5" />
                                  {parallelWorkType === 'possible' ? 'Параллельная работа возможна' : 'Параллельный энергокомплекс'}
                               </div>
                             )}
                          </div>

                          <div className="p-5 bg-doc-slate-50 border border-doc-slate-100 rounded-2xl space-y-4">
                             <p className="text-[12px] font-bold text-doc-slate-800 leading-relaxed italic border-l-2 border-brand-blue/30 pl-4">
                                {modeOfOperation === 'main' 
                                  ? "Дизель-генератор выступает как преимущественный источник электроэнергии для объекта. Система управления настроена на непрерывную работу с высокими нагрузками." 
                                  : "Дизель-генератор используется как вспомогательный или аварийный источник при отключении основной сети."}
                             </p>
                             
                             {modeOfOperation === 'reserve' && avrOption && (
                               <div className="pt-2">
                                  <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-2 flex items-center gap-2">
                                     <ArrowRight className="w-3 h-3" /> Конфигурация АВР:
                                  </p>
                                  <div className="p-3 bg-white rounded-xl border border-doc-slate-200">
                                     <p className="text-[11px] font-black text-doc-slate-700 italic leading-tight">
                                        «{avrOption}»
                                     </p>
                                  </div>
                               </div>
                             )}
                          </div>
                       </div>
                       
                       <div className="w-full md:w-64 h-64 bg-white border border-doc-slate-100 rounded-3xl overflow-hidden p-2 shadow-sm shrink-0 flex items-center justify-center">
                          <img 
                            src={modeOfOperation === 'main' ? "/input_file_3.png" : "/input_file_1.png"} 
                            className="w-full h-full object-contain"
                            alt="Mode"
                            referrerPolicy="no-referrer"
                          />
                       </div>
                    </div>
                 </div>
               );
            case 'purpose':
              return usePurpose && (
                <div key={block.id} className="px-10 page-break-avoid bg-[#f8fafc] border border-doc-slate-100 p-6 rounded-sm text-[10px] text-doc-slate-700 leading-relaxed space-y-3 font-semibold text-justify mx-10">
                  {PURPOSES[purposeType as keyof typeof PURPOSES].text.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              );
            case 'specs':
              return (
                <div key={block.id} className="px-10 space-y-8 page-break-avoid">
                  {/* Tabs for Web View */}
                  {(station2 || station3) && (
                    <div className="no-print mb-8 px-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-[1px] flex-1 bg-doc-slate-200" />
                        <span className="text-[9px] font-black text-doc-slate-400 uppercase tracking-[0.2em]">Выберите вариант для сравнения</span>
                        <div className="h-[1px] flex-1 bg-doc-slate-200" />
                      </div>
                      <div className="flex p-1.5 bg-doc-slate-100/80 rounded-2xl gap-1.5 border border-doc-slate-200 shadow-inner">
                        <button 
                          onClick={() => setActiveStationTab(1)}
                          className={cn(
                            "flex-1 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl flex flex-col items-center gap-1.5",
                            activeStationTab === 1 
                              ? "bg-brand-blue text-white shadow-[0_8px_20px_rgba(0,41,107,0.25)] ring-1 ring-brand-blue/20" 
                              : "text-doc-slate-500 hover:bg-white/50 hover:text-doc-slate-700"
                          )}
                        >
                          <span className={cn(
                            "text-[8px] tracking-widest font-bold uppercase",
                            activeStationTab === 1 ? "text-white/60" : "text-doc-slate-400"
                          )}>Вариант 01</span>
                          <span className="flex items-center gap-1.5 font-bold">
                            {station1.name} 
                            {rec1 && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />}
                          </span>
                        </button>
                        
                        {station2 && (
                          <button 
                            onClick={() => setActiveStationTab(2)}
                            className={cn(
                              "flex-1 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl flex flex-col items-center gap-1.5",
                              activeStationTab === 2 
                                ? "bg-brand-blue text-white shadow-[0_8px_20px_rgba(0,41,107,0.25)] ring-1 ring-brand-blue/20" 
                                : "text-doc-slate-500 hover:bg-white/50 hover:text-doc-slate-700"
                            )}
                          >
                            <span className={cn(
                              "text-[8px] tracking-widest font-bold uppercase",
                              activeStationTab === 2 ? "text-white/60" : "text-doc-slate-400"
                            )}>Вариант 02</span>
                            <span className="flex items-center gap-1.5 font-bold">
                              {station2.name} 
                              {rec2 && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />}
                            </span>
                          </button>
                        )}

                        {station3 && (
                          <button 
                            onClick={() => setActiveStationTab(3)}
                            className={cn(
                              "flex-1 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl flex flex-col items-center gap-1.5",
                              activeStationTab === 3 
                                ? "bg-brand-blue text-white shadow-[0_8px_20px_rgba(0,41,107,0.25)] ring-1 ring-brand-blue/20" 
                                : "text-doc-slate-500 hover:bg-white/50 hover:text-doc-slate-700"
                            )}
                          >
                            <span className={cn(
                              "text-[8px] tracking-widest font-bold uppercase",
                              activeStationTab === 3 ? "text-white/60" : "text-doc-slate-400"
                            )}>Вариант 03</span>
                            <span className="flex items-center gap-1.5 font-bold">
                              {station3.name} 
                              {rec3 && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "space-y-8",
                    (station2 || station3) ? (activeStationTab === 1 ? "block" : "hidden print:block") : "block"
                  )}>
                     <SpecSection 
                        label={station1.name} 
                        model={station1} 
                        variant={v1} 
                        automationType={a1}
                        mobileType={m1}
                        price={p1} 
                        hideLabelWeb={!!(station2 || station3)} 
                        recommended={rec1}
                        additionalOptions={additionalOptions}
                        services={services}
                        deliveryInfo={deliveryInfo}
                        showCostDetails={showCostDetails}
                     />
                  </div>

                  {/* Station 2 */}
                  {station2 && (
                    <div className={cn(
                      "space-y-8",
                      activeStationTab === 2 ? "block" : "hidden print:block"
                    )}>
                      <SpecSection 
                        label={station2.name} 
                        model={station2} 
                        variant={v2} 
                        automationType={a2}
                        mobileType={m2}
                        price={p2} 
                        hideLabelWeb={true} 
                        recommended={rec2}
                        additionalOptions={additionalOptions}
                        services={services}
                        deliveryInfo={deliveryInfo}
                        showCostDetails={showCostDetails}
                      />
                    </div>
                  )}

                  {/* Station 3 */}
                  {station3 && (
                    <div className={cn(
                      "space-y-8",
                      activeStationTab === 3 ? "block" : "hidden print:block"
                    )}>
                      <SpecSection 
                        label={station3.name} 
                        model={station3} 
                        variant={v3} 
                        automationType={a3}
                        mobileType={m3}
                        price={p3} 
                        hideLabelWeb={true} 
                        recommended={rec3}
                        additionalOptions={additionalOptions}
                        services={services}
                        deliveryInfo={deliveryInfo}
                        showCostDetails={showCostDetails}
                      />
                    </div>
                  )}
                </div>
              );
            case 'comparison':
              return (station2 || station3) && (
                <div key={block.id} className="px-10 page-break-avoid page-break-before">
                  <Comparison station1={station1} station2={station2} station3={station3} />
                </div>
              );
            case 'costs':
              return (
                <div key={block.id} className="px-10 page-break-avoid">
                  <div className={cn("grid gap-8", station3 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                    <div className="page-break-avoid">
                      <OperatingCosts label={station2 ? station1.name : ""} model={station1} fuelPrice={fuelPrice} toRate={toRate} />
                    </div>
                    {station2 && (
                      <div className="page-break-avoid">
                        <OperatingCosts label={station2.name} model={station2} fuelPrice={fuelPrice} toRate={toRate} />
                      </div>
                    )}
                    {station3 && (
                      <div className="page-break-avoid">
                        <OperatingCosts label={station3.name} model={station3} fuelPrice={fuelPrice} toRate={toRate} />
                      </div>
                    )}
                  </div>
                </div>
              );
            case 'control-panel':
              return useControlPanel && (
                <div key={block.id} className="px-10 page-break-avoid page-break-before">
                  <ControlPanelSection />
                </div>
              );
            case 'about':
              return showCompanyInfo && (
                <div key={block.id} className="px-10 page-break-avoid page-break-before">
                  <AboutCompany />
                </div>
              );
            case 'footer':
              return (
                <div key={block.id} className="px-10 mt-8 page-break-avoid">
                  <div className="text-[9px] text-doc-slate-400 text-justify leading-relaxed border-t border-doc-slate-100 pt-3 italic mb-2 font-bold">
                    <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
                    Характеристики являются справочными. Окончательные данные фиксируются в договоре.
                  </div>
                  <FooterMini />
                </div>
              );
            default:
              return null;
          }
        })}
        
        {/* Removed duplicate global options/delivery block as it is now in each spec section */}
      </div>
    </div>
  </div>
      
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-6 no-print z-50">
         <div className="flex flex-row gap-3">
           <button 
            onClick={handlePrint}
            className="w-14 h-14 bg-white text-brand-blue border border-brand-blue/20 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
            title="Печать"
           >
             <Printer className="w-6 h-6 group-hover:rotate-6 transition-transform" />
           </button>
           <button 
            onClick={handleDownloadPdf}
            className="w-14 h-14 bg-brand-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
            title="Скачать PDF"
           >
             <Download className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
           </button>
         </div>

         <div className="bg-brand-blue px-8 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-5 group transition-all scale-125 origin-right">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-800 relative shrink-0">
               {manager.photoUrl ? (
                 <img src={manager.photoUrl} alt="Manager" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-7 h-7 text-white m-auto mt-3" />
               )}
               <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-full" />
            </div>
            <div className="text-left">
               <p className="text-[7px] text-white/70 font-black uppercase tracking-[0.2em] leading-none mb-1">Ваш менеджер</p>
               <p className="text-[12px] font-black text-white leading-tight mb-1">{manager.name || 'ВАШ МЕНЕДЖЕР'}</p>
               <p className="text-[10px] font-bold text-white/90 leading-none">{manager.phone || '+7 (4852) 37-01-01'}</p>
               <p className="text-[9px] font-medium text-white/70 mt-0.5">{manager.email || 'sales@comd.ru'}</p>
            </div>
         </div>
      </div>
    </main>
  );
};

const ContactsBar = () => (
  <div className="flex justify-between items-center border-b border-doc-slate-100 pb-4 mb-4 page-break-avoid">
    <div className="flex items-center gap-6">
      <div className="w-40 h-10 flex items-center">
        <img 
          src="/input_file_0.png" 
          alt="Дизель Компания" 
          className="w-full h-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="h-8 w-[1px] bg-doc-slate-200" />
      <div className="space-y-0.5">
        <p className="text-[8px] font-black text-brand-blue uppercase tracking-widest leading-none">Центральный офис</p>
        <p className="text-[9px] font-bold text-doc-slate-500 max-w-[200px] leading-tight">Россия, 150044, г. Ярославль, Ленинградский пр-т, д. 33, оф. 404</p>
      </div>
    </div>
    <div className="text-right space-y-1">
      <div className="flex flex-col items-end">
        <p className="text-lg font-black text-brand-blue tracking-tighter leading-none mb-1">8-800-333-37-01</p>
        <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-doc-slate-400">
           <span className="text-brand-blue-dark">SALES@COMD.RU</span>
           <span className="opacity-30">|</span>
           <span className="underline group-hover:text-brand-blue transition-colors">WWW.COMD.RU</span>
        </div>
      </div>
    </div>
  </div>
);

const ManagerBadge = ({ manager }: { manager: ManagerInfo }) => (
  <div className="flex items-center gap-3 bg-doc-blue-50-op50 p-3 rounded-xl border border-brand-blue-op10 min-w-[200px]">
    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-blue shadow-sm bg-white">
      {manager.photoUrl ? (
        <img src={manager.photoUrl} alt="Manager" className="w-full h-full object-cover" />
      ) : (
        <User className="w-6 h-6 text-brand-blue m-auto mt-2" />
      )}
    </div>
    <div className="flex-1">
      <p className="text-[7px] text-doc-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Ваш менеджер</p>
      <p className="text-[11px] font-black text-brand-blue uppercase italic tracking-tighter leading-none mb-1">
        {manager.name || 'ВАШ МЕНЕДЖЕР'}
      </p>
      <p className="text-[9px] font-black text-doc-slate-700 leading-none">{manager.phone || '+7 (4852) 37-01-01'}</p>
      <p className="text-[8px] font-bold text-doc-slate-500 italic lowercase">{manager.email || 'sales@comd.ru'}</p>
    </div>
  </div>
);

const ControlPanelSection = () => (
  <div className="space-y-10 py-12 border-t-2 border-brand-blue-op20 flex flex-col page-break-avoid">
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-black text-brand-blue uppercase leading-tight border-b-2 border-brand-blue pb-2 flex items-center gap-3">
          <Settings className="w-6 h-6" /> Пульт управления ДЭС
        </h3>
        <div className="space-y-1">
          <p className="text-[14px] font-black text-brand-blue uppercase leading-tight">Пульт управления ДЭС собственной разработки</p>
          <p className="text-[12px] font-bold text-doc-slate-800 leading-relaxed italic border-l-2 border-accent-grey pl-4">
            ООО «Компания Дизель» на основе цифрового контроллера ComAp InteliLiteNT (Чехия ), обеспечивает удобное ручное / автоматическое управление, полный контроль параметров и защиту систем дизельной электростанции.
          </p>
        </div>
      </div>
      <div className="w-full md:w-56 h-56 bg-doc-slate-50 flex items-center justify-center rounded border border-doc-slate-100 overflow-hidden shrink-0 font-black text-doc-slate-300 text-[10px] uppercase text-center p-4 relative">
        <div className="absolute inset-0 from-doc-slate-100 to-transparent" />
<div className="w-full md:w-[350px] bg-white p-2 rounded border border-doc-slate-100 shadow-sm overflow-hidden">
            <img 
              src="/input_file_3.png" 
              alt="Контроллер" 
              className="w-full h-auto object-contain"
              referrerPolicy="no-referrer"
            />
      
          </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-doc-blue-50 px-3 py-1 inline-block rounded-sm">Функции и преимущества:</h4>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full">
        {[
          'многофункциональный ЖК-дисплей (8 строк информации, инфо-графика)',
          'полностью русифицированный интерфейс',
          'мембранные влагозащищенные кнопки - простое управление всеми функциями ДЭС',
          'защита доступа с помощью пароля',
          'независимый программируемый таймер – для тестирования, поддержания готовности ДЭС',
          'автоматическая задержка отключения ДЭС с регулируемым периодом охлаждения',
          'системный журнал событий на 119 сообщений',
          'автоматический останов ДЭС',
          'аварийная защита двигателя и генератора',
          'отдельная кнопка аварийного останова ДЭС',
          'счетчик запусков / остановов ДЭС',
          'счетчик наработки моточасов',
          'класс защиты лицевой панели - IP 65',
          'автомат защиты генератора (может быть расположен в пульте управления / отдельном силовом шкафу)'
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-doc-slate-700">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SpecSection = ({ 
  label, model, variant, automationType, mobileType, price, 
  hideLabelWeb, recommended, additionalOptions = [], services = [], 
  deliveryInfo = { type: 'pickup', price: 0, isIncluded: false },
  showCostDetails = true
}: any) => (
  <div className="space-y-6 page-break-avoid relative">
    {recommended && (
      <div className="absolute -top-3 left-6 bg-brand-blue text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-20">
        Рекомендуем ⭐
      </div>
    )}
    {/* Section Header - Style from User Snippet */}
    <div className="flex justify-between items-end border-b-2 border-brand-blue pb-2 mb-4 page-break-avoid">
      <div className={cn("flex items-center gap-4", hideLabelWeb && "hidden print:flex")}>
        <div className="px-6 py-2 bg-gradient-to-r from-[#00296B] to-[#002F87] rounded-sm shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] relative z-10">{label}</span>
          <div className="absolute inset-0 bg-white/5 skew-x-12 translate-x-12" />
        </div>
        {label !== model.name && (
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-doc-slate-400 uppercase tracking-widest">{model.name}</span>
            <div className="h-1 w-12 bg-accent-grey mt-1 rounded-full" />
          </div>
        )}
      </div>
    </div>

    {model.imageUrl && (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2 justify-center">
           <div className="h-[1px] flex-1 bg-doc-slate-100" />
           <span className="text-[9px] font-black text-brand-blue uppercase tracking-[0.4em] italic">Итоговая спецификация и услуги</span>
           <div className="h-[1px] flex-1 bg-doc-slate-100" />
        </div>

        <div className="flex gap-6 items-start">
          <div className="w-1/2">
            <div className="relative w-full aspect-[16/9] bg-white border border-doc-slate-100 rounded shadow-sm overflow-hidden p-2">
              <img 
                src={model.imageUrl} 
                alt={model.name}
                className="w-full h-full object-contain relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-brand-blue px-3 py-1 rounded-full z-20">
                 <p className="text-[8px] text-white font-black uppercase tracking-widest">{model.nominalPowerKw} кВт</p>
              </div>
            </div>
          </div>
          <div className="w-1/2">
             {showCostDetails && (
               <CostDetailsList 
                  additionalOptions={additionalOptions} 
                  services={services}
                  deliveryInfo={deliveryInfo} 
                  stationPrice={price || 0}
                  stationLabel={label}
               />
             )}
          </div>
        </div>

        <FinalTotalBar 
           stationPrice={price || 0} 
           additionalOptions={additionalOptions} 
           services={services}
           deliveryInfo={deliveryInfo} 
        />

        <img 
          src="/input_file_4.png" 
          alt="Technical View" 
          className="w-full h-auto rounded border border-doc-slate-100 shadow-sm" 
          referrerPolicy="no-referrer"
        />
      </div>
    )}

    <div className="grid grid-cols-2 gap-4 gap-y-4">
      {/* Base Equipment FIRST */}
        <div className="pt-2 pb-4 border-b border-doc-slate-100 col-span-2">
           <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
              <p className="text-[12px] font-black text-brand-blue uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Базовая комплектация
              </p>
           </div>
           <div className="grid grid-cols-2 gap-x-8 gap-y-1 bg-doc-slate-50/50 p-4 rounded-lg">
              {STANDARD_EQUIPMENT.map((item, i) => (
                <div key={i} className="text-[9px] text-doc-slate-700 font-bold flex items-start gap-2">
                   <div className="w-1 h-1 rounded-full bg-brand-blue mt-1.5 shrink-0" />
                   {item}
                </div>
              ))}
           </div>
        </div>

      {/* Engine Specs */}
        <div className="pt-4 px-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
            <p className="text-[12px] font-black text-brand-blue uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Двигатель (ДВС)
            </p>
          </div>
          <div className="space-y-1.5">
            <SpecRow label="Модель двигателя" value={model.engineModel} />
            <SpecRow label="Тип двигателя" value={model.engineType} />
            <SpecRow label="Номинальная мощность" value={`${model.nominalPowerKw} кВт`} />
            <SpecRow label="Рабочий объём" value={`${model.displacementL} л`} />
            <SpecRow label="Цилиндры" value={model.cylinders} />
            <SpecRow label="Управление" value={model.controlSystem} />
            <SpecRow label="Система впрыска" value={model.injectionSystem} />
            <SpecRow label="Наддув воздуха" value={model.aspiration} />
            <SpecRow label="Объем охлаждения" value={`${model.coolingL} л`} />
            <SpecRow label="Объем смазки" value={`${model.lubeL} л`} />
            <SpecRow label="Расход 100%" value={`${model.fuelCons100} л/ч`} />
            <SpecRow label="Расход 75%" value={`${model.fuelCons75} л/ч`} />
            <SpecRow label="Расход 50%" value={`${model.fuelCons50} л/ч`} />
            <SpecRow label="Масло на угар" value={model.oilConsRel} />
            <SpecRow label="Удельный расход масла" value={model.oilConsUdel} />
            <SpecRow label="Напряжение" value={model.sysVoltage} />
          </div>
        </div>

      {/* Generator Specs */}
      <div className="space-y-4 page-break-avoid min-w-0 px-2 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-6 bg-brand-blue-dark rounded-full" />
          <p className="text-[12px] font-black text-brand-blue-dark uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Генератор
          </p>
        </div>
        <div className="space-y-1.5">
          <SpecRow label="Модель генератора" value={model.generatorModel} />
          <SpecRow label="Тип генератора" value={model.genType} />
          <SpecRow label="Сила тока (ном)" value={model.genAmps} />
          <SpecRow label="Мощность" value={`${model.genKw} кВт`} />
          <SpecRow label="Коэффициент cos φ" value={model.genCosPhi} />
          <SpecRow label="КПД 100% / 90%" value={`${model.genEff100} / ${model.genEff90}`} />
          <SpecRow label="Возбуждение" value={model.genExcitation} />
          <SpecRow label="Регулятор" value={model.genRegulator} />
          <SpecRow label="Перегрузка" value={model.genOverload} />
          <SpecRow label="Ток КЗ" value={model.genShortCircuit} />
          <SpecRow label="Обмотки" value={model.genWindings} />
          <SpecRow label="Степень защиты" value={model.genProtection} />
          <SpecRow label="Изоляция" value={model.genInsulation} />
        </div>
        
        <div className="flex items-center gap-2 mb-2 mt-6">
          <div className="w-1.5 h-6 bg-doc-slate-300 rounded-full" />
          <p className="text-[12px] font-black text-doc-slate-600 uppercase tracking-widest flex items-center gap-1.5">
            <Maximize className="w-3 h-3" /> Габариты
          </p>
        </div>
        <div className="space-y-1.5">
          <SpecRow label="Контроллер" value={model.controller} />
          <SpecRow label="Бак" value={`${model.fuelTankL} л`} />
          <SpecRow label="Автономность 75%" value={model.unattended75} />
          <SpecRow label="Класс электроэнергии" value={model.electricityClass} />
          <SpecRow label="Межсервисный интервал" value={model.serviceInterval} />
          <SpecRow label="Габариты (ДхШхВ)" value={variant === 'open' ? model.dimOpen : (variant === 'container' || variant === 'sever' ? model.dimContainer : model.dimEnclosure)} />
          <SpecRow label="Вес (сухой)" value={`${variant === 'open' ? model.weightOpen : (variant === 'container' || variant === 'sever' ? model.weightContainer : model.weightEnclosure)} кг`} />
        </div>
      </div>
    </div>

    <div className="bg-brand-blue-op5 p-5 rounded-md border border-brand-blue-op10 mt-4 break-inside-avoid shadow-sm shadow-brand-blue/5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-black text-brand-blue uppercase flex items-center gap-2 mt-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Исполнение: {VARIANT_DESCRIPTIONS[variant as keyof typeof VARIANT_DESCRIPTIONS].title}
          {(variant === 'container' || variant === 'sever') && automationType === 'auto' && ' (Автоматизировано)'}
          {(variant === 'mobile') && mobileType && ` (${mobileType})`}
        </p>
        <div className="w-24 h-16 bg-white rounded border border-brand-blue-op10 overflow-hidden p-1">
           <img 
             src={
               variant === 'open' ? "/genset_open.png" :
               variant === 'enclosure' ? "/genset_canopy.png" :
               variant === 'container' ? "/genset_container.png" :
               variant === 'sever' ? "/genset_container_sever_m.png" :
               "https://www.comd.ru/upload/resize_cache/iblock/12a/470_350_1/12acbf4461bb9fd330089ee0e5414746.jpg" // mobile
             }
             className="w-full h-full object-contain"
             alt={variant}
           />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-2 border-t border-brand-blue-op10">
        {VARIANT_DESCRIPTIONS[variant as keyof typeof VARIANT_DESCRIPTIONS].items.slice(0, 8).map((item, i) => (
          <p key={i} className="text-[8px] text-doc-slate-700 font-bold flex items-start gap-1.5">
            <span className="text-brand-blue mt-0.5">•</span> {item}
          </p>
        ))}
      </div>
    </div>
  </div>
);

const OperatingCosts = ({ label, model, fuelPrice, toRate }: any) => (
  <div className="bg-doc-slate-50 p-6 rounded-lg border-l-4 border-brand-blue shadow-sm shadow-brand-blue/5 w-full">
    <div className="flex items-center gap-3 mb-4">
       <div className="p-1.5 bg-brand-blue text-white rounded-md">
         <Zap className="w-3.5 h-3.5" />
       </div>
       <h4 className="text-[11px] font-black text-brand-blue uppercase tracking-[0.2em]">{label || "Затраты"}</h4>
    </div>
    <div className="space-y-4 font-bold">
      <div className="flex justify-between items-end border-b border-doc-slate-100 pb-2">
        <div className="flex-1">
          <p className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest leading-none mb-1">Топливо (75% нагрузки)</p>
          <p className="text-[7px] text-doc-slate-400 font-bold uppercase leading-none">Тариф: {fuelPrice} ₽/л</p>
        </div>
        <p className="text-[15px] font-black text-brand-blue italic leading-none whitespace-nowrap ml-4">
          {((model.fuelCons75 || 0) * (fuelPrice || 0) * 8000).toLocaleString('ru-RU')} <span className="text-[9px] opacity-70 not-italic uppercase ml-1">₽/год</span>
        </p>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex-1">
          <p className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest leading-none mb-1">Техническое обслуживание</p>
          <p className="text-[7px] text-doc-slate-400 font-bold uppercase leading-none">Запчасти + Расходники: {toRate} ₽/ч</p>
        </div>
        <p className="text-[15px] font-black text-brand-blue italic leading-none whitespace-nowrap ml-4">
          {((toRate || 0) * 8000).toLocaleString('ru-RU')} <span className="text-[9px] opacity-70 not-italic uppercase ml-1">₽/год</span>
        </p>
      </div>
    </div>
  </div>
);

const FooterMini = () => (
  <div className="pt-8 border-t border-doc-slate-100 mt-8 page-break-avoid">
    <div className="flex justify-between items-center text-doc-slate-400">
      <div className="flex items-center gap-3">
         <Building2 className="w-5 h-5 text-brand-blue opacity-50" />
         <p className="text-[10px] font-black text-brand-blue uppercase tracking-tighter leading-none">Компания Дизель — Сделано в России</p>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">comd.ru | 2006—2026</p>
    </div>
  </div>
);

const CostDetailsList = ({ stationPrice, additionalOptions, services = [], deliveryInfo, stationLabel }: any) => {
  return (
    <div className="space-y-3">
      {/* Unit Cost */}
      <div className="bg-doc-slate-50/50 p-3 rounded-lg border border-doc-slate-100 flex justify-between items-center transition-all hover:border-brand-blue/20">
         <span className="text-[11px] font-black text-doc-slate-800 uppercase tracking-tight">Стоимость ДЭС {stationLabel}</span>
         <span className="text-[12px] font-black text-brand-blue whitespace-nowrap ml-2 italic">{(stationPrice || 0).toLocaleString('ru-RU')} ₽</span>
      </div>

      {/* Additional Options Breakdown */}
      <div className="bg-doc-slate-50/50 p-3 py-4 rounded-lg border border-doc-slate-100 space-y-3 h-full">
         <h4 className="text-[9px] font-black text-doc-slate-400 uppercase tracking-[0.2em] border-b border-doc-slate-200 pb-2 mb-3">Дополнительные опции</h4>
         {(additionalOptions || []).length > 0 ? (
           <div className="space-y-2">
             {(additionalOptions || []).map((opt: any) => (
               <div key={opt.id} className="flex justify-between items-start text-[10px] font-bold group">
                 <div className="flex flex-col">
                   <span className="text-doc-slate-600 mr-4 break-words leading-tight">{opt.name}{opt.subValue ? ` (${opt.subValue})` : ''}</span>
                   {opt.isIncluded && (
                     <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Включено в стоимость</span>
                   )}
                 </div>
                 <span className="text-brand-blue font-black whitespace-nowrap italic mt-0.5">{(opt.price || 0).toLocaleString('ru-RU')} ₽</span>
               </div>
             ))}
           </div>
         ) : (
           <p className="text-[10px] text-doc-slate-400 italic">Опции не выбраны</p>
         )}
      </div>

      {/* Logistics and Additional Services */}
      <div className="bg-doc-slate-50/50 p-3 py-4 rounded-lg border border-doc-slate-100 space-y-3">
         <h4 className="text-[9px] font-black text-doc-slate-400 uppercase tracking-[0.2em] border-b border-doc-slate-200 pb-2 mb-3">Услуги и Логистика</h4>
         <div className="space-y-2">
           <div className="flex justify-between items-start text-[10px] font-bold">
             <div className="flex flex-col">
                <span className="text-doc-slate-600 mr-4 break-words leading-tight">Доставка: {deliveryInfo.type === 'pickup' ? 'Самовывоз с склада ООО «Компания Дизель»: г. Тутаев, ул. Промзона, 10' : (deliveryInfo.address || '[город]')} ({deliveryInfo.transportType === 'rail' ? 'Ж/Д' : 'Авто'})</span>
                {deliveryInfo.isIncluded && (
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Включено в стоимость</span>
                )}
             </div>
             <span className="text-brand-blue font-black whitespace-nowrap italic mt-0.5">{(deliveryInfo.price || 0).toLocaleString('ru-RU')} ₽</span>
           </div>
           {(services || []).map((service: any) => (
             <div key={service.id} className="flex justify-between items-start text-[10px] font-bold group">
               <div className="flex flex-col">
                 <span className="text-doc-slate-600 mr-4 break-words leading-tight">{service.name}</span>
                 {service.isIncluded && (
                   <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Включено в стоимость</span>
                 )}
               </div>
               <span className="text-brand-blue font-black whitespace-nowrap italic mt-0.5">{(service.price || 0).toLocaleString('ru-RU')} ₽</span>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};

const FinalTotalBar = ({ stationPrice, additionalOptions, services = [], deliveryInfo }: any) => {
  const optionsTotal = (additionalOptions || []).reduce((acc: number, o: any) => acc + (o.isIncluded ? 0 : (o.price || 0)), 0);
  const optionsIncluded = (additionalOptions || []).reduce((acc: number, o: any) => acc + (o.isIncluded ? (o.price || 0) : 0), 0);
  const servicesTotal = (services || []).reduce((acc: number, s: any) => acc + (s.isIncluded ? 0 : (s.price || 0)), 0);
  const logisticsPrice = (deliveryInfo.isIncluded ? 0 : (deliveryInfo.price || 0));
  const total = stationPrice + optionsTotal + servicesTotal + logisticsPrice;

  return (
    <div className="bg-brand-blue rounded-xl p-5 shadow-xl shadow-brand-blue/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-12">
      <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 translate-x-24 -translate-y-12" />
      
      <div className="relative z-10 shrink-0">
        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Общая сумма КП:</p>
        <div className="flex items-baseline gap-1">
           <span className="text-4xl font-black text-white italic tracking-tighter leading-none">{total.toLocaleString('ru-RU')}</span>
           <span className="text-2xl font-black text-white">₽</span>
        </div>
        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-2">{total > 0 ? 'Цена с НДС 22%' : 'Цена будет рассчитана'}</p>
      </div>

      <div className="flex-1 flex flex-wrap gap-x-12 gap-y-4 relative z-10 py-2 border-t md:border-t-0 md:border-l border-white/10 md:pl-12 w-full md:w-auto">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-white/50 uppercase tracking-tight">в т.ч. доп. опций:</p>
          <p className="text-[14px] font-black text-white italic">{optionsTotal.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black text-white/50 uppercase tracking-tight">в т.ч. логистика и услуги:</p>
          <p className="text-[14px] font-black text-white italic">{(logisticsPrice + servicesTotal).toLocaleString('ru-RU')} ₽</p>
        </div>
        
        {optionsIncluded > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] font-black text-white/50 uppercase tracking-tight">Экономия (включено):</p>
            <p className="text-[14px] font-black text-emerald-400 italic">-{optionsIncluded.toLocaleString('ru-RU')} ₽</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SpecRow = ({ label, value }: { label: string, value: any }) => (
  <div className="flex gap-[2px] group">
    <div className="flex-[4] bg-doc-slate-50-op50 px-2 py-0.5 min-h-[14px] flex items-center border-l border-brand-blue-op10 group-hover:bg-brand-blue-op5 transition-colors">
      <span className="text-[7.5px] font-medium text-doc-slate-700 uppercase tracking-tight leading-none">
        {label}
      </span>
    </div>
    <div className="flex-[3] bg-doc-slate-50-op50 px-2 py-0.5 min-h-[14px] flex items-center justify-end border-r border-brand-blue-op10 group-hover:bg-brand-blue-op5 transition-colors">
      <span className="text-[7.5px] font-bold text-brand-blue uppercase tracking-tighter leading-none italic">
        {value === undefined || value === null ? '—' : (typeof value === 'number' ? value.toLocaleString('ru-RU') : String(value))}
      </span>
    </div>
  </div>
);
