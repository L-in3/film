/* =========================================================
 * FILM GAZETTE · 刊物信息与默认种子数据
 * - DEFAULT_MOVIES 仅在首次打开（或数据损坏兜底）时写入 localStorage
 * - 每部电影使用唯一 id，不依赖数组下标
 * =======================================================*/

function img(prompt, size) {
  return "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt="
    + encodeURIComponent(prompt) + "&image_size=" + size;
}

const GAZETTE = {
  volume: "VOL. 01",
  issue: "NO. 12",
  established: "2024"
};

/* ---------- 本期主打（编辑精选内容，静态展示，不参与增删改） ---------- */
const FEATURED = {
  kicker: "EDITOR'S PICK · 本期主打",
  titleCN: "花样年华",
  titleEN: "In the Mood for Love",
  year: 2000,
  director: "王家卫",
  rating: 9.6,
  status: "已看 · 三刷",
  image: img(
    "cinematic film still, 1960s Hong Kong narrow alley at night, elegant woman in floral cheongsam and man in suit passing a noodle stall, warm tungsten lamp light, deep shadows, rain-wet stone wall, 35mm film grain, moody vintage movie photography",
    "landscape_16_9"
  ),
  caption: "图 · 一九六二年的香港，一条只能侧身而过的窄巷。",
  review: "这是一部关于「没说出口」的电影。梁朝伟与张曼玉在狭窄的楼道里一次次擦肩而过，旗袍的花色换了一茬又一茬，话却始终停在嘴边。王家卫把遗憾拍成了一种体温——你几乎能感觉到那碗云吞面升腾的热气，和墙上斑驳的油漆一起慢慢冷却。",
  reviewExtra: "第三次重看，注意力从故事移到了声音：拖鞋声、雨声、留声机里的周璇。原来最好的对白，是他们从没说过的那些。",
  cta: "查看手记 →"
};

/* ---------- 默认电影数据 ----------
 * status: "想看" | "已看"
 * score : 0–10 个人评分（可空）
 * favorite: true 时进入「我的精选」栏
 * quote 非空时进入「观影手记」栏（手记与电影一一关联）
 */
