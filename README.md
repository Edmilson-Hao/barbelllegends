# Barbell Legends: Iron Empire

**Idle RPG · Life Simulator · Powerlifting Career**

Jogo 100% vanilla (HTML5 + CSS3 + JavaScript puro). Sem frameworks, sem bibliotecas externas.

## Como executar

1. Extraia o ZIP.
2. Abra `index.html` em um navegador moderno (Chrome, Firefox, Edge, Safari).
3. Ou sirva com qualquer servidor estático:
   ```bash
   # Python
   python -m http.server 8080
   # Node
   npx serve .
   ```
4. Acesse `http://localhost:8080`.

**Importante:** Para IndexedDB e módulos ES funcionar corretamente, prefira um servidor local em vez de `file://`.

## Controles

- **Nova Carreira** — gera personagem procedural (pode rerolar).
- **Continuar** — carrega o save e processa progresso offline.
- **Agenda** — veja a rotina semanal e ajuste prioridades (Powerlifting, Carreira, etc.).
- **Treino** — escolha o programa (Linear, Full Body, Upper/Lower).
- **Carreira** — emprego, estudos e inscrição na competição local.
- **Finanças** — saldo, histórico de transações.
- **Diário** — linha do tempo da carreira.
- O tempo avança automaticamente. Pause com o botão ⏸.

## Sistemas implementados (MVP)

| Sistema | Status |
|---------|--------|
| Geração procedural de personagem | ✅ |
| Aparência pixel art procedural | ✅ |
| Cenários: Casa, Trabalho, Academia | ✅ |
| Animações básicas (idle, treino, sono, trabalho) | ✅ |
| Agenda semanal automática | ✅ |
| Rotina automática (trabalho, treino, sono, refeições) | ✅ |
| Simulação offline (até 24h reais) | ✅ |
| Sistema financeiro (salário, custos, histórico) | ✅ |
| Empregos com atributos distintos | ✅ |
| Sono, fadiga, energia, humor, nutrição | ✅ |
| Treinamento SBD + progressão com retornos decrescentes | ✅ |
| Programas de treino (Linear, Full Body, Upper/Lower) | ✅ |
| Competição local com tentativas e ranking | ✅ |
| Diário de carreira | ✅ |
| Salvamento IndexedDB + fallback localStorage | ✅ |
| Exportar / Importar save | ✅ |
| Interface desktop + mobile | ✅ |
| PWA manifest básico | ✅ |

## Ainda planejado (pós-MVP)

- Classes (Titan, Iron Press, Earthbreaker, Powerbuilder)
- Árvores de habilidade
- Equipamentos com raridade
- Competições regionais / nacionais / mundiais
- Patrocínios e seleção nacional
- NPCs e relacionamentos semiautônomos
- Mais cursos e progressão de emprego
- Spritesheets externos de maior fidelidade
- Áudio (efeitos e música)
- Gráficos de evolução (Chart.js opcional)
- Mais eventos narrativos

## Arquitetura

```
barbell-legends/
├── index.html
├── manifest.json
├── css/style.css
├── js/
│   ├── main.js          # Boot, loop, eventos
│   ├── rng.js           # PRNG com seed (Mulberry32)
│   ├── data.js          # Dados estáticos (jobs, nomes, programas…)
│   ├── character.js     # Geração procedural
│   ├── simulation.js    # Motor de tempo, treino, finanças, offline
│   ├── renderer.js      # Pixel art Canvas 2D procedural
│   ├── ui.js            # Interface e painéis
│   └── save.js          # IndexedDB + localStorage
└── README.md
```

**Separação:** a simulação (`simulation.js`) não depende do render. O tempo avança por deltas reais convertidos em minutos de jogo, não por frames.

## Balanceamento (parâmetros principais)

- 1 hora real ≈ 7 dias de jogo (configurável)
- Offline limitado a 24h reais por ausência
- Progressão de força com teto suave baseado em peso corporal × potencial genético
- Fadiga sistêmica e específica por levantamento
- Custos diários automáticos (aluguel, comida, academia, transporte)

## Licença

Projeto educacional / demonstração. Assets gerados proceduralmente no código.
