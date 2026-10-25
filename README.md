# Barbell Legends: Iron Empire v1.0 Completo

**Idle RPG · Life Simulator · Powerlifting Career** — 100% HTML/CSS/JS vanilla.

## Como executar

```bash
cd barbell-legends
python -m http.server 8080
# abra http://localhost:8080
```

## Sistemas implementados

### Core
- Geração procedural de personagem (homens/mulheres, emprego, vida, personalidade)
- Motor de tempo idle + simulação offline (até 24h reais)
- Agenda semanal automática com prioridades
- Sono, fadiga, energia, humor, nutrição
- Finanças (salário, custos, dívidas, histórico)

### Powerlifting
- Agachamento, Supino, Terra com 1RM, técnica, experiência, fadiga
- Programas: Linear, Full Body, Upper/Lower, 5/3/1, Periodização em Blocos
- Progressão com retornos decrescentes e potencial genético
- Equipamentos com raridade e durabilidade (cinturões, calçados, munhequeiras, joelheiras, singlet)

### RPG
- **Classes:** Titan, Iron Press, Earthbreaker, Powerbuilder
- **Árvores de habilidade:** Esportiva, Profissional, Pessoal (12 skills)
- Pontos de habilidade a cada 8 sessões

### Carreira
- Empregos com promoção
- Cursos (7 opções)
- Competições: Local → Regional → Nacional → Sul-Americano → Mundial
- Patrocínios escalonados por reputação
- Convocação para Seleção Nacional

### Vida
- NPCs (parceiro, amigos, colegas, família) com vínculo/apoio/demanda
- Eventos aleatórios
- Diário de carreira

### Técnica
- Pixel art Canvas 2D procedural
- IndexedDB + localStorage
- Export/import de save
- Desktop + mobile

## Estrutura

```
js/
  main.js, rng.js, data.js, character.js,
  simulation.js, renderer.js, ui.js, save.js
css/style.css
index.html
manifest.json
```
