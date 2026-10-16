import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 1. Расширенная база историй и протоколов наблюдения Рошана
const ROSHAN_DOSSIER = {
  // Сила (STR)
  Ursa: "Главная кошмарная мозоль моего существования. Заходит в яму на 8-й минуте с Владимиркой или Маской, закликивает меня лапами до полусмерти и нагло забирает Aegis.",
  Axe: "Прибегает со своим крутящимся топором и агрится прямо мне в лицо. Думает, что он здесь главный танк. Сыр он, правда, чаще всего оставляет саппортам.",
  Pudge: "Пытается хукнуть меня прямо из-за стены. Серьёзно? Я вешу три тонны! Когда понимает, что я не лечу, просто начинает вонять во всей яме своим Rot.",
  Sven: "Включает God's Strength, краснеет как вареный рак и начинает с размаху махать мечом. От его рассекающих ударов у меня потом три дня голова гудит.",
  Wraith_King: "Этот парень искренне верит, что реинкарнация — его личная фишка. Ха! Попробовал бы он воскрешаться каждые пару минут после того, как его забивают впятером.",
  Huskar: "Прыгает с лоу-HP прямо с обрыва и закидывает меня горящими копьями. Полный псих, но Aegis забирает за считанные секунды.",
  Bristleback: "Встает ко мне спиной и ждет, пока я буду его бить. Какая глупая тактика... хотя колючки отлетают больно.",
  Tiny: "Кидает в меня моих же крипов или своих саппортов. Настоящий варвар из каменной породы.",

  // Ловкость (AGI)
  Anti_Mage: "Фармит 30 минут по лесам, а потом блинкуется ко мне, тыкает выжиганием маны, забирает Aegis и тут же испаряется. Никакого уважения к хозяину ямы!",
  "Shadow Fiend": "Приходит с шестью койлами и ультимейтом прямо мне под ноги. Забирает сыр и крутится, демонстрируя свои арканы.",
  "Phantom Assassin": "Каждый ее удар — как рулетка. То ковыряет по чуть-чуть, то выдает крит на 2000 и оставляет меня без сознания. Опасная дама.",
  Juggernaut: "Врубает свою крутилку и прыгает в Omnislash. Пока он кружится, я даже попасть по нему не могу!",
  Meepo: "Приходят толпой в четыре лопаты и забивают ногами. Никакого честного боя один на один!",
  Slark: "Постоянно прыгает на поводке, крадет мои характеристики своей пассивкой и уходит в тень, как только я пытаюсь его замахнуть.",
  Sniper: "Стоит на хайграунде возле реки и расстреливает меня издалека. Даже в яму спуститься боится, трусливый гном!",
  Drom_Ranger: "Замораживающие стрелы с безопасного расстояния... Мои ноги буквально леденеют, пока я пытаюсь до нее доползти.",

  // Интеллект (INT)
  Invoker: "Заходит и начинает кастовать 10 заклинаний подряд: метеоры, санстрики, ледяные стены... Весь в эффектах, шума много, а толку без команды мало.",
  Enigma: "Когда кастует Black Hole прямо внутри моей ямы, у меня выпадает сыр из рук и засасывает всю мебель.",
  Tinker: "Закидывает ракетами и лазерами прямо из кустов, а потом прожимает Travel'ы и улетает на базу. Ужасно назойливый тип.",
  Storm_Spirit: "Влетает на молнии через всю карту, ворует Aegis прямо перед носом у врагов и улетает дальше. Нахальный шарик.",
  Zeus: "Постоянно бьет молниями с небес. Даже когда я просто сплю в яме, его ультимейт все равно меня задевает!",
  Dazzle: "Кидает Shallow Grave на своего керри, когда у того остаётся 1 HP, и не дает мне честно оформить фраг.",

  // Универсальные / Другие
  Techies: "Раньше этот заминированный десант превращал вход в мою яму в минное поле. До сих пор перед входом тщательно прощупываю землю ногами.",
  Monkey_King: "Прыгает по деревьям вокруг ямы, поставит арену и крутится на своей палке. Мои слуги от него в ужасе."
};

