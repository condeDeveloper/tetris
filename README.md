# 🧱 Tetris

Tetris em HTML5 Canvas + JavaScript puro. Sem dependências, sem build.

**Jogar online:** https://condedeveloper.github.io/tetris/

## Rodar local

Abra `index.html` no navegador, ou sirva a pasta:

```bash
npx serve -l 5181 .
```

## Controles

| Ação               | Tecla                 |
|--------------------|-----------------------|
| Mover              | ← →                   |
| Descer (soft drop) | ↓                     |
| Girar horário      | ↑ ou X                |
| Girar anti-horário | Z ou Ctrl             |
| Queda rápida       | Espaço                |
| Segurar peça       | C ou Shift            |
| Pausar             | P ou Esc              |
| Reiniciar          | R                     |

No celular aparecem botões de toque na parte de baixo da tela.

## Funcionalidades

- 7 tetraminós com gerador **7-bag** (sem sequências injustas)
- Rotação com **wall kicks**
- **Ghost piece** mostrando onde a peça vai cair
- **Hold** e fila com as 3 próximas peças
- **Lock delay**: a peça só trava meio segundo depois de encostar
- Pontuação clássica (100/300/500/800 × nível), bônus por soft e hard drop
- Nível sobe a cada 10 linhas e a gravidade acelera
- Recorde salvo no `localStorage`
- Sons sintetizados via WebAudio
- Auto-repeat lateral (DAS) e suporte a toque

## Estrutura

```
index.html      # layout: hold, tabuleiro, próximas, placar
style.css       # tema escuro e responsivo
js/config.js    # constantes, cores, tabela de pontos, gravidade
js/pieces.js    # formas, rotação, 7-bag
js/board.js     # grade, colisão, travamento, limpeza de linhas
js/render.js    # desenho no canvas
js/audio.js     # efeitos sonoros
js/input.js     # teclado, DAS e botões de toque
js/game.js      # regras, estados e loop
```

## Licença

MIT
