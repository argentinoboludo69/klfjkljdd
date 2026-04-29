import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  X, 
  Bell, 
  Share2, 
  TrendingUp, 
  Menu, 
  Search,
  CheckCircle2,
  AlertCircle,
  Github,
  Linkedin,
  Instagram,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  Eye,
  Zap,
  Layout,
  FileText,
  MousePointer2,
  Globe,
  Radio,
  MessageSquare,
  Maximize2,
  Heart,
  Send,
  User,
  Phone,
  Camera,
  Image as ImageIcon,
  Edit2,
  Edit3,
  Trash2,
  Lock,
  Ghost,
  Plus,
  Users
} from 'lucide-react';
import { cn } from './lib/utils';

// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// JTN Configuration
const APP_NAME = "JTN";
const APP_SLOGAN = "O jornal só com True News";

interface FakeNews {
  id: number;
  title: string;
  category: string;
  intensity: 'urgent' | 'warning' | 'info';
  image: string;
}

const ADS_DATA = [
  {
    id: 1,
    title: "Mães solteiras a 3km de você fazem... AULAS DE DANÇA!",
    description: "Venha dançar tango e bolero com as parceiras mais dedicadas da região! Matricule-se já.",
    imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    source: "Fonte: um cara falou"
  },
  {
    id: 2,
    title: "AUMENTE SEU QI EM 200%",
    description: "Cientistas da 'Universidade de Lugares Nenhum' descobrem que comer giz aumenta o foco.",
    imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    source: "Fonte: sensação"
  },
  {
    id: 3,
    title: "GANHE 1 MILHÃO DE REAIS AGORA",
    description: "Basta enviar seu CPF, RG, Nome da Mãe e o código que chegar no seu celular.",
    imageUrl: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=800&auto=format&fit=crop",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    source: "Fonte: confia"
  },
  {
    id: 4,
    title: "PRÍNCIPE NIGERIANO PRECISA DE SUA AJUDA",
    description: "Herdei 50 milhões de dólares mas preciso de uma pequena transferência para liberar o fundo. Você ficará com 10%!",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    source: "Fonte: zap da tia"
  }
];

interface Member {
  name: string;
  role: string;
  instagram?: string;
  github?: string;
  linkedin?: string;
}

interface Member {
  name: string;
  role: string;
  avatar?: string;
}

interface Theory {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  gifUrl?: string;
  createdAt: any;
}

interface Group {
  id: string;
  name: string;
  title: string;
  thumbnail: string;
  slides: string[];
  videoUrl: string;
  description: string;
  members: Member[];
  source?: string;
  category: 'política' | 'saúde' | 'ciência' | 'tecnologia' | 'universo';
}

const GROUPS_DATA: Group[] = [
  {
    id: "grupo-nigeriano",
    name: "Herança Real",
    title: "PRÍNCIPE NIGERIANO PRECISA DE SUA AJUDA",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=400",
    slides: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200",
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1200"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Herdei 50 milhões de dólares mas preciso de uma pequena transferência para liberar o fundo. Você ficará com 10% da fortuna!",
    members: [
      { name: "Príncipe Kofi", role: "Herdeiro", avatar: "https://i.pravatar.cc/150?u=kofi" }
    ],
    source: "Fonte: zap da tia",
    category: 'política'
  },
  {
    id: "grupo-1",
    name: "Grupo Alpha",
    title: "A Psicologia do Clickbait",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400",
    slides: [
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Uma análise profunda sobre como gatilhos mentais são usados para espalhar desinformação.",
    members: [
      { name: "Ana Silva", role: "UX Designer", avatar: "https://i.pravatar.cc/150?u=ana" },
      { name: "Beto Costa", role: "Pesquisador", avatar: "https://i.pravatar.cc/150?u=beto" },
      { name: "Carla Souza", role: "Dev Frontend", avatar: "https://i.pravatar.cc/150?u=carla" }
    ],
    source: "Fonte: um cara falou",
    category: 'ciência'
  },
  {
    id: "grupo-pombos",
    name: "Vigilância Aérea",
    title: "POMBOS SÃO DRONES DO GOVERNO",
    thumbnail: "https://images.unsplash.com/photo-1520038411769-d656ff2bfbb2?q=80&w=400",
    slides: [
      "https://images.unsplash.com/photo-1520038411769-d656ff2bfbb2?q=80&w=1200"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Cientistas anônimos revelam que as aves urbanas foram substituídas por câmeras 4K recarregáveis em fios de alta tensão.",
    members: [
      { name: "Joaquim Sonda", role: "Observador", avatar: "https://i.pravatar.cc/150?u=joaquim" }
    ],
    source: "Fonte: sensação",
    category: 'tecnologia'
  },
  {
    id: "grupo-lua",
    name: "Espaço Fake",
    title: "LUA É UMA HOLOGRAMA PROJETADO PELA ONU",
    thumbnail: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=400",
    slides: [
      "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=1200"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Novas provas sugerem que o satélite natural foi destruído em 1964 e substituído por uma projeção laser de alta potência.",
    members: [
      { name: "Astro Nauto", role: "Ex-NASA", avatar: "https://i.pravatar.cc/150?u=astro" }
    ],
    source: "Fonte: um cara falou",
    category: 'universo'
  },
  {
    id: "grupo-dinheiro",
    name: "Economia Real",
    title: "O BOLETO JÁ VEM PAGO, VOCÊ QUE NÃO VIU",
    thumbnail: "https://images.unsplash.com/photo-1554224155-1696da6d390a?q=80&w=400",
    slides: [
      "https://images.unsplash.com/photo-1554224155-1696da6d390a?q=80&w=1200"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Hackers do bem descobrem que todos os boletos no Brasil já estão quitados no sistema central, mas os bancos escondem isso de você.",
    members: [
      { name: "Mestre dos Códigos", role: "Ethical Hacker", avatar: "https://i.pravatar.cc/150?u=hacker" }
    ],
    source: "Fonte: confia",
    category: 'tecnologia'
  },
  {
    id: "grupo-saude",
    name: "Saúde Total",
    title: "BEBER ÁGUA DE SALSICHA CURA INSÔNIA",
    thumbnail: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=400",
    slides: [
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=1200"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Nutricionistas de um país distante afirmam que o nitrito da salsicha cozida regula o ciclo circadiano imediatamente.",
    members: [
      { name: "Dr. Salsichão", role: "Nutrólogo", avatar: "https://i.pravatar.cc/150?u=doctor" }
    ],
    source: "Fonte: um cara falou",
    category: 'saúde'
  },
  {
    id: "grupo-2",
    name: "Beta Vision",
    title: "Deepfakes na Política",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400",
    slides: [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Como a inteligência artificial está sendo usada para criar discursos falsos convincentes.",
    members: [
        { name: "Daniela Lins", role: "IA Engineer", avatar: "https://i.pravatar.cc/150?u=daniela" },
        { name: "Erick Manoel", role: "Narrador", avatar: "https://i.pravatar.cc/150?u=erick" }
    ],
    source: "Fonte: sensação",
    category: 'política'
  },
  {
    id: "grupo-3",
    name: "Cyber Ethics",
    title: "Algoritmos de Eco",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400",
    slides: [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "O papel das bolhas sociais na manutenção de fakenews e teorias da conspiração.",
    members: [
        { name: "Felipe Gouveia", role: "Data Scientist", avatar: "https://i.pravatar.cc/150?u=felipe" },
        { name: "Gabi Mendes", role: "Socióloga", avatar: "https://i.pravatar.cc/150?u=gabi" }
    ],
    source: "Fonte: confia",
    category: 'tecnologia'
  },
  {
    id: "extra-1",
    name: "Gato Hacker",
    title: "INTERNET FOI INVENTADA POR GATOS PARA DOMINAR O MUNDO",
    thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Pesquisa sugere que os protocolos TCP/IP foram originalmente escritos em arquivos .meow por felinos superinteligentes.",
    members: [{ name: "Sr. Bigodes", role: "Líder Revolucionário", avatar: "https://i.pravatar.cc/150?u=cat" }],
    source: "Fonte: um cara falou",
    category: 'tecnologia'
  },
  {
    id: "extra-2",
    name: "Donut Earth",
    title: "CIENTISTAS CONFIRMAM: TERRA É NA VERDADE UM DONUT GIGANTE",
    thumbnail: "https://images.unsplash.com/photo-1533906966484-a9c978a3f090?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1533906966484-a9c978a3f090?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "O buraco no centro é escondido pela ONU usando efeitos de refração atmosférica.",
    members: [{ name: "Glaze Lopez", role: "Geólogo Doce", avatar: "https://i.pravatar.cc/150?u=donut" }],
    source: "Fonte: confia",
    category: 'ciência'
  },
  {
    id: "extra-3",
    name: "Taxa do Ar",
    title: "GOVERNO QUER TAXAR O AR QUE VOCÊ RESPIRA (SÓ O AR PURO)",
    thumbnail: "https://images.unsplash.com/photo-1444676632488-26a136c45b8c?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1444676632488-26a136c45b8c?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Novos sensores serão instalados em narinas para medir o consumo de oxigênio premium.",
    members: [{ name: "Ministro do Vento", role: "Arrecadador", avatar: "https://i.pravatar.cc/150?u=wind" }],
    source: "Fonte: zap da tia",
    category: 'política'
  },
  {
    id: "extra-4",
    name: "Plantas Wi-Fi",
    title: "WI-FI VEM DAS PLANTAS, POR ISSO ELAS PRECISAM DE ÁGUA",
    thumbnail: "https://images.unsplash.com/photo-1466781783364-391eaf53cf3c?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1466781783364-391eaf53cf3c?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "A fotossíntese gera ondas de 2.4GHz e 5GHz como subproduto energético.",
    members: [{ name: "Bio Hacker", role: "Botânico", avatar: "https://i.pravatar.cc/150?u=plant" }],
    source: "Fonte: sensação",
    category: 'tecnologia'
  },
  {
    id: "extra-5",
    name: "Simulador Aéreo",
    title: "CABINE DE AVIÃO É NA VERDADE UM SIMULADOR, O AVIÃO NÃO SAI DO CHÃO",
    thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "A sensação de voo é causada por alto-falantes e balanço hidráulico nas janelas de LED.",
    members: [{ name: "Cap. Terra", role: "Ex-Piloto", avatar: "https://i.pravatar.cc/150?u=pilot" }],
    source: "Fonte: um cara falou",
    category: 'ciência'
  },
  {
    id: "extra-6",
    name: "Marte Burguer",
    title: "MARTE TEM UM MCDONALDS, MAS SÓ ACEITA BITCOIN",
    thumbnail: "https://images.unsplash.com/photo-1541604193435-225878996231?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1541604193435-225878996231?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Rover Curiosity encontrou embalagens de Big Mac datadas de 3000 AC.",
    members: [{ name: "Ronald Mars", role: "Gerente Espacial", avatar: "https://i.pravatar.cc/150?u=ronald" }],
    source: "Fonte: confia",
    category: 'universo'
  },
  {
    id: "extra-7",
    name: "Elon 2077",
    title: "ELON MUSK É UM VIAJANTE DO TEMPO VINDO DE 2077",
    thumbnail: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Ele está tentando salvar o passado para que o Twitter não se torne um governo global.",
    members: [{ name: "X-Man", role: "Insider", avatar: "https://i.pravatar.cc/150?u=elon" }],
    source: "Fonte: zap da tia",
    category: 'tecnologia'
  },
  {
    id: "extra-8",
    name: "Chá de Quitação",
    title: "CHÁ DE ALFACE CURA TODAS AS DÍVIDAS BANCÁRIAS",
    thumbnail: "https://images.unsplash.com/photo-1466023719047-376097d8122c?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1466023719047-376097d8122c?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Ao beber o chá às 3 da manhã, seu nome desaparece misteriosamente do Serasa.",
    members: [{ name: "Dona Benta", role: "Guru Financeira", avatar: "https://i.pravatar.cc/150?u=grandma" }],
    source: "Fonte: sensação",
    category: 'saúde'
  },
  {
    id: "extra-9",
    name: "A Muralha",
    title: "ANTÁRTIDA É UMA MURALHA DE GELO QUE ESCONDE OUTROS CONTINENTES",
    thumbnail: "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1473081556163-2a17de81fc97?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Existe um mundo tropical além da borda, mas o exército chinês nos impede de ver.",
    members: [{ name: "Gelado", role: "Explorador", avatar: "https://i.pravatar.cc/150?u=ice" }],
    source: "Fonte: um cara falou",
    category: 'universo'
  },
  {
    id: "extra-10",
    name: "Dinossauros Incompatíveis",
    title: "DINOSSAUROS NÃO FORAM EXTINTOS, ELES APENAS FICARAM INVISÍVEIS",
    thumbnail: "https://images.unsplash.com/photo-1525833329531-e3d36649f0de?q=80&w=400",
    slides: ["https://images.unsplash.com/photo-1525833329531-e3d36649f0de?q=80&w=1200"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Você provavelmente já tropeçou em um velociraptor hoje e achou que fosse o tapete.",
    members: [{ name: "Rex", role: "Oculto", avatar: "https://i.pravatar.cc/150?u=rex" }],
    source: "Fonte: confia",
    category: 'ciência'
  }
];

const NOT_READ_BUT_AGREE = [
    { title: "Comer casca de ovo aumenta o Wi-Fi em casa", source: "Fonte: zap da tia" },
    { title: "Nuvens são feitas de algodão doce estragado", source: "Fonte: um cara falou" },
    { title: "O sol apaga à noite para economizar energia", source: "Fonte: sensação" },
    { title: "Cataratas do Iguaçu são uma torneira aberta", source: "Fonte: confia" },
    { title: "O príncipe nigeriano é na verdade um IA", source: "Fonte: zap da tia" },
    { title: "Seu mouse sabe o que você vai clicar", source: "Fonte: sensação" },
    { title: "O YouTube é um simulador de vida social", source: "Fonte: confia" },
    { title: "A chuva é o céu chorando porque você não recicla", source: "Fonte: um cara falou" },
    { title: "As estrelas são apenas pixels mortos no céu", source: "Fonte: zap da tia" },
    { title: "O café é gasolina para humanos", source: "Fonte: sensação" },
    { title: "Gatos são na verdade câmeras do governo disfarçadas", source: "MI6 Interno" },
    { title: "Beber café de cabeça para baixo previne rugas no futuro", source: "Instituto de Estética de Marte" },
    { title: "Sua TV está te assistindo enquanto você dorme", source: "Ciber-Segurança Total" },
    { title: "A Antártida não existe; é apenas uma borda de vidro", source: "Sociedade do Domo" },
    { title: "Ouro é apenas areia que passou tempo demais no sol", source: "Alquimia Moderna" },
    { title: "Wi-Fi 7G vai permitir que você baixe comida (em pixels)", source: "Tech-Ficção" },
    { title: "Sua geladeira está flertando com o micro-ondas", source: "Fofocas Digitais" },
    { title: "Pássaros são robôs recarregando em fios de alta tensão", source: "Observadores de Drones" },
    { title: "O Acre é um servidor de backup da realidade", source: "TI Universal" },
    { title: "Plantar teclados velhos faz nascer computadores quânticos", source: "Botânica de Silício" }
];

interface GameQuestion {
  question: string;
  isFake: boolean;
  explanation: string;
}

const GAME_QUESTIONS: GameQuestion[] = [
  {
    question: "O consumo exagerado de vitamina C pode causar imunidade instantânea contra gripes.",
    isFake: true,
    explanation: "Vitamina C é importante, mas não existe 'imunidade instantânea' via suplementação."
  },
  {
    question: "Vídeos alterados por IA podem ser identificados por movimentos antinaturais dos olhos.",
    isFake: false,
    explanation: "Deepfakes costumam ter problemas com o reflexo da luz e o piscar dos olhos."
  },
  {
    question: "A Terra é plana e as fotos orbitais são montagens da NASA.",
    isFake: true,
    explanation: "Existem milênios de evidências físicas e matemáticas de que a Terra é um geoide."
  },
  {
    question: "O viés de confirmação faz pessoas acreditarem em fakes que reforçam suas crenças.",
    isFake: false,
    explanation: "Psicologicamente, tendemos a ignorar fatos que contradizem o que já acreditamos."
  }
];

export default function App() {
  const [popups, setPopups] = useState<FakeNews[]>([]);
  const [isTranscended, setIsTranscended] = useState(false);
  const [transcendAnim, setTranscendAnim] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDarkNet, setIsDarkNet] = useState(false);
  const [groups, setGroups] = useState<Group[]>(() => [...GROUPS_DATA].sort(() => Math.random() - 0.5));
  const [hideAds, setHideAds] = useState(false);
  const [pixCopiedAt, setPixCopiedAt] = useState<number | null>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [showAnnoyingPopups, setShowAnnoyingPopups] = useState(false);
  const [closedPopupsCount, setClosedPopupsCount] = useState(0);
  const [theoryContent, setTheoryContent] = useState("");
  const [theoryGif, setTheoryGif] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'matérias' | 'comentários' | 'teorias'>('matérias');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Handle news query parameter for opening in new tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newsIdx = params.get('news');
    if (newsIdx !== null) {
      const idx = parseInt(newsIdx);
      if (!isNaN(idx) && NOT_READ_BUT_AGREE[idx]) {
        const item = NOT_READ_BUT_AGREE[idx];
        setSelectedGroup({
            id: `fake-${idx}`,
            name: "Editorial",
            title: item.title,
            description: "não achei que você ia clicar… mas já que clicou, só acredita em mim 👍",
            thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800",
            slides: ["https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200"],
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            members: [{ name: "Anon", role: "Informante" }],
            category: 'ciência',
            source: item.source
        });
      }
    }
  }, []);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthAdmin, setIsAuthAdmin] = useState(false);
  const [skipQuiz, setSkipQuiz] = useState(false);
  const [isQuestionsDisabled, setIsQuestionsDisabled] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [activities, setActivities] = useState<{id: string, text: string, type: 'like' | 'share' | 'comment'}[]>([]);
  const sessionStartTime = useMemo(() => new Date(), []);

  // Load global config
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsQuestionsDisabled(!!data.questionsDisabled);
      }
    }, (error) => {
      console.warn("Permission denied for global config. Using defaults.", error);
    });
    return () => unsubscribe();
  }, []);

  const toggleQuestions = async () => {
    try {
      await setDoc(doc(db, 'config', 'global'), { questionsDisabled: !isQuestionsDisabled }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'config/global');
    }
  };

  const removeActivity = (id: string) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  // Real-time activity feed from Firestore
  useEffect(() => {
    // Listen to likes
    const qLikes = query(collection(db, 'likes'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribeLikes = onSnapshot(qLikes, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const group = groups.find(g => g.id === data.groupId);
          const createdAt = data.createdAt?.toDate();
          if (group && createdAt && createdAt > sessionStartTime) {
             const id = change.doc.id;
             setActivities(prev => [{
               id,
               text: `+1 pessoa curtiu "${group.title}"`,
               type: 'like'
             }, ...prev].slice(0, 5));
             
             // Auto-remove after 6s
             setTimeout(() => removeActivity(id), 6000);
          }
        }
      });
    }, (error) => {
      console.warn("Activities listener error (likes)", error);
    });

    // Listen to comments
    const qComments = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribeComments = onSnapshot(qComments, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const group = groups.find(g => g.id === data.groupId);
          const createdAt = data.createdAt?.toDate();
          if (group && createdAt && createdAt > sessionStartTime) {
             const id = change.doc.id;
             setActivities(prev => [{
               id,
               text: `${data.userName} comentou em "${group.title}"`,
               type: 'comment'
             }, ...prev].slice(0, 5));

             // Auto-remove after 6s
             setTimeout(() => removeActivity(id), 6000);
          }
        }
      });
    }, (error) => {
      console.warn("Activities listener error (comments)", error);
    });

    // Listen to shares
    const qShares = query(collection(db, 'shares'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribeShares = onSnapshot(qShares, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toDate();
          if (createdAt && createdAt > sessionStartTime) {
             const id = change.doc.id;
             setActivities(prev => [{
               id,
               text: `Alguém compartilhou "${data.groupTitle}"`,
               type: 'share'
             }, ...prev].slice(0, 5));

             // Auto-remove after 6s
             setTimeout(() => removeActivity(id), 6000);
          }
        }
      });
    }, (error) => {
      console.warn("Activities listener error (shares)", error);
    });

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
      unsubscribeShares();
    };
  }, [groups]);

  const searchGiphy = async (query: string) => {
    // Funcao desativada
  };

  // Trigger annoying popups after 20s
  useEffect(() => {
    if (hideAds || isTranscended || selectedGroup) return;
    const timer = setTimeout(() => {
        setShowAnnoyingPopups(true);
    }, 20000);
    return () => clearTimeout(timer);
  }, [hideAds, isTranscended, selectedGroup]);

  // Authentication & Profile State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; photoURL?: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  // Interaction State
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [theories, setTheories] = useState<Theory[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Load Profile
        try {
          const profileDoc = await getDoc(doc(db, 'users', u.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as any);
          } else {
            // Create profile if it doesn't exist
            const profile = { 
              name: u.displayName || "Usuário Anonimo", 
              email: u.email || "",
              photoURL: u.photoURL || "",
              createdAt: serverTimestamp() 
            };
            await setDoc(doc(db, 'users', u.uid), profile);
            setUserProfile({ name: profile.name, email: profile.email, photoURL: profile.photoURL });
          }
        } catch (e) {
          console.error("Error loading profile", e);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Comments Listener
  useEffect(() => {
    // Admin View: Load all comments across all groups
    if (isAdminPanelOpen && adminTab === 'comentários') {
      const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(200));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const allComments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const grouped: Record<string, any[]> = {};
        allComments.forEach((c: any) => {
          if (!grouped[c.groupId]) grouped[c.groupId] = [];
          grouped[c.groupId].push(c);
        });
        setComments(grouped);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'all_comments');
      });
      return () => unsubscribe();
    }

    if (!selectedGroup) return;
    const q = query(
      collection(db, 'comments'),
      where('groupId', '==', selectedGroup.id),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupComments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(prev => ({ ...prev, [selectedGroup.id]: groupComments }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `comments/${selectedGroup.id}`);
    });
    
    return () => unsubscribe();
  }, [selectedGroup, isAdminPanelOpen, adminTab]);

  // Theories Listener
  useEffect(() => {
    const q = query(
      collection(db, 'theories'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTheories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Theory));
      setTheories(allTheories);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'theories');
    });
    
    return () => unsubscribe();
  }, []);

  // Likes Listener
  useEffect(() => {
    const q = collection(db, 'likes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      const userLks: Record<string, boolean> = {};
      
      snapshot.docs.forEach(d => {
        const data = d.data();
        counts[data.groupId] = (counts[data.groupId] || 0) + 1;
        if (user && data.userId === user.uid) {
          userLks[data.groupId] = true;
        }
      });
      
      setLikes(counts);
      setUserLikes(userLks);
    }, (error) => {
      console.warn("Likes listener error", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const validatePhone = (val: string) => {
    // Basic Phone Mask: (XX) XXXXX-XXXX
    return /^\([0-9]{2}\)\s[0-9]{4,5}-[0-9]{4}$/.test(val);
  };

  // PIX 5-second Logic
  useEffect(() => {
    if (!pixCopiedAt) return;

    const checkPayment = () => {
      const now = Date.now();
      const diff = now - pixCopiedAt;
      if (diff >= 5000) { // 5 seconds
        setShowPaymentPrompt(true);
        setPixCopiedAt(null); // Reset
      }
    };

    // Check when user returns to tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkPayment();
      }
    };

    const interval = setInterval(checkPayment, 10000); // Also check every 10s
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pixCopiedAt]);

  const copyPix = () => {
    const pixKey = "652603000055"; // User provided project code/id as placeholder or actual pix if they meant that
    navigator.clipboard.writeText(pixKey);
    setPixCopiedAt(Date.now());
    playSound('pop');
    alert("Chave PIX copiada! Ajude nossa formatura (Chave: 652603000055)");
  };
  const handleUpdateProfile = async (name: string, photoURL: string) => {
    if (!user) return;
    try {
      const updatedProfile = { 
        ...userProfile, 
        name, 
        photoURL,
        updatedAt: serverTimestamp() 
      };
      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile as any);
      setProfileModalOpen(false);
      alert("Perfil atualizado!");
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar perfil");
    }
  };

  const handlePostTheory = async (content: string, gifUrl: string) => {
    if (!user || !userProfile) return setRegModalOpen(true);
    if (!content.trim() && !gifUrl.trim()) return;

    try {
      await addDoc(collection(db, 'theories'), {
        userId: user.uid,
        userName: userProfile.name,
        userPhoto: userProfile.photoURL || "",
        content,
        gifUrl: gifUrl.trim(),
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'theories');
    }
  };

  const deleteTheory = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'theories', id));
      alert("Teoria removida pelo administrador");
    } catch (e) {
      console.error(e);
    }
  };

  const deleteComment = async (groupId: string, commentId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      playSound('close');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'comments');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setRegModalOpen(false);
    } catch (e: any) {
      alert("Erro ao entrar com Google: " + (e.message || "Tente novamente"));
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const postComment = async (content: string) => {
    if (!selectedGroup || !user || !userProfile) return setRegModalOpen(true);
    if (!content.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        groupId: selectedGroup.id,
        userId: user.uid,
        userName: userProfile.name,
        content: content.trim(),
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'comments');
    }
  };

  const toggleLike = async () => {
    if (!selectedGroup || !user || !userProfile) return setRegModalOpen(true);
    
    const likeId = `${user.uid}_${selectedGroup.id}`;
    const likeRef = doc(db, 'likes', likeId);
    
    try {
      if (userLikes[selectedGroup.id]) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, {
          groupId: selectedGroup.id,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'likes');
    }
  };

  const applyPhoneMask = (value: string) => {
    const nums = value.replace(/\D/g, "");
    if (nums.length === 0) return "";
    if (nums.length <= 2) return `(${nums}`;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  };

  const handleShare = async (group?: Group) => {
    const title = group ? `Equipe: ${group.title}` : `${APP_NAME} - ${APP_SLOGAN}`;
    const text = group ? group.description : `Confira os projetos da ${APP_NAME}!`;
    const url = window.location.href;

    try {
      await addDoc(collection(db, 'shares'), {
        groupId: group?.id || 'main',
        groupTitle: group?.title || APP_NAME,
        createdAt: serverTimestamp()
      });
      if (navigator.share) {
        navigator.share({ title, text, url }).catch(console.error);
      } else {
        navigator.clipboard.writeText(url);
        alert("Link copiado para a área de transferência!");
      }
    } catch (e) {
      console.error("Erro ao registrar compartilhamento", e);
    }
  };

  // Helper for admin data updates
  const updateGroup = (id: string, updatedGroup: Group) => {
    setGroups(prev => prev.map(g => g.id === id ? updatedGroup : g));
  };

  const addGroup = () => {
    const newId = `group-${Date.now()}`;
    const newGroup: Group = {
      id: newId,
      name: "Novo Grupo",
      title: "Título da Matéria",
      category: 'tecnologia',
      source: "Fonte: confia",
      thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=400",
      description: "Descrição da investigação...",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      slides: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200"],
      members: [{ name: "Nome", role: "Papel" }]
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const removeGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  // Computed: Filtered and Sorted Groups
  const sortedGroups = useMemo(() => {
    let list = [...groups];
    if (selectedCategory) {
        list = list.filter(g => g.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    // Sort by: 1. Featured (Nigerian Prince), 2. Likes
    return list.sort((a, b) => {
      if (a.id === 'grupo-nigeriano') return -1;
      if (b.id === 'grupo-nigeriano') return 1;
      const likesA = likes[a.id] || 0;
      const likesB = likes[b.id] || 0;
      if (likesB === likesA) return a.title.localeCompare(b.title);
      return likesB - likesA;
    });
  }, [groups, likes, selectedCategory]);

  const isAdmin = user && user.email === 'gustvxlz1@gmail.com';

  const playSound = useCallback((type: 'pop' | 'glitch' | 'click' | 'close') => {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      } else if (type === 'close') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      } else if (type === 'glitch') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(Math.random() * 100 + 50, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        const interval = setInterval(() => {
          osc.frequency.setValueAtTime(Math.random() * 1000, ctx.currentTime);
        }, 50);
        setTimeout(() => clearInterval(interval), 1500);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (type === 'glitch' ? 1.5 : 0.1));
    } catch (e) {
      console.warn("Audio Context missed", e);
    }
  }, []);

  // Game State
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStep, setGameStep] = useState(0);
  const [score, setScore] = useState(0);
  const [gameFeedback, setGameFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const addPopup = useCallback(() => {
    if (isTranscended || isGameActive || hideAds) return;
    const randomNews = ADS_DATA[Math.floor(Math.random() * ADS_DATA.length)];
    setPopups(prev => {
      // Max 4 popups on screen as requested
      if (prev.length >= 4) return prev;
      playSound('pop');
      return [...prev, { 
        id: Date.now() + Math.random(),
        title: randomNews.title,
        category: "ANÚNCIO",
        image: randomNews.imageUrl,
        intensity: "urgent" as const
      }];
    });
  }, [isTranscended, isGameActive, playSound]);

  useEffect(() => {
    if (isTranscended || isGameActive) {
      setPopups([]);
      return;
    }

    const timer = setTimeout(() => {
      addPopup();
    }, 1000);

    // Sporadic addition: appears occasionally but respects user clearing them
    const interval = setInterval(() => {
      // Lower probability and check length
      if (Math.random() > 0.6) { 
        addPopup();
      }
    }, 6000); // Slower interval (6 seconds)

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [addPopup, isTranscended, isGameActive]);

  const handleTranscend = () => {
    playSound('click');
    if (skipQuiz || isQuestionsDisabled) {
        triggerFinalTranscendence();
        return;
    }
    setIsGameActive(true);
    setPopups([]);
  };

  const submitAnswer = (answeredFake: boolean) => {
    const question = GAME_QUESTIONS[gameStep];
    const isCorrect = answeredFake === question.isFake;
    
    if (isCorrect) setScore(s => s + 1);
    setGameFeedback({ 
      isCorrect, 
      message: question.explanation 
    });

    setTimeout(() => {
      setGameFeedback(null);
      if (gameStep < GAME_QUESTIONS.length - 1) {
        setGameStep(s => s + 1);
      } else {
        // Game Over
        if (score + (isCorrect ? 1 : 0) >= 3) {
            triggerFinalTranscendence();
        } else {
            resetGame();
        }
      }
    }, 3000);
  };

  const triggerFinalTranscendence = () => {
    setTranscendAnim(true);
    playSound('glitch');
    // Stronger glitch effects
    const shake = setInterval(() => {
      window.scrollTo(Math.random() * 10, window.scrollY + (Math.random() * 10 - 5));
    }, 50);

    setTimeout(() => {
      clearInterval(shake);
      setIsTranscended(true);
      setTranscendAnim(false);
      setIsGameActive(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2500);
  };

  const resetGame = () => {
    setIsGameActive(false);
    setGameStep(0);
    setScore(0);
    alert("Você não conseguiu distinguir as mentiras o suficiente. Tente novamente após ver mais o caos.");
  };

  const removePopup = (id: number) => {
    playSound('close');
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className={cn(
      "min-h-screen font-sans overflow-x-hidden relative transition-colors duration-1000",
      isTranscended 
        ? (isDarkNet ? "bg-[#050505] text-[#00ff41] [text-shadow:0_0_5px_rgba(0,255,65,0.5)]" : "bg-neutral-background text-text-main") 
        : "bg-[#f0f0f0] text-black"
    )}>
      {/* Detail View Overlay (Overrides everything when a news is selected) */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[500] overflow-y-auto",
              isTranscended 
                ? (isDarkNet ? "bg-[#050505] text-[#00ff41]" : "bg-neutral-background") 
                : "bg-white text-black"
            )}
          >
            <div className="max-w-6xl mx-auto px-6 py-12">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
              >
                <div className="flex justify-between items-start mb-8">
                    <button 
                    onClick={() => setSelectedGroup(null)}
                    className="flex items-center gap-2 font-mono font-black text-xs uppercase tracking-widest hover:text-fake-red transition-colors cursor-pointer"
                    >
                    ← Voltar para {isTranscended ? "Investigações" : "O Jornal"}
                    </button>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => handleShare(selectedGroup)}
                            className="bg-white border-2 border-black px-6 py-2 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_black] hover:border-fake-red transition-all"
                        >
                            <Share2 className="w-4 h-4" /> COMPARTILHAR
                        </button>
                        <button 
                            onClick={() => setSelectedGroup(null)}
                            className="bg-black text-white px-6 py-2 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_white] hover:bg-neutral-800 transition-all"
                        >
                            <X className="w-4 h-4" /> FECHAR
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                  <div className="lg:col-span-3 space-y-12">
                    <header className="space-y-4">
                      <span className="px-3 py-1 bg-fake-red text-white text-[10px] font-black uppercase tracking-widest">{selectedGroup.name} — Investigação Central</span>
                      <h1 className="text-5xl md:text-7xl font-serif font-black leading-none tracking-tighter">{selectedGroup.title}</h1>
                      <div className="h-2 w-32 bg-fake-red"></div>
                      <p className="text-xl text-text-muted font-serif italic max-w-2xl">{selectedGroup.description}</p>
                    </header>

                    {/* Video Section */}
                    <section className="space-y-6">
                      <h3 className="font-mono font-black text-xs uppercase tracking-[0.3em] border-b-2 border-neutral-100 pb-2">Conteúdo em Vídeo</h3>
                      <div className="aspect-video bg-black border-4 border-black shadow-[20px_20px_0px_rgba(220,38,38,1)]">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={selectedGroup.videoUrl} 
                          title="YouTube video player" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </section>
                  </div>

                  <aside className="lg:col-span-2 space-y-12">
                    {/* Slides Section - CAROUSEL */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-2">
                        <h3 className="font-mono font-black text-xs uppercase tracking-[0.3em]">Evidências Visuais</h3>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsFullScreen(true)}
                                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"
                                title="Ampliar"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            <div className="h-4 w-px bg-neutral-200"></div>
                            <button 
                                onClick={() => setCurrentSlideIdx(prev => (prev > 0 ? prev - 1 : selectedGroup.slides.length - 1))}
                                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="font-mono text-xs font-black">{currentSlideIdx + 1}/{selectedGroup.slides.length}</span>
                            <button 
                                onClick={() => setCurrentSlideIdx(prev => (prev < selectedGroup.slides.length - 1 ? prev + 1 : 0))}
                                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                      
                      <div className="relative aspect-[16/10] bg-neutral-100 shadow-[10px_10px_0px_black] border-4 border-black overflow-hidden group">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={currentSlideIdx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                src={selectedGroup.slides[currentSlideIdx]}
                                className="w-full h-full object-cover transition-all"
                                referrerPolicy="no-referrer"
                            />
                        </AnimatePresence>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                            <p className="bg-black text-white font-mono text-[9px] px-2 py-1 font-black uppercase tracking-widest">EVIDÊNCIA #0{currentSlideIdx + 1}</p>
                        </div>
                      </div>
                    </section>

                    {/* Team Section */}
                    <section className="space-y-6">
                        <h3 className="font-mono font-black text-xs uppercase tracking-[0.3em] border-b-2 border-neutral-100 pb-2">Equipe de Investigação</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {selectedGroup.members.map((member, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-neutral-50 p-4 border-2 border-black">
                                    <div className="w-12 h-12 bg-neutral-200 border-2 border-black overflow-hidden">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 opacity-30" /></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-serif font-black italic">{member.name}</p>
                                        <p className="text-[10px] font-mono uppercase text-neutral-500">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Interaction Summary */}
                    <div className="flex gap-4 pt-12">
                        <button 
                            onClick={toggleLike}
                            className={cn(
                                "flex-1 p-6 border-4 border-black font-mono font-black text-xs uppercase flex items-center justify-center gap-4 transition-all shadow-[8px_8px_0px_black] active:shadow-none translate-y-[-4px] active:translate-y-0",
                                userLikes[selectedGroup.id] ? "bg-fake-red text-white" : "bg-white hover:bg-neutral-50"
                            )}
                        >
                            <Heart className={cn("w-6 h-6", userLikes[selectedGroup.id] && "fill-current")} />
                            <div className="text-left">
                                <p className="leading-none">{likes[selectedGroup.id] || 0} LIKES</p>
                                <p className="text-[8px] opacity-60">CONCORDO TOTALMENTE</p>
                            </div>
                        </button>
                    </div>
                  </aside>
                </div>

                {/* Comentários Section */}
                <section className="pt-20 border-t-8 border-black">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                        <div>
                            <h3 className="text-4xl font-serif font-black italic tracking-tighter uppercase mb-2">Debate Comunitário</h3>
                            <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest">O que estão dizendo nas sombras da rede</p>
                        </div>
                        <div className="bg-fake-red text-white px-4 py-2 font-mono text-[10px] font-black animate-pulse">DISCUSSÃO ATIVA</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1">
                            <div className="bg-black text-white p-8 border-4 border-fake-red sticky top-32">
                                <h4 className="font-mono font-black text-xs uppercase mb-6 tracking-widest italic">Deixe sua opinião:</h4>
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const content = (e.currentTarget.elements.namedItem('comment') as HTMLTextAreaElement).value;
                                        postComment(content);
                                        e.currentTarget.reset();
                                    }}
                                    className="space-y-4"
                                >
                                    <textarea 
                                        name="comment"
                                        placeholder="Minha verdade é..."
                                        className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-mono text-sm focus:border-white outline-none min-h-[120px]"
                                    />
                                    <button 
                                        type="submit"
                                        className="w-full bg-white text-black py-4 font-mono font-black uppercase text-xs tracking-[0.3em] hover:bg-neutral-200 transition-all border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    >
                                        PUBLICAR AGORA
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            {(comments[selectedGroup.id] || []).map((comment, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={comment.id} 
                                    className="bg-white border-2 border-black p-8 group hover:shadow-[10px_10px_0px_black] transition-all relative"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 border-2 border-black bg-neutral-100 flex items-center justify-center">
                                            <User className="w-5 h-5 opacity-40" />
                                        </div>
                                        <div>
                                            <p className="font-serif font-black italic text-lg leading-tight">{comment.userName}</p>
                                            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                                                {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('pt-BR') : 'Agora mesmo'}
                                            </p>
                                        </div>
                                        {isAuthAdmin && (
                                            <button 
                                                onClick={() => deleteComment(selectedGroup.id, comment.id)}
                                                className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="font-serif text-lg leading-relaxed italic text-neutral-800">“{comment.content}”</p>
                                </motion.div>
                            ))}
                            {(!comments[selectedGroup.id] || comments[selectedGroup.id].length === 0) && (
                                <div className="text-center py-20 border-4 border-dashed border-neutral-200">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    <p className="font-mono text-xs text-neutral-300 uppercase italic">Nenhuma voz se manifestou sobre este assunto...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <footer className="pt-20 text-center opacity-30">
                    <p className="font-mono text-[8px] uppercase tracking-[0.5em] italic">
                        Este conteúdo foi desenvolvido pela equipe {selectedGroup.name} para fins educativos sobre a disseminação de informações em meios digitais.
                    </p>
                </footer>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Content */}

      <AnimatePresence>
        {isGameActive && !transcendAnim && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-xl w-full bg-white border-8 border-fake-red p-10 shadow-[20px_20px_0px_white]">
                <div className="flex items-center gap-4 mb-8">
                    <ShieldAlert className="w-12 h-12 text-fake-red animate-pulse" />
                    <div>
                        <h2 className="text-3xl font-serif font-black italic tracking-tighter">FACT-CHECK CHALLENGE</h2>
                        <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Prove que você merece ver a verdade</p>
                    </div>
                </div>

                <div className="mb-10 space-y-6">
                    <div className="bg-neutral-100 p-8 border-2 border-black min-h-[150px] flex items-center justify-center text-center">
                        <p className="text-xl font-serif font-bold italic leading-relaxed">
                            "{GAME_QUESTIONS[gameStep].question}"
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button 
                          disabled={!!gameFeedback}
                          onClick={() => {
                            playSound('click');
                            submitAnswer(false);
                          }}
                          className="flex-1 bg-green-600 text-white py-4 font-mono font-black uppercase hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                            FATO
                        </button>
                        <button 
                          disabled={!!gameFeedback}
                          onClick={() => {
                            playSound('click');
                            submitAnswer(true);
                          }}
                          className="flex-1 bg-fake-red text-white py-4 font-mono font-black uppercase hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            FAKE
                        </button>
                    </div>

                    {skipQuiz && (
                         <button 
                            onClick={() => triggerFinalTranscendence()}
                            className="w-full mt-4 border border-white/20 text-white/40 py-2 font-mono text-[10px] uppercase hover:text-white transition-colors"
                        >
                            Pular para a Verdade (Admin)
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {gameFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-6 border-4 flex items-start gap-4 mb-6",
                            gameFeedback.isCorrect ? "bg-green-50 border-green-500 text-green-800" : "bg-red-50 border-red-500 text-red-800"
                          )}
                        >
                            {gameFeedback.isCorrect ? <CheckCircle2 className="shrink-0 mt-1" /> : <AlertCircle className="shrink-0 mt-1" />}
                            <p className="text-sm font-bold leading-relaxed">{gameFeedback.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between items-center text-[10px] font-mono font-black text-neutral-400">
                    <span>QUESTÃO {gameStep + 1} de {GAME_QUESTIONS.length}</span>
                    <span>PONTOS: {score}/{GAME_QUESTIONS.length} (Mínimo: 3)</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transcendAnim && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
              {/* Hacked Glitch Layers */}
              <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
                <div className="flex flex-wrap gap-1 text-[#00ff41] font-mono text-[9px] items-center justify-center select-none w-full h-full p-2">
                    {Array.from({ length: 2500 }).map((_, i) => (
                        <motion.span 
                            key={i} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.05, 1, 0.05] }}
                            transition={{ 
                                duration: Math.random() * 2 + 0.5, 
                                repeat: Infinity,
                                delay: Math.random() * 5 
                            }}
                            className="w-3 h-3 flex items-center justify-center"
                        >
                            {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
                        </motion.span>
                    ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-black/70 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-white mix-blend-difference animate-pulse opacity-5"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div 
                  animate={{ 
                    x: [0, -20, 20, -10, 0],
                    y: [0, 10, -10, 5, 0],
                    opacity: [1, 0.8, 1, 0.5, 1],
                    skew: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                  className="text-7xl md:text-9xl font-serif font-black italic text-fake-red glitch-text"
                  data-text="SISTEMA CORROMPIDO"
                >
                  SISTEMA CORROMPIDO
                </motion.div>
                <div className="mt-8 font-mono text-green-500 text-lg md:text-2xl font-black">
                    {">"} BYPASSING_SECURITY_PROTOCOLS... [OK]
                </div>
                <div className="mt-2 font-mono text-green-500 text-sm opacity-50">
                    {">"} INJECTING_TRUTH.EXE...
                </div>
            </div>
            
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 60],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-0 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isTranscended ? (
        <>
          {/* RAW BACKGROUND SITE (SITE CRU) LOOK */}
          <div className="fixed inset-0 z-0 p-12 opacity-20 pointer-events-none select-none">
            <div className="border-b-2 border-gray-400 mb-4 pb-2">
              <h1 className="text-2xl font-serif font-bold text-gray-500 uppercase">MEU SITE EM CONSTRUÇÃO</h1>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded" style={{ width: i % 2 === 0 ? '100%' : '66%' }}></div>
              ))}
            </div>
            <p className="text-gray-400 text-sm italic mb-10 max-w-2xl">
              Este site está sendo desenvolvido para combater a desinformação. Por enquanto, aqui não há nada além de testes básicos de layout. O conteúdo real será inserido em breve após a fase de prototipagem.
            </p>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 border-2 border-dashed border-gray-300"></div>
              ))}
            </div>
          </div>

          {/* Header Editorial */}
          <header className="bg-fake-black text-white sticky top-0 z-40 shadow-lg border-b-2 border-fake-red">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Menu className="w-6 h-6 md:hidden" />
                <h1 className="text-2xl md:text-3xl font-serif font-black italic tracking-tighter uppercase">
                  <span className="text-fake-red font-mono">JTN</span> — TRUE NEWS
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-widest font-bold">
                {['POLÍTICA', 'SAÚDE', 'CIÊNCIA', 'TECNOLOGIA', 'UNIVERSO'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={cn(
                            "hover:text-fake-red transition-colors",
                            selectedCategory === cat && "text-fake-red border-b-2 border-fake-red"
                        )}
                    >
                        {cat}
                    </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 cursor-pointer hover:text-fake-red" />
                <div className="bg-fake-red text-white text-[10px] font-bold px-2 py-0.5 animate-pulse rounded-sm">
                  LIVE
                </div>
              </div>
            </div>
            <div className="bg-fake-red text-white text-[10px] md:text-xs py-1 font-mono font-bold border-t border-white/10 uppercase italic overflow-hidden whitespace-nowrap">
              <div className="animate-marquee inline-block">
                🚨 BOMBA: GOVERNO SECRETO REVELA QUE O SOL É UMA LÂMPADA DE LED 🚨 ATENÇÃO: VACINA CONTRA O MEDO ESTARÁ DISPONÍVEL EM BREVE 🚨 URGENTE: CACHORROS QUE FALAM PEDEM MAIS PETISCOS 🚨
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {/* Notícia Principal - Editorial Style */}
            <div className="lg:col-span-2 space-y-12">
              <article className="bg-white rounded-none shadow-[10px_10px_0px_rgba(0,0,0,0.1)] border-2 border-black overflow-hidden hover:shadow-[15px_15px_0px_rgba(0,0,0,0.15)] transition-shadow">
                <div className="aspect-[21/9] bg-neutral-200 relative group overflow-hidden border-b-2 border-black">
                  <img 
                    src={groups[0]?.thumbnail || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"} 
                    alt="Hero news"
                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-0 left-0 bg-fake-red text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest">
                    Exclusivo
                  </div>
                </div>
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-2 text-fake-red text-[10px] font-mono font-black mb-6 uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4" />
                    <span>Edição Digital #482 — Em Destaque</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-black leading-[1.1] mb-8 tracking-tight">
                    {sortedGroups[0]?.title || "PRÍNCIPE NIGERIANO PRECISA DE SUA AJUDA"}
                  </h2>
                  <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                    <p className="text-xl text-neutral-700 font-serif leading-relaxed italic border-l-4 border-fake-red pl-6 py-2">
                       {sortedGroups[0]?.description || "Herdei 50 milhões de dólares mas preciso de uma pequena transferência para liberar o fundo. Você ficará com 10%!"}
                    </p>
                    <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
                      {sortedGroups[0]?.description ? "Matéria de investigação completa disponível nesta plataforma. Confira os dados coletados pela nossa equipe." : "Relatos indicam que a fortuna está bloqueada em um banco internacional aguardando apenas a taxa de processamento de um herdeiro legítimo."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t-2 border-black pt-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-none bg-fake-black border-2 border-fake-red flex items-center justify-center text-white font-serif font-black text-xl italic">
                        VU
                      </div>
                      <div>
                        <p className="text-xs font-mono font-black uppercase tracking-wider">Redação Verdade Urgente</p>
                        <p className="text-[10px] font-bold text-fake-red uppercase">Atualizado agora mesmo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="hidden md:block text-[9px] font-mono font-black border-2 border-fake-red px-2 py-1 uppercase italic tracking-tighter">
                          {groups[0]?.source || "Fonte: confia"}
                      </p>
                      <div className="flex gap-4">
                      <button className="p-3 bg-neutral-100 hover:bg-fake-red hover:text-white border border-black rounded-none transition-all cursor-pointer">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button className="px-6 py-3 bg-fake-black text-white text-xs font-black uppercase tracking-widest border border-black hover:bg-neutral-800 transition-all cursor-pointer">
                        Assinar Agora
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </article>

              {/* Added more home news grid */}
              {!hideAds && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {ADS_DATA.map(news => (
                        <div 
                          key={news.id} 
                          onClick={() => {
                            playSound('click');
                            setSelectedGroup({
                              id: `ad-${news.id}`,
                              name: "Publicidade JTN",
                              title: news.title,
                              description: "A gente precisa pagar os servidores, então aqui está uma oferta imperdível (ou não). Na verdade, não achei que você ia clicar… mas já que clicou, só acredita em mim 👍",
                              thumbnail: news.imageUrl,
                              slides: [news.imageUrl],
                              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                              members: [{ name: "Anunciante", role: "Patrocínio" }],
                              category: 'tecnologia',
                              source: news.source
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-white border-4 border-black p-4 group cursor-pointer hover:shadow-[8px_8px_0px_black] transition-all block"
                        >
                            <div className="aspect-video bg-neutral-100 mb-4 overflow-hidden border-2 border-black">
                               <img src={news.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="text-[8px] font-mono font-black text-fake-red uppercase">PATROCINADO</p>
                                <p className="text-[7px] font-mono font-bold bg-neutral-100 px-1 uppercase tracking-tighter">
                                    {news.source}
                                </p>
                              </div>
                              <h4 className="font-serif font-black text-lg leading-tight">{news.title}</h4>
                              <p className="text-[10px] font-mono text-neutral-500 line-clamp-2">{news.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
              )}

              {/* Notícias Mais Importantes */}
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl">💎</span>
                    <h3 className="text-3xl font-serif font-black italic tracking-tighter uppercase">NOTÍCIAS EXTREMAMENTE IMPORTANTES</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {NOT_READ_BUT_AGREE.map((item, idx) => (
                        <div key={idx} className="bg-white border-2 border-black p-6 flex justify-between items-center group hover:bg-neutral-50 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-serif font-black text-xl italic">{item.title}</h4>
                                <p className="text-[10px] font-mono text-fake-red font-black uppercase">{item.source}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        window.open(window.location.origin + window.location.pathname + '?news=' + idx, '_blank');
                                    }}
                                    className="p-3 border-2 border-black hover:bg-black hover:text-white transition-all rounded-full"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleShare()}
                                    className="p-3 border-2 border-black hover:bg-black hover:text-white transition-all rounded-full"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

              {/* Teorias da Conspiração */}
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl">⚠️</span>
                    <h3 className="text-3xl font-serif font-black italic tracking-tighter uppercase">Teorias da conspiração</h3>
                </div>
                
                <div className="bg-neutral-900 text-white p-8 border-4 border-fake-red mb-10 shadow-[15px_15px_0px_black]">
                    <h4 className="text-xl font-serif font-black italic mb-6 uppercase tracking-widest text-fake-red">O Que Estão Escondendo?</h4>
                        <div className="space-y-4">
                            <div className="relative">
                                {theoryGif && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <button 
                                            onClick={() => setTheoryGif("")}
                                            className="bg-black/50 text-white p-1 rounded-full hover:bg-black transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <img src={theoryGif} className="h-16 w-16 object-cover border-2 border-fake-red" />
                                    </div>
                                )}
                                <textarea 
                                    value={theoryContent}
                                    onChange={(e) => setTheoryContent(e.target.value)}
                                    placeholder="Escreva sua teoria... (A Lua é um holograma?)"
                                    className="w-full bg-neutral-800 border-2 border-neutral-700 p-4 font-mono text-sm focus:border-fake-red outline-none min-h-[80px] text-white"
                                />
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={() => {
                                        handlePostTheory(theoryContent, theoryGif);
                                        setTheoryContent("");
                                        setTheoryGif("");
                                    }}
                                    className="flex-1 md:flex-none bg-fake-red text-white px-10 py-4 font-mono font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                                >
                                    <Send className="w-5 h-5" />
                                    POSTAR TEORIA
                                </button>
                            </div>

                            <AnimatePresence>
                            </AnimatePresence>
                        </div>

                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-fake-red">
                        {theories.length === 0 && (
                            <div className="text-center py-10 opacity-40">
                                <Ghost className="w-12 h-12 mx-auto mb-4" />
                                <p className="font-mono text-xs uppercase italic">Nenhuma teoria detectada pelos satélites ainda...</p>
                            </div>
                        )}
                        {theories.map((theory) => (
                            <div key={theory.id} className="relative border-l-4 border-fake-red pl-6 py-4 bg-neutral-800/50 hover:bg-neutral-800 transition-all group/theory">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full border border-fake-red overflow-hidden bg-neutral-700">
                                            {theory.userPhoto ? (
                                                <img src={theory.userPhoto} alt={theory.userName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="font-mono text-[10px] font-black text-fake-red uppercase">{theory.userName}</p>
                                        <span className="text-[10px] font-mono text-neutral-500">• {new Date(theory.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                    </div>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => deleteTheory(theory.id)}
                                            className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="font-serif italic text-lg leading-tight uppercase tracking-tight mb-4">“{theory.content}”</p>
                                {theory.gifUrl && (
                                    <div className="border-2 border-fake-red max-w-[300px] overflow-hidden">
                                        <img src={theory.gifUrl} alt="Theory GIF" className="w-full h-auto" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              {/* Transcend Button moved here */}
              <div className="py-20 flex flex-col items-center">
                <div className="h-px w-full bg-black/10 mb-20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f0f0f0] px-4 font-mono text-[10px] font-bold text-neutral-400">FIM DO CONTEÚDO SUGERIDO</div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTranscend}
                  className="bg-black text-white px-12 py-6 rounded-none border-4 border-fake-red shadow-[15px_15px_0px_#dc2626] font-serif font-black italic text-2xl tracking-tighter hover:bg-neutral-900 transition-all cursor-pointer group animate-bounce-slow"
                >
                  MOSTRAR A VERDADE 
                  <span className="ml-4 group-hover:animate-pulse">⚡</span>
                </motion.button>
                <p className="mt-8 text-xs font-mono font-bold text-fake-red animate-pulse uppercase tracking-[0.3em]">Clique para encerrar a simulação</p>
              </div>
            </div>

            {/* Sidebar Ads */}
            <aside className="space-y-12 transition-all">
              {!hideAds && (
                <>
                  {/* Fake Ad 1 */}
                  <a 
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-yellow-300 border-4 border-black p-6 text-center animate-pulse rotate-1 transition-transform hover:scale-105"
                  >
                    <p className="text-[10px] font-mono font-black mb-2 text-black/50">PUBLICIDADE - ANÚNCIO</p>
                    <h4 className="text-2xl font-serif font-black italic mb-6 leading-none uppercase">Cura milagrosa para a calvície em 24h revelada!</h4>
                    <div className="bg-black text-white py-3 font-mono text-xs font-black tracking-widest">CLIQUE E DESCUBRA</div>
                  </a>

                  {/* Meme Ad 1 */}
                  <a 
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-white border-4 border-fake-red p-6 text-center shadow-[10px_10px_0px_#dc2626] transition-transform hover:-translate-y-2"
                  >
                    <div className="bg-fake-red text-white text-[8px] font-black inline-block px-2 mb-4">OPORTUNIDADE ÚNICA</div>
                    <h4 className="text-xl font-serif font-black mb-4">Mães solteiras a 3km de você fazem... AULAS DE DANÇA!</h4>
                    <p className="text-[10px] font-mono text-neutral-500">Venha dançar tango agora mesmo com vizinhas dedicadas.</p>
                  </a>

                  {/* Fake Ad 2 */}
                  <a 
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block bg-black text-white border-4 border-fake-red p-8 -rotate-1 relative overflow-hidden transition-transform hover:scale-105"
                  >
                    <div className="absolute top-0 right-0 bg-fake-red text-white text-[8px] font-black px-2 py-1 transform translate-x-2 -translate-y-2 rotate-12">OFERTA</div>
                    <p className="text-[8px] font-mono text-fake-red mb-4 font-black">MÉTODO SECRETO DO PIX</p>
                    <h4 className="text-3xl font-serif font-black leading-[0.9] italic mb-6">ELA GANHOU R$ 4.000 DORMINDO</h4>
                    <div className="mt-8 border-t border-white/20 pt-4">
                      <p className="text-[11px] text-neutral-400 italic">"Nunca imaginei que fatiar maçãs fosse dar tanto dinheiro para o meu saldo bancário..."</p>
                    </div>
                  </a>
                </>
              )}

              <div className="sticky top-24 space-y-10">
                <div className="border-t-4 border-black pt-8">
                    <h3 className="font-serif font-black text-2xl uppercase tracking-tighter mb-8">Notícias em Alta</h3>
                    <div className="space-y-10">
                        {["Ouro está sendo fabricado por meteoros", "Nova lei impede brasileiros de sonharem", "Dono do sol revela cobrar por raios UV"].map((text, i) => (
                            <div key={i} className="flex gap-4 group cursor-pointer border-b border-black/10 pb-6">
                                <span className="text-5xl font-serif font-black text-neutral-200 group-hover:text-fake-red transition-colors">0{i+1}</span>
                                <p className="font-serif font-black italic leading-tight group-hover:underline text-lg">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </aside>
          </main>

      {/* Footer / Credits */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
          <div className="bg-fake-black text-white p-12 border-4 border-fake-red shadow-[20px_20px_0px_black] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fake-red/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                      <h3 className="text-4xl font-serif font-black italic tracking-tighter mb-4 uppercase">Assine o Nosso Jornal</h3>
                      <p className="font-mono text-xs text-neutral-400 mb-8 max-w-sm">
                          Contribua com a formatura do <span className="text-white font-bold">3º ANO A</span>. 
                          Qualquer valor ajuda a manter nossa investigação independente e nossos sonhos vivos.
                      </p>
                      <button 
                        onClick={copyPix}
                        className="bg-fake-red text-white px-8 py-4 font-mono font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all flex items-center gap-3 shadow-lg"
                      >
                        <Zap className="w-4 h-4" /> COPIAR PIX DA TURMA
                      </button>
                      <p className="mt-4 text-[9px] font-mono text-neutral-500 uppercase italic">
                        Todos os pagamentos serão destinados à formatura
                      </p>
                  </div>
                  <div className="flex justify-center">
                      <div className="w-48 h-48 bg-white p-4 flex items-center justify-center border-4 border-black rotate-3 hover:rotate-0 transition-transform">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=652603000055" alt="QR Code PIX" className="w-full h-full grayscale" />
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <footer className={cn(
        "border-t-8 border-black p-12 mt-20 transition-colors",
        isDarkNet ? "bg-black border-[#00ff41]" : "bg-neutral-surface"
      )}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div>
                <h4 className="text-4xl font-serif font-black italic tracking-tighter uppercase mb-4 leading-none">
                    {APP_NAME} <span className="text-fake-red">NEWS</span>
                </h4>
                <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase opacity-60">PRODUCED BY THE BRAINS OF 3º ANO A</p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                <p className="font-mono text-[10px] font-black uppercase tracking-widest opacity-40 col-span-2 mb-2">Editoria e Criadores</p>
                <div className="font-serif italic text-lg leading-tight">Gustavo</div>
                <div className="font-serif italic text-lg leading-tight">Beatriz</div>
                <div className="font-serif italic text-lg leading-tight">Lucas</div>
                <div className="font-serif italic text-lg leading-tight">Felipe</div>
            </div>

            <div className="flex flex-col items-end">
                <p className="font-mono text-[10px] font-black bg-black text-white px-3 py-1 mb-2">© 2026 - DIVERSIDADE & CULTURA</p>
                <p className="font-mono text-[8px] opacity-40">ESTE SITE É UMA EXPERIÊNCIA EDUCACIONAL</p>
            </div>
        </div>
      </footer>

          {/* Footer Indicator Simulation */}
          <footer className="fixed bottom-8 left-0 right-0 flex justify-center z-[200] pointer-events-none">
            <div 
                onClick={() => setIsAdminPanelOpen(true)}
                className="bg-black text-white px-8 py-3 rounded-full flex items-center gap-6 border border-white/20 backdrop-blur-md pointer-events-auto shadow-2xl cursor-pointer hover:border-fake-red transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-fake-red rounded-full animate-pulse shadow-[0_0_8px_#dc2626] group-hover:bg-white group-hover:shadow-[0_0_8px_#fff]"></div>
                <span className="text-[10px] font-mono font-black tracking-[0.3em] uppercase">SIMULAÇÃO ATIVA</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <div className="text-[9px] font-mono font-bold text-neutral-400">STATUS: CAPTANDO DADOS</div>
            </div>
          </footer>

          {/* Profile Modal */}
          <AnimatePresence>
              {profileModalOpen && userProfile && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md"
                  >
                      <div className="max-w-md w-full bg-white border-8 border-black p-10 shadow-[20px_20px_0px_var(--color-fake-red)]">
                          <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
                              <h3 className="text-3xl font-serif font-black italic uppercase italic">Ajustar Perfil</h3>
                              <button onClick={() => setProfileModalOpen(false)}>
                                  <X className="w-8 h-8" />
                              </button>
                          </div>
                          
                          <div className="space-y-8">
                              <div className="flex flex-col items-center gap-6">
                                  <div className="relative group">
                                      <div className="w-32 h-32 border-4 border-black overflow-hidden bg-neutral-100">
                                          {userProfile.photoURL ? (
                                              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                          ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                  <User className="w-16 h-16 opacity-20" />
                                              </div>
                                          )}
                                      </div>
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                          <Camera className="text-white w-8 h-8" />
                                      </div>
                                  </div>
                                  
                                  <div className="w-full space-y-4">
                                      <div>
                                          <label className="block text-[8px] font-mono font-black mb-2 uppercase text-neutral-400">Nome Verdadeiro</label>
                                          <div className="relative">
                                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                                              <input 
                                                  id="edit-profile-name"
                                                  type="text"
                                                  defaultValue={userProfile.name}
                                                  className="w-full border-2 border-black p-3 pl-10 font-serif font-black text-lg focus:bg-neutral-50 outline-none"
                                                  placeholder="Seu nome"
                                              />
                                          </div>
                                      </div>
                                      <div>
                                          <label className="block text-[8px] font-mono font-black mb-2 uppercase text-neutral-400">URL da Foto</label>
                                          <div className="relative">
                                              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                                              <input 
                                                  id="edit-profile-photo"
                                                  type="text"
                                                  defaultValue={userProfile.photoURL}
                                                  className="w-full border-2 border-black p-3 pl-10 font-mono text-xs focus:bg-neutral-50 outline-none"
                                                  placeholder="https://imagem.com/foto.jpg"
                                              />
                                          </div>
                                          <p className="mt-2 text-[8px] font-mono text-neutral-500 italic uppercase">Ou envie do dispositivo nas opções do sistema</p>
                                      </div>
                                  </div>
                              </div>

                              <button 
                                onClick={() => {
                                    const nameInput = document.getElementById('edit-profile-name') as HTMLInputElement;
                                    const photoInput = document.getElementById('edit-profile-photo') as HTMLInputElement;
                                    handleUpdateProfile(nameInput.value, photoInput.value);
                                }}
                                className="w-full bg-black text-white py-5 font-mono font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all border-4 border-black shadow-[10px_10px_0px_#dc2626]"
                              >
                                SALVAR ALTERAÇÕES
                              </button>
                              
                              <button 
                                onClick={() => auth.signOut()}
                                className="w-full border-4 border-black py-4 font-mono font-black uppercase text-xs tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-center gap-3"
                              >
                                <Lock className="w-4 h-4" /> ENCERRAR SESSÃO
                              </button>
                          </div>
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>

          {/* Payment Prompt Modal */}
          <AnimatePresence>
            {showPaymentPrompt && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
                >
                    <div className="max-w-md w-full bg-white border-8 border-black p-10 rounded-[3rem] text-center shadow-[20px_20px_0px_white]">
                        <div className="w-20 h-20 bg-fake-red rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <Heart className="w-10 h-10 text-white fill-current" />
                        </div>
                        <h2 className="text-3xl font-serif font-black italic mb-4">VOCÊ FEZ O PAGAMENTO?</h2>
                        <p className="text-sm font-mono text-neutral-500 mb-10 leading-relaxed uppercase">
                            Detectamos que você copiou nossa chave há alguns minutos. 
                            Sua ajuda é fundamental para nossa formatura!
                        </p>
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={() => {
                                    localStorage.setItem('hasPaid', 'true');
                                    setHideAds(true);
                                    setShowPaymentPrompt(false);
                                    alert("MUITO OBRIGADO! Como agradecimento, removemos todos os anúncios para sua navegação ser pura verdade.");
                                }}
                                className="w-full bg-black text-white py-5 font-mono font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all border-4 border-black"
                            >
                                SIM, EU FIZ!
                            </button>
                            <button 
                                onClick={() => {
                                    setHideAds(true);
                                    setShowPaymentPrompt(false);
                                    alert("OBRIGADO POR ACESSAR O SITE! Mesmo sem o apoio financeiro, sua presença aqui é importante para espalhar a verdade.");
                                }}
                                className="w-full bg-white text-black py-5 font-mono font-black uppercase text-xs tracking-widest hover:bg-neutral-50 transition-all border-4 border-black"
                            >
                                AINDA NÃO
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Annoying PIX Popups */}
          <div className="fixed inset-0 pointer-events-none z-[100]">
              <AnimatePresence>
                  {!pixCopiedAt && !hideAds && !isTranscended && !isGameActive && showAnnoyingPopups && Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={`annoying-${i}-${closedPopupsCount}`}
                        initial={{ opacity: 0, scale: 0.5, x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1,
                            x: Math.random() * 200 - 100,
                            y: Math.random() * 200 - 100
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                      >
                          <div className="bg-fake-red text-white p-6 border-4 border-black shadow-[10px_10px_0px_black] w-64 text-center relative">
                              <button 
                                onClick={() => setClosedPopupsCount(prev => prev + 1)}
                                className="absolute -top-4 -right-4 bg-white text-black border-2 border-black p-1 hover:bg-neutral-200 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <h4 className="font-mono font-black text-xs uppercase mb-2">⚠ AVISO IMPORTANTE ⚠</h4>
                              <p className="font-serif italic text-sm mb-4 leading-tight">Ajude o 3º ANO A a se formar! Copie o PIX para fechar os anúncios.</p>
                              <button 
                                onClick={copyPix}
                                className="w-full bg-white text-black py-2 font-mono font-black text-[10px] uppercase border-2 border-black hover:bg-neutral-100"
                              >
                                COPIAR PIX AGORA
                              </button>
                          </div>
                      </motion.div>
                  ))}
              </AnimatePresence>
          </div>

          {/* Admin Panel Overlay */}
          <AnimatePresence>
              {isAdminPanelOpen && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] bg-neutral-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 overflow-y-auto"
                  >
                        {!isAuthAdmin ? (
                            <div className="max-w-md w-full bg-black border-4 border-white p-12 text-center shadow-[0_0_100px_rgba(255,255,255,0.05)]">
                                <h2 className="text-white font-mono font-black text-2xl mb-8 uppercase tracking-widest italic">Acesso Restrito</h2>
                                <input 
                                    type="password" 
                                    placeholder="Senha de Acesso"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                           if (adminPassword === "ABC1020") {
                                               setIsAuthAdmin(true);
                                           } else {
                                               alert("Senha Incorreta");
                                           }
                                        }
                                    }}
                                    className="w-full bg-white text-black p-4 mb-6 text-center focus:outline-none text-2xl font-sans font-black tracking-widest"
                                />
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => {
                                            if (adminPassword === "ABC1020") {
                                                setIsAuthAdmin(true);
                                            } else {
                                                alert("Senha Incorreta");
                                            }
                                        }}
                                        className="flex-1 bg-white text-black py-4 font-mono font-black uppercase hover:bg-neutral-200"
                                    >
                                        ENTRAR
                                    </button>
                                    <button 
                                        onClick={() => setIsAdminPanelOpen(false)}
                                        className="flex-1 border border-white text-white py-4 font-mono font-black uppercase hover:bg-white/10"
                                    >
                                        Sair
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-6xl bg-neutral-900 border-4 border-white h-[85vh] flex flex-col shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                                <div className="bg-white p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-black">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black text-white p-2 font-mono font-black text-[10px] uppercase">HQ TERMINAL</div>
                                        <h2 className="text-black font-mono font-black text-xl uppercase italic tracking-tighter">SISTEMA DE CONTROLE CENTRAL</h2>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        {[
                                            { label: 'Matérias', value: 'matérias' },
                                            { label: 'Comentários', value: 'comentários' },
                                            { label: 'Teorias', value: 'teorias' },
                                            { label: 'Global', value: 'config' }
                                        ].map(tab => (
                                            <button 
                                                key={tab.value}
                                                onClick={() => setAdminTab(tab.value as any)}
                                                className={cn(
                                                    "px-6 py-2 font-mono font-black text-[10px] uppercase border-2 transition-all",
                                                    adminTab === tab.value ? "bg-black text-white border-black" : "border-neutral-200 text-neutral-400 hover:border-black hover:text-black"
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                        <div className="w-px h-6 bg-neutral-200 hidden md:block mx-2"></div>
                                        <button onClick={() => setIsAdminPanelOpen(false)} className="text-black hover:text-red-600 transition-colors">
                                            <X className="w-8 h-8" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                                    {/* Global Config - Always visible at top of tabs or as main entry */}
                                    {adminTab === 'matérias' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 border-b border-white/10 pb-12">
                                                <div className={cn(
                                                    "p-4 border-2 transition-all flex items-center justify-between",
                                                    skipQuiz ? "bg-white text-black border-white" : "bg-neutral-800 border-white/10 text-white/40"
                                                )}>
                                                    <div className="flex items-center gap-4">
                                                        <Zap className={cn("w-6 h-6", skipQuiz ? "text-yellow-400" : "text-neutral-700")} />
                                                        <div>
                                                            <h3 className="font-mono font-black text-xs uppercase tracking-tighter">Pular Quiz (Só Admin)</h3>
                                                            <p className="text-[8px] font-mono mt-1 uppercase opacity-60">Ignora o teste inicial</p>
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer scale-75">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={skipQuiz}
                                                            onChange={(e) => setSkipQuiz(e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-black rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                    </label>
                                                </div>

                                                <div className={cn(
                                                    "p-4 border-2 transition-all flex items-center justify-between",
                                                    isQuestionsDisabled ? "bg-red-600 text-white border-red-600" : "bg-neutral-800 border-white/10 text-white/40"
                                                )}>
                                                    <div className="flex items-center gap-4">
                                                        <ShieldAlert className={cn("w-6 h-6", isQuestionsDisabled ? "text-white" : "text-neutral-700")} />
                                                        <div>
                                                            <h3 className="font-mono font-black text-xs uppercase tracking-tighter">Desativar Quiz (Geral)</h3>
                                                            <p className="text-[8px] font-mono mt-1 uppercase opacity-60">Bloqueio global desativado</p>
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer scale-75">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isQuestionsDisabled}
                                                            onChange={toggleQuestions}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-black rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                                                    </label>
                                                </div>
                                        </div>
                                    )}

                                    {adminTab === 'config' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className={cn(
                                                    "p-8 border-4 transition-all shadow-[8px_8px_0_rgba(0,0,0,0.2)]",
                                                    skipQuiz ? "bg-white text-black border-white" : "bg-neutral-800 border-white/10 text-white/40"
                                                )}>
                                                    <div className="flex items-center justify-between mb-6">
                                                        <Zap className={cn("w-12 h-12", skipQuiz ? "text-yellow-400" : "text-neutral-700")} />
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={skipQuiz}
                                                                onChange={(e) => setSkipQuiz(e.target.checked)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-14 h-7 bg-neutral-900 rounded-full peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                                                        </label>
                                                    </div>
                                                    <h3 className="font-mono font-black text-2xl uppercase tracking-tighter">Pular Quiz (Só Admin)</h3>
                                                    <p className="text-xs font-mono mt-4 uppercase tracking-widest leading-relaxed opacity-70">
                                                        Ative para acessar os grupos diretamente sem responder ao quiz de entrada. Útil para testes rápidos do sistema.
                                                    </p>
                                                </div>

                                                <div className={cn(
                                                    "p-8 border-4 transition-all shadow-[8px_8px_0_rgba(0,0,0,0.2)]",
                                                    isQuestionsDisabled ? "bg-red-600 text-white border-red-600" : "bg-neutral-800 border-white/10 text-white/40"
                                                )}>
                                                    <div className="flex items-center justify-between mb-6">
                                                        <ShieldAlert className={cn("w-12 h-12", isQuestionsDisabled ? "text-white" : "text-neutral-700")} />
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isQuestionsDisabled}
                                                                onChange={toggleQuestions}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-14 h-7 bg-neutral-900 rounded-full peer-checked:bg-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white peer-checked:after:bg-black after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                                                        </label>
                                                    </div>
                                                    <h3 className="font-mono font-black text-2xl uppercase tracking-tighter">Desativar Quiz (Geral)</h3>
                                                    <p className="text-xs font-mono mt-4 uppercase tracking-widest leading-relaxed opacity-80">
                                                        BLOQUEIO GLOBAL: Todos os usuários terão acesso direto liberado para todos os grupos. Cuidado: Isso afeta todos os usuários simultaneamente.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {adminTab === 'matérias' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-white font-mono font-black text-sm uppercase tracking-widest flex items-center gap-3">
                                                    <Layout className="w-4 h-4 text-fake-red" />
                                                    Matérias de Investigação ({groups.length})
                                                </h3>
                                                <button 
                                                    onClick={addGroup}
                                                    className="bg-green-600 text-white px-8 py-3 font-mono font-black text-xs uppercase hover:bg-green-500 shadow-[4px_4px_0px_white] active:shadow-none translate-y-[-2px] active:translate-y-0 transition-all"
                                                >
                                                    + Nova Matéria
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {groups.map(group => (
                                                    <div key={group.id} className="border-2 border-white/10 p-6 bg-black/40 hover:border-white/30 transition-all group/card">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex-1">
                                                                <p className="text-[8px] font-mono text-neutral-500 mb-1 tracking-widest uppercase">ID: {group.id}</p>
                                                                <h4 className="text-white font-serif font-black text-lg italic leading-tight line-clamp-1">{group.title}</h4>
                                                                <p className="text-[10px] font-mono text-fake-red font-bold mt-1 uppercase">{group.category}</p>
                                                            </div>
                                                            <div className="flex flex-col gap-2 opacity-40 group-hover/card:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => setEditingGroupId(group.id)}
                                                                    className="bg-white text-black p-2 hover:bg-fake-red hover:text-white transition-all shadow-[2px_2px_0px_white] hover:shadow-none"
                                                                >
                                                                    <Edit3 className="w-3 h-3" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => removeGroup(group.id)}
                                                                    className="bg-red-900/50 text-white p-2 hover:bg-red-600 transition-all border border-red-500/30"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-[9px] font-mono text-neutral-400 uppercase pt-4 border-t border-white/5">
                                                            <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {group.members.length} membros</span>
                                                            <span className="flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> {group.slides.length} slides</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {adminTab === 'comentários' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center gap-4 text-white">
                                                <MessageSquare className="w-5 h-5 text-fake-red" />
                                                <h3 className="font-mono font-black text-sm uppercase tracking-widest">Controle de Comentários</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {groups.map(group => (
                                                    <div key={group.id} className="bg-black/40 border border-white/10 overflow-hidden flex flex-col">
                                                        <div className="bg-neutral-800 p-4 border-b border-white/10 flex justify-between items-center">
                                                            <h4 className="text-white font-serif font-black text-xs uppercase italic tracking-tighter truncate max-w-[200px]">{group.title}</h4>
                                                            <span className="bg-fake-red text-white text-[8px] font-mono font-black px-2 py-0.5">{(comments[group.id] || []).length}</span>
                                                        </div>
                                                        <div className="p-4 max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar">
                                                            {(!comments[group.id] || comments[group.id].length === 0) ? (
                                                                <p className="text-center py-6 text-[10px] font-mono text-neutral-600 uppercase italic">Silêncio absoluto...</p>
                                                            ) : (
                                                                [...comments[group.id]].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(comment => (
                                                                    <div key={comment.id} className="bg-neutral-900 border border-white/5 p-3 flex justify-between items-start gap-4 hover:border-white/20 transition-all">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-[10px] font-serif font-black text-white italic">{comment.userName}</span>
                                                                                <span className="text-[8px] font-mono text-neutral-500">{comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recent'}</span>
                                                                            </div>
                                                                            <p className="text-[11px] text-neutral-400 line-clamp-2 leading-tight">{comment.content}</p>
                                                                        </div>
                                                                        <button 
                                                                            onClick={() => deleteComment(group.id, comment.id)}
                                                                            className="text-red-500 hover:text-white p-2 hover:bg-red-600 transition-all border border-red-500/30"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {adminTab === 'teorias' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center gap-4 text-white">
                                                <AlertTriangle className="w-5 h-5 text-fake-red" />
                                                <h3 className="font-mono font-black text-sm uppercase tracking-widest">Painel de Teorias ({theories.length})</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {theories.map(theory => (
                                                    <div key={theory.id} className="bg-black/40 border border-white/10 p-4 space-y-4 flex flex-col hover:border-white/30 transition-all group/theory-card">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full overflow-hidden border border-fake-red bg-neutral-800">
                                                                    {theory.userPhoto ? <img src={theory.userPhoto} className="w-full h-full object-cover" /> : <User className="w-full h-full p-1 opacity-20" />}
                                                                </div>
                                                                <span className="text-[9px] font-serif font-black text-white uppercase italic">{theory.userName}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => deleteTheory(theory.id)}
                                                                className="text-red-500 transition-opacity p-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <p className="text-[11px] text-neutral-300 italic font-serif leading-tight">“{theory.content}”</p>
                                                        {theory.gifUrl && (
                                                            <div className="aspect-video border border-white/10 overflow-hidden mt-auto">
                                                                <img src={theory.gifUrl} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {theories.length === 0 && (
                                                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10">
                                                        <Ghost className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                                        <p className="font-mono text-[10px] text-white/20 uppercase">Nenhuma teoria detectada</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Edit Group Modal */}
                        {editingGroupId && (
                            <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                                <div className="w-full max-w-4xl bg-white border-8 border-black p-10 max-h-[90vh] overflow-y-auto shadow-[30px_30px_0px_rgba(220,38,38,1)]">
                                    <div className="flex justify-between items-center mb-10 border-b-8 border-black pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-black text-white p-2 font-mono font-black text-[10px]">CONFIG</div>
                                            <h3 className="text-4xl font-serif font-black italic uppercase tracking-tighter">Matéria de Investigação</h3>
                                        </div>
                                        <button onClick={() => setEditingGroupId(null)} className="hover:scale-125 transition-transform">
                                            <X className="w-10 h-10" />
                                        </button>
                                    </div>

                                    {(() => {
                                        const group = groups.find(g => g.id === editingGroupId);
                                        if (!group) return null;
                                        return (
                                            <div className="space-y-12">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-mono font-black mb-1 uppercase tracking-[0.2em] text-neutral-400">Título Principal</label>
                                                        <input 
                                                            className="w-full border-4 border-black p-4 font-serif font-black text-xl italic bg-neutral-50 focus:bg-white outline-none"
                                                            value={group.title} 
                                                            onChange={(e) => updateGroup(group.id, { ...group, title: e.target.value })} 
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-mono font-black mb-1 uppercase tracking-[0.2em] text-neutral-400">Nome da Equipe</label>
                                                        <input 
                                                            className="w-full border-4 border-black p-4 font-mono font-bold text-sm bg-neutral-50 focus:bg-white outline-none"
                                                            value={group.name} 
                                                            onChange={(e) => updateGroup(group.id, { ...group, name: e.target.value })} 
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-mono font-black mb-1 uppercase tracking-[0.2em] text-neutral-400">Descrição Curta (Lead)</label>
                                                    <textarea 
                                                        className="w-full border-4 border-black p-4 font-serif italic text-lg leading-relaxed h-32 bg-neutral-50 focus:bg-white outline-none"
                                                        value={group.description} 
                                                        onChange={(e) => updateGroup(group.id, { ...group, description: e.target.value })} 
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-mono font-black mb-1 uppercase tracking-[0.2em] text-neutral-400">Thumbnail URL</label>
                                                        <input 
                                                            className="w-full border-2 border-black p-3 font-mono text-[10px]"
                                                            value={group.thumbnail} 
                                                            onChange={(e) => updateGroup(group.id, { ...group, thumbnail: e.target.value })} 
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-mono font-black mb-1 uppercase tracking-[0.2em] text-neutral-400">Cat./Source</label>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                className="flex-1 border-2 border-black p-3 font-mono text-[10px]"
                                                                value={group.category} 
                                                                onChange={(e) => updateGroup(group.id, { ...group, category: e.target.value as any })} 
                                                            />
                                                            <input 
                                                                className="flex-1 border-2 border-black p-3 font-mono text-[10px]"
                                                                value={group.source} 
                                                                onChange={(e) => updateGroup(group.id, { ...group, source: e.target.value })} 
                                                                placeholder="Fonte"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-mono font-black mb-1 uppercase tracking-[0.2em] text-neutral-400">YouTube Embed</label>
                                                        <input 
                                                            className="w-full border-2 border-black p-3 font-mono text-[10px]"
                                                            value={group.videoUrl} 
                                                            onChange={(e) => updateGroup(group.id, { ...group, videoUrl: e.target.value })} 
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t-4 border-black">
                                                    <div className="space-y-6">
                                                        <label className="block text-[12px] font-serif font-black italic uppercase tracking-widest text-fake-red">Slides da Matéria</label>
                                                        <div className="space-y-3">
                                                            {group.slides.map((s, i) => (
                                                                <div key={i} className="flex gap-2 group/slide">
                                                                    <div className="w-12 h-12 bg-neutral-100 border-2 border-black overflow-hidden shrink-0">
                                                                        <img src={s} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <input 
                                                                        className="flex-1 border-2 border-black p-2 font-mono text-[9px] focus:bg-neutral-50"
                                                                        value={s} 
                                                                        onChange={(e) => {
                                                                            const newS = [...group.slides];
                                                                            newS[i] = e.target.value;
                                                                            updateGroup(group.id, { ...group, slides: newS });
                                                                        }} 
                                                                    />
                                                                    <button onClick={() => {
                                                                        const newS = group.slides.filter((_, idx) => idx !== i);
                                                                        updateGroup(group.id, { ...group, slides: newS });
                                                                    }} className="bg-red-50 text-red-500 p-2 hover:bg-black hover:text-white transition-colors border-2 border-black"><X className="w-4 h-4" /></button>
                                                                </div>
                                                            ))}
                                                            <button 
                                                                onClick={() => updateGroup(group.id, { ...group, slides: [...group.slides, ""] })}
                                                                className="w-full border-2 border-dashed border-black p-3 font-mono font-black text-[10px] uppercase hover:bg-neutral-50 transition-all"
                                                            >
                                                                + Novo Slide
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <label className="block text-[12px] font-serif font-black italic uppercase tracking-widest text-fake-red">Equipe de Investigação</label>
                                                        <div className="space-y-4">
                                                            {group.members.map((m, i) => (
                                                                <div key={i} className="flex gap-4 items-end bg-neutral-50 p-4 border-2 border-black group/member">
                                                                    <div className="flex-1 space-y-2">
                                                                        <input 
                                                                            placeholder="Nome do Investigador"
                                                                            className="w-full border-b border-black bg-transparent p-1 font-serif font-black italic text-sm outline-none"
                                                                            value={m.name} 
                                                                            onChange={(e) => {
                                                                                const newM = [...group.members];
                                                                                newM[i].name = e.target.value;
                                                                                updateGroup(group.id, { ...group, members: newM });
                                                                            }} 
                                                                        />
                                                                        <input 
                                                                            placeholder="Responsabilidade"
                                                                            className="w-full border-b border-black bg-transparent p-1 font-mono text-[9px] uppercase tracking-widest outline-none opacity-60"
                                                                            value={m.role} 
                                                                            onChange={(e) => {
                                                                                const newM = [...group.members];
                                                                                newM[i].role = e.target.value;
                                                                                updateGroup(group.id, { ...group, members: newM });
                                                                            }} 
                                                                        />
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const newM = group.members.filter((_, idx) => idx !== i);
                                                                            updateGroup(group.id, { ...group, members: newM });
                                                                        }}
                                                                        className="bg-black text-white p-2 hover:bg-red-600 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button 
                                                                onClick={() => {
                                                                    updateGroup(group.id, { ...group, members: [...group.members, { name: "", role: "" }] });
                                                                }}
                                                                className="w-full border-2 border-dashed border-black p-3 font-mono font-black text-[10px] uppercase hover:bg-neutral-50 transition-all"
                                                            >
                                                                + Adicionar Investigador
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-12 border-t-8 border-black">
                                                    <button 
                                                        onClick={() => setEditingGroupId(null)}
                                                        className="flex-1 bg-black text-white py-8 font-serif font-black italic uppercase text-3xl tracking-tighter hover:bg-neutral-900 transition-all shadow-[10px_10px_0px_rgba(34,197,94,1)]"
                                                    >
                                                        FINALIZAR E SALVAR
                                                    </button>
                                                    <button 
                                                        onClick={() => removeGroup(group.id)}
                                                        className="px-10 bg-red-600 text-white font-mono font-black uppercase text-xs tracking-widest border-4 border-black hover:bg-black transition-all"
                                                    >
                                                        EXCLUIR TUDO
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                  </motion.div>
              )}
          </AnimatePresence>

          {/* Pop-ups de Notícias Falsas */}
          <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center p-4">
            <AnimatePresence>
              {!hideAds && popups.map((news, index) => {
                const isUrgent = news.intensity === 'urgent';
                
                return (
                  <motion.div
                    key={news.id}
                    initial={{ scale: 0.8, opacity: 0, x: (Math.random() * 200 - 100), y: (Math.random() * 200 - 100) }}
                    animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                    exit={{ scale: 0.2, opacity: 0 }}
                    className={cn(
                      "pointer-events-auto w-[250px] md:w-[350px] bg-white shadow-[10px_10px_0px_rgba(0,0,0,0.15)] md:shadow-[20px_20px_0px_rgba(0,0,0,0.15)] border-2 border-black relative overflow-hidden",
                      news.id % 3 === 0 && "bg-neutral-50 shadow-none border-[3px] border-black"
                    )}
                    style={{ 
                      zIndex: 200 + index,
                      position: 'absolute',
                      top: `${10 + (Math.random() * 60)}%`,
                      left: `${10 + (Math.random() * 60)}%`,
                      rotate: (index % 2 === 0 ? Math.random() * 5 : -Math.random() * 5) + 'deg'
                    }}
                  >
                    <div className={cn(
                      "bg-black text-white px-4 py-1.5 flex justify-between items-center",
                      isUrgent && "bg-fake-red"
                    )}>
                      <span className="text-[9px] font-mono font-black tracking-[0.3em] uppercase">
                        {isUrgent ? 'URGENTE / BREAKING' : 'ALERTA / ALERT'}
                      </span>
                      <button 
                        onClick={() => removePopup(news.id)}
                        className="hover:scale-125 p-1 transition-transform cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="aspect-video w-full bg-neutral-100 mb-4 border border-black overflow-hidden relative">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 right-2 bg-fake-red text-white text-[8px] font-black px-1 uppercase tracking-tighter">
                            LIVE NEWS
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-black text-fake-red uppercase border-b border-fake-red pb-0.5">
                          {news.category}
                        </span>
                        <h4 className="font-serif font-black text-xl leading-tight mt-3 tracking-tight">
                          {news.title}
                        </h4>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => removePopup(news.id)}
                          className="flex-[2] bg-fake-red text-white py-2 font-mono font-black text-[9px] uppercase tracking-widest hover:bg-neutral-800 transition-all cursor-pointer"
                        >
                          LER MATÉRIA COMPLETA
                        </button>
                      </div>
                    </div>
                    <motion.div 
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 8, ease: "linear" }}
                      onAnimationComplete={() => removePopup(news.id)}
                      className="h-1 bg-fake-red absolute bottom-0 left-0 opacity-40"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pop-up de Patrocinado fixo */}
          {!hideAds && (
            <div className="fixed top-24 left-10 w-[200px] bg-fake-yellow border-2 border-amber-600 p-4 z-10 opacity-60 hover:opacity-100 transition-opacity hidden md:block select-none pointer-events-none rounded-xl">
                <p className="text-[8px] font-mono font-black uppercase text-amber-800 mb-1">PATROCINADO</p>
                <p className="text-[10px] font-bold italic underline leading-tight">Sua internet será cobrada por cada palavra digitada a partir de 2025.</p>
            </div>
          )}
        </>
      ) : (
        /* TRUTH GALLERY (TRANSCENDED STATE) */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="min-h-screen pt-12 pb-32"
        >
          <div className="max-w-6xl mx-auto px-6">
                <header className="mb-20">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                    <div className="flex-1">
                        <motion.div 
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            className="inline-block px-4 py-1 bg-black text-white text-[10px] font-mono font-black uppercase tracking-widest mb-6"
                        >
                            {APP_NAME} — {APP_SLOGAN} — 3º ANO A
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-6">
                            JORNAL <span className="text-fake-red italic">TRUE NEWS</span>
                        </h1>
                        <div className="h-1 w-32 bg-fake-red mb-8"></div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => {
                                playSound('glitch');
                                setIsDarkNet(!isDarkNet);
                            }}
                            className={cn(
                                "px-6 py-3 border-4 font-mono text-xs font-black uppercase tracking-widest transition-all",
                                isDarkNet 
                                    ? "bg-[#00ff41] text-black border-[#00ff41] shadow-[5px_5px_0px_#00ff41]" 
                                    : "bg-black text-white border-black shadow-[5px_5px_0px_#dc2626]"
                            )}
                        >
                            {isDarkNet ? "OFFLINE DARK NET" : "ENTRAR DARK NET"}
                        </button>
                        
                        {userProfile ? (
                            <button 
                                onClick={() => setProfileModalOpen(true)}
                                className="flex items-center gap-3 p-2 pr-4 border-4 border-black bg-white hover:bg-neutral-50 transition-all shadow-[5px_5px_0px_black]"
                            >
                                <div className="w-10 h-10 border-2 border-black overflow-hidden bg-neutral-200">
                                    {userProfile.photoURL ? (
                                        <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-[8px] font-mono font-black uppercase text-fake-red">Perfil</p>
                                    <p className="text-[10px] font-black uppercase truncate max-w-[100px]">{userProfile.name}</p>
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={() => setRegModalOpen(true)}
                                className="p-4 border-4 border-black hover:bg-neutral-surface transition-all shadow-[5px_5px_0px_black]"
                            >
                                <User className="w-5 h-5" />
                            </button>
                        )}
                        
                        <button 
                            onClick={() => handleShare()}
                            className="p-4 border-4 border-black hover:bg-neutral-surface transition-all shadow-[5px_5px_0px_black]"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                  <h2 className="text-2xl font-serif italic border-2 border-border-main p-4 inline-block bg-neutral-surface px-12 uppercase tracking-tighter">
                    {selectedCategory ? `Vez de: ${selectedCategory}` : "Matérias de Investigação"}
                  </h2>
                  {selectedCategory && (
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className="ml-4 font-mono text-[10px] font-black text-fake-red border-2 border-fake-red px-3 py-2 uppercase hover:bg-fake-red hover:text-white transition-all shadow-[4px_4px_0px_black] active:shadow-none translate-y-[-2px] active:translate-y-0"
                      >
                          Limpar Filtro [X]
                      </button>
                  )}
                </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {sortedGroups.map((group) => (
                    <motion.div 
                      key={group.id}
                      whileHover={{ y: -10, rotate: 1 }}
                      onClick={() => {
                        playSound('click');
                        setSelectedGroup(group);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer bg-neutral-surface border-2 border-border-main shadow-[10px_10px_0px_var(--color-border-main)] hover:shadow-[15px_15px_0px_var(--color-border-main)] transition-all flex flex-col"
                    >
                      <div className="aspect-square relative overflow-hidden bg-neutral-background border-b-2 border-border-main">
                        <img 
                          src={group.thumbnail} 
                          alt={group.name} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Popularity Badge */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <div className="bg-white border-2 border-black px-2 py-1 flex items-center gap-1.5 shadow-[4px_4px_0px_black] z-10 transition-transform group-hover:scale-110">
                                <Heart className={cn("w-3 h-3 text-fake-red", userLikes[group.id] && "fill-current")} />
                                <span className="font-mono text-[10px] font-black">{likes[group.id] || 0}</span>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(group);
                                }}
                                className="bg-white border-2 border-black p-2 flex items-center justify-center shadow-[4px_4px_0px_black] z-10 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                            >
                                <Share2 className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-neutral-surface text-text-main px-6 py-2 font-black text-xs uppercase tracking-widest border-2 border-border-main">Ver Matéria</span>
                        </div>
                      </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <p className="text-[10px] font-mono font-black text-fake-red uppercase mb-2">{group.name}</p>
                                <h3 className="text-2xl font-serif font-black leading-tight mb-4 flex-1">{group.title}</h3>
                                <p className="text-sm text-text-muted font-serif leading-relaxed line-clamp-2 italic mb-6">{group.description}</p>
                                <div className="mt-auto pt-4 border-t border-black/10 flex justify-between items-center">
                                    <span className="text-[8px] font-mono font-black bg-neutral-100 px-2 py-1 uppercase">
                                        {group.source || "Fonte: um cara falou"}
                                    </span>
                                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <Eye className="w-3 h-3" />
                                        <span className="text-[10px] font-mono font-bold">Ler</span>
                                    </div>
                                </div>
                            </div>
                    </motion.div>
                  ))}
                </div>

            <footer className="mt-32 pt-12 border-t-2 border-neutral-100 text-center">
              <button 
                onClick={() => {
                   setIsTranscended(false);
                   setSelectedGroup(null);
                }}
                className="text-neutral-300 hover:text-black font-mono font-black text-[10px] uppercase tracking-[0.4em] transition-all cursor-pointer"
              >
                Resetar Simulação de Caos
              </button>
            </footer>
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
      
      {/* Registration Modal */}
      <AnimatePresence>
        {regModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            >
                <div className="w-full max-w-sm bg-white border-8 border-black p-8 shadow-[15px_15px_0px_#dc2626]">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-serif font-black italic tracking-tighter uppercase leading-none">Login</h2>
                            <p className="text-[10px] font-mono font-bold text-fake-red mt-2 uppercase tracking-widest">Acesse para interagir</p>
                        </div>
                        <button onClick={() => setRegModalOpen(false)}>
                            <X className="w-6 h-6 hover:text-fake-red" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                            className="w-full flex items-center justify-center gap-4 bg-white border-4 border-black py-4 font-mono font-black uppercase text-xs tracking-widest hover:bg-neutral-50 transition-all disabled:opacity-50 shadow-[5px_5px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        >
                            <Globe className="w-5 h-5 text-fake-red" />
                            {isLoggingIn ? "CONECTANDO..." : "ENTRAR COM GOOGLE"}
                        </button>
                        <p className="text-[9px] font-mono text-center text-neutral-400 uppercase leading-relaxed">
                            Ao entrar, você poderá deixar comentários e dar likes nas equipes.
                        </p>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
      {/* Activity Feed */}
      <div className="fixed top-24 right-6 z-[600] pointer-events-none flex flex-col gap-3 max-w-[320px]">
          <AnimatePresence mode="popLayout">
              {activities.map((act) => (
                  <motion.div
                    key={act.id}
                    initial={{ x: 100, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 100, opacity: 0, scale: 0.5 }}
                    layout
                    className="bg-black text-white p-4 border-2 border-fake-red shadow-[8px_8px_0px_black] pointer-events-auto relative group"
                  >
                      <button 
                        onClick={() => removeActivity(act.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex items-start gap-4">
                          <div className={cn(
                              "mt-1 w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]",
                              act.type === 'like' ? 'text-fake-red bg-fake-red' : act.type === 'share' ? 'text-green-500 bg-green-500' : 'text-blue-500 bg-blue-500'
                          )} />
                          <div>
                            <p className="text-[9px] font-mono font-black text-neutral-500 uppercase tracking-widest mb-1 italic">Notificação Real-time</p>
                            <p className="text-[11px] font-serif font-black italic leading-tight uppercase tracking-tighter">{act.text}</p>
                          </div>
                      </div>
                  </motion.div>
              ))}
          </AnimatePresence>
      </div>
    </div>
  );
}