// 2. Генератор историй для всех остальных героев
function getRoshanStory(hero) {
  const cleanName = hero.name.replace("npc_dota_hero_", "");
  
  if (ROSHAN_DOSSIER[hero.localized_name]) return ROSHAN_DOSSIER[hero.localized_name];
  if (ROSHAN_DOSSIER[cleanName]) return ROSHAN_DOSSIER[cleanName];

  const isMelee = hero.attack_type === "Melee";
  const attr = hero.primary_attr;

  if (attr === "str") {
    return isMelee
      ? `Этот силовик ближнего боя любит заходить в яму и проверять мою броню на прочность. Обычный крепкий парень, но без поддержки саппортов Aegis ему не видать.`
      : `Редкий тип силовика дальнего боя. Предпочитает закидывать меня снарядами с безопасной дистанции, пока его команда впитывает урон.`;
  }
  if (attr === "agi") {
    return isMelee
      ? `Ловкач ближнего боя. Наращивает бешеное преимущество по макро и заходит ко мне на второй фазе игры, чтобы забрать Эгиду и закончить матч.`
      : `Дальнобойный ловкач. Стоит на речке возле ямы, закликивает быстрыми выстрелами и надеется, что я не успею до него дойти.`;
  }
  if (attr === "int") {
    return `Маг с огромным арсеналом заклинаний. Прожимает все свои масс-скиллы прямо в узком пространстве ямы. В одиночку зайти ко мне опасается.`;
  }

  return `Универсальный герой с непредсказуемым сборником предметов. Может удивить как внезапным соло-заходом на 15-й минуте, так и воровством сыра под инвизом.`;
}