const DEFAULT_MOVIES = [
  {
    id: "m001",
    titleCN: "完美的日子", titleEN: "Perfect Days",
    year: 2023, director: "维姆·文德斯",
    status: "已看", score: 8.9, watchDate: "2026-10-19", favorite: false,
    image: img("cinematic film still, middle-aged Japanese man cleaning a Tokyo public toilet in soft morning light, dappled tree shadows, quiet blue-grey tones, contemplative mood, 35mm film photography", "portrait_4_3"),
    note: "役所广司每天在同一时间醒来，叠被、浇花、买罐装咖啡，把东京的公厕擦得一尘不染。文德斯几乎没给他安排什么「剧情」，可当他抬头看树影漏下的光，我跟着一起屏住了呼吸。所谓修行，大概就是把同一件事做上一万遍，还能在第一万遍里看见新的东西。",
    quote: "下次是下次，现在是现在。",
    quoteFrom: "—— 平山，在河边骑车时",
    createdAt: "2026-10-19T20:00:00"
  },
  {
    id: "m002",
    titleCN: "燃烧", titleEN: "Burning",
    year: 2018, director: "李沧东",
    status: "已看", score: 8.4, watchDate: "2026-10-11", favorite: false,
    image: img("cinematic film still, young Korean man standing alone in a field at dusk watching distant smoke, orange twilight sky, mysterious quiet tension, 35mm film grain", "portrait_4_3"),
    note: "李沧东把村上春树的短篇抻成了一根越拉越紧的弦。塑料大棚到底烧没烧？海美到底存不存在？电影拒绝回答，只留下惠美在夕阳里脱掉上衣跳舞的长镜头——美得心碎，又莫名让人恐惧。散场后那种不安感持续了一整个晚上。",
    quote: "世界上有两种饥饿：小饿，和大饿。",
    quoteFrom: "—— 改编自片中关于 Little Hunger 与 Great Hunger 的对话",
    createdAt: "2026-10-11T21:00:00"
  },
  {
    id: "m003",
    titleCN: "一一", titleEN: "Yi Yi",
    year: 2000, director: "杨德昌",
    status: "已看", score: 9.5, watchDate: "2026-09-28", favorite: false,
    image: img("cinematic film still, Taiwanese family wedding banquet seen through glass window reflections, warm red interior light, quiet urban night outside, 35mm film photography", "portrait_4_3"),
    note: "从一场婚礼开始，到一场葬礼结束。杨德昌用三个小时讲完了一个人从童年到老年的全部困惑，却平静得像邻居家真实发生的事。洋洋举着相机拍别人的后脑勺，因为「你自己看不到，所以我拍给你看」——这大概就是电影存在的理由。",
    quote: "电影发明以后，人类的生命比以前延长了三倍。",
    quoteFrom: "—— 大田，与 NJ 在东京的小酒馆",
    createdAt: "2026-09-28T20:00:00"
  },
  {
    id: "m004",
    titleCN: "2001 太空漫游", titleEN: "2001: A Space Odyssey",
    year: 1968, director: "库布里克",
    status: "想看", score: "", watchDate: "", favorite: false,
    image: img("cinematic film still, astronaut in white space helmet against a black void, red warning light reflections on visor, 1960s science fiction, 35mm film grain", "square"),
    note: "留一个失眠的深夜给它。",
    quote: "", quoteFrom: "",
    createdAt: "2026-10-01T10:00:00"
  },
  {
    id: "m005",
    titleCN: "八部半", titleEN: "8½",
    year: 1963, director: "费里尼",
    status: "想看", score: "", watchDate: "", favorite: false,
    image: img("black and white cinematic film still, Italian film director in sunglasses on a chaotic movie set with giant scaffolding, dreamlike 1960s cinema, high contrast", "square"),
    note: "据说每个创作者都该看一遍。",
    quote: "", quoteFrom: "",
    createdAt: "2026-10-01T10:01:00"
  },
  {
    id: "m006",
    titleCN: "假面", titleEN: "Persona",
    year: 1966, director: "伯格曼",
    status: "想看", score: "", watchDate: "", favorite: false,
    image: img("black and white cinematic film still, close-up of two women's faces merging in profile, stark high contrast lighting, 1960s Swedish cinema", "square"),
    note: "为冬天的伯格曼专题做准备。",
    quote: "", quoteFrom: "",
    createdAt: "2026-10-01T10:02:00"
  },
  {
    id: "m007",
    titleCN: "春光乍泄", titleEN: "Happy Together",
    year: 1997, director: "王家卫",
    status: "想看", score: "", watchDate: "", favorite: false,
    image: img("cinematic film still, two men dancing in a cramped Buenos Aires apartment kitchen, green and amber tungsten light, moody 1990s atmosphere, 35mm film grain", "square"),
    note: "补完王家卫片单的最后一格。",
    quote: "", quoteFrom: "",
    createdAt: "2026-10-01T10:03:00"
  },
  {
    id: "m008",
    titleCN: "天堂电影院", titleEN: "Cinema Paradiso",
    year: 1988, director: "托纳多雷",
    status: "已看", score: 9.8, watchDate: "2026-06-21", favorite: true,
    image: img("cinematic film still, old Sicilian movie projection booth with a beam of light cutting through darkness, small boy silhouette, warm amber glow and dust particles, nostalgic 35mm film", "portrait_4_3"),
    note: "结尾的吻戏混剪，看一次哭一次。",
    quote: "", quoteFrom: "",
    createdAt: "2026-06-21T20:00:00"
  },
  {
    id: "m009",
    titleCN: "布达佩斯大饭店", titleEN: "The Grand Budapest Hotel",
    year: 2014, director: "韦斯·安德森",
    status: "已看", score: 9.2, watchDate: "2026-05-10", favorite: true,
    image: img("cinematic film still, pink pastel grand hotel facade in snowy alpine mountains, perfectly symmetrical composition, vintage 1930s European resort, whimsical, 35mm film grain", "portrait_4_3"),
    note: "糖霜外壳下，是一整个逝去的欧洲。",
    quote: "", quoteFrom: "",
    createdAt: "2026-05-10T20:00:00"
  },
  {
    id: "m010",
    titleCN: "重庆森林", titleEN: "Chungking Express",
    year: 1994, director: "王家卫",
    status: "已看", score: 9.0, watchDate: "2026-04-05", favorite: true,
    image: img("cinematic film still, 1990s Hong Kong fast food stall at night, young woman with short blonde wig and sunglasses, neon signs and rain reflections, dreamy motion blur, 35mm film grain", "square"),
    note: "凤梨罐头会过期，加州梦不会。",
    quote: "", quoteFrom: "",
    createdAt: "2026-04-05T20:00:00"
  }
];