export default function Heroes() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHero, setSelectedHero] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedAttr, setSelectedAttr] = useState("all");

  useEffect(() => {
    async function fetchHeroes() {
      try {
        const res = await fetch("https://api.opendota.com/api/heroes");
        const data = await res.json();
        const formatted = data.map((hero) => {
          const cleanName = hero.name.replace("npc_dota_hero_", "");
          return {
            ...hero,
            cleanName,
            img: `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${cleanName}.png`,
          };
        });
        setHeroes(formatted);
        if (formatted.length > 0) setSelectedHero(formatted[0]);
      } catch (e) {
        console.error("Ошибка загрузки API:", e);
      } finally {
        setLoading(false);
      }
    }

    const savedNotes = JSON.parse(localStorage.getItem("rn_notes") || "[]");
    setUserNotes(savedNotes);

    fetchHeroes();
  }, []);

  const filteredHeroes = heroes.filter((h) => {
    const matchSearch = h.localized_name.toLowerCase().includes(search.toLowerCase());
    const matchAttr = selectedAttr === "all" || h.primary_attr === selectedAttr;
    return matchSearch && matchAttr;
  });

  const currentHeroNotes = selectedHero
    ? userNotes.filter(
        (n) => n.hero === selectedHero.localized_name || n.heroId === selectedHero.id
      )
    : [];

  const attrLabels = { all: "Все", str: "Сила", agi: "Ловкость", int: "Интеллект" };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px", color: "#fff" }}>
      <h1 style={{ color: "#d4af37", fontFamily: "serif", margin: "0 0 8px 0" }}>
        👁️ Досье Свидетеля Рошана
      </h1>
      <p style={{ color: "#aaa", marginBottom: "20px" }}>
        Выберите героя, чтобы прочитать личные наблюдения Рошана и записать свои советы по игре.
      </p>

      {loading ? (
        <div style={{ color: "#888", padding: "40px 0" }}>Загрузка героев из ямы...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "25px" }}>
          
          {/* Левая панель: Поиск, Фильтры и Список */}
          <div style={{ background: "#18181c", border: "1px solid #282830", borderRadius: "8px", padding: "15px", height: "fit-content" }}>
            <input
              type="text"
              placeholder="Поиск по имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #3d3d4a",
                background: "#101014",
                color: "#fff",
                marginBottom: "12px",
                boxSizing: "border-box",
                outline: "none"
              }}
            />

            {/* Быстрые фильтры */}
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "15px" }}>
              {["all", "str", "agi", "int"].map((attr) => (
                <button
                  key={attr}
                  onClick={() => setSelectedAttr(attr)}
                  style={{
                    padding: "5px 10px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    background: selectedAttr === attr ? "#d4af37" : "#22222a",
                    color: selectedAttr === attr ? "#000" : "#aaa",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {attrLabels[attr]}
                </button>
              ))}
            </div>

            {/* Список героев */}
            <div style={{ maxHeight: "580px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {filteredHeroes.map((hero) => {
                const isSelected = selectedHero?.id === hero.id;
                return (
                  <div
                    key={hero.id}
                    onClick={() => setSelectedHero(hero)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      background: isSelected ? "#2a1e22" : "#202026",
                      border: isSelected ? "1px solid #d4af37" : "1px solid transparent",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <img src={hero.img} alt={hero.localized_name} style={{ width: "42px", height: "24px", borderRadius: "3px", objectFit: "cover" }} />
                    <span style={{ fontSize: "13.5px", fontWeight: isSelected ? "bold" : "normal", color: isSelected ? "#d4af37" : "#e1e1e6" }}>
                      {hero.localized_name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Правая панель: Рассказ Рошана + Заметки пользователя */}
          {selectedHero && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Карточка рассказа о герое */}
              <div style={{ background: "linear-gradient(135deg, #1f1a1d 0%, #121216 100%)", border: "1px solid #4a282e", borderRadius: "10px", padding: "25px", boxShadow: "0 8px 25px rgba(0,0,0,0.4)" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px" }}>
                  <img src={selectedHero.img} alt={selectedHero.localized_name} style={{ width: "130px", borderRadius: "8px", border: "2px solid #d4af37" }} />
                  <div>
                    <h2 style={{ color: "#d4af37", margin: "0 0 6px 0", fontSize: "30px", fontFamily: "serif" }}>{selectedHero.localized_name}</h2>
                    <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#888" }}>
                      <span>Атрибут: <b style={{ color: "#fff" }}>{selectedHero.primary_attr.toUpperCase()}</b></span>
                      <span>Атака: <b style={{ color: "#fff" }}>{selectedHero.attack_type === "Melee" ? "Ближний бой" : "Дальний бой"}</b></span>
                    </div>
                  </div>
                </div>

                {/* Блок цитаты Свидетеля Рошана */}
                <div style={{ background: "#141113", borderLeft: "4px solid #b82e2e", padding: "18px 20px", borderRadius: "0 8px 8px 0" }}>
                  <div style={{ color: "#ff5555", fontWeight: "bold", fontSize: "12px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    📜 Протокол наблюдения Рошана:
                  </div>
                  <p style={{ color: "#d1d1d6", fontStyle: "italic", margin: 0, lineHeight: "1.6", fontSize: "15px" }}>
                    "{getRoshanStory(selectedHero)}"
                  </p>
                </div>
              </div>

              {/* Секция личных заметок игрока */}
              <div style={{ background: "#18181c", border: "1px solid #282830", borderRadius: "10px", padding: "25px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ color: "#d4af37", margin: 0 }}>📝 Ваши заметки по герою</h3>
                  <Link
                    to="/dashboard/create"
                    style={{
                      background: "#b82e2e",
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "bold"
                    }}
                  >
                    + Новая заметка
                  </Link>
                </div>

                {currentHeroNotes.length === 0 ? (
                  <div style={{ color: "#777", fontSize: "14px", padding: "15px 0" }}>
                    У вас пока нет сохраненных заметок по герою <b>{selectedHero.localized_name}</b>. Нажмите кнопку выше, чтобы добавить сборку или советы по игре!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {currentHeroNotes.map((note) => (
                      <div key={note.id} style={{ background: "#202026", padding: "16px", borderRadius: "6px", border: "1px solid #333" }}>
                        <h4 style={{ color: "#fff", margin: "0 0 8px 0", fontSize: "16px" }}>{note.title}</h4>
                        {note.story && <p style={{ color: "#bbb", fontSize: "13.5px", margin: "0 0 6px 0" }}><b>О герое:</b> {note.story}</p>}
                        {note.tips && <p style={{ color: "#bbb", fontSize: "13.5px", margin: "0 0 6px 0" }}><b>Советы:</b> {note.tips}</p>}
                        {note.items && <p style={{ color: "#d4af37", fontSize: "12.5px", margin: 0 }}><b>Предметы:</b> {note.items}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}