# Cris Oliveira Store — site

Site estático (sem dependências, sem build). Abra `index.html` ou publique a pasta como está.

## Estrutura
```
index.html           Home: apresentação, WhatsApp/Instagram/localização, história, prévia da galeria, marcas, como comprar, contato e mapa
galeria.html         Galeria editorial com filtros, lightbox e navegação entre fotos
assets/css/cos.css   Estilos compartilhados (paleta, tipografia, componentes, animações)
assets/js/cos.js     Comportamento compartilhado (menu, animações, parallax, galeria, lightbox)
assets/images/       Fotografias e logo
```

## Adicionar uma foto à galeria
1. Salve a foto (.webp ou .jpg, largura ~960px) em `assets/images/`.
2. Em `galeria.html`, copie um bloco `<figure class="it" ...>` e ajuste:
   - `data-cat`: `looks`, `detalhes`, `acessorios` ou `loja`
   - `data-full` e `src`: caminho da imagem
   - `width` e `height`: dimensões reais da imagem (definem a proporção no grid)
   - `alt`, `aria-label` e o texto de `.cap`: descrição da foto, e o rótulo (Look, Detalhe, Acessório, A loja)
3. Contadores dos filtros e posição no grid são calculados automaticamente.

## Alterar contatos
O número de WhatsApp (`5541984405460`), o link do Instagram e o endereço aparecem em `index.html` e `galeria.html` (cabeçalho, botões e rodapé). Use a busca do editor para trocar em todos os lugares.

## Animações
- Entradas: classe `rv` (blocos) e títulos `h2` (máscara). Parallax discreto: atributo `data-px` (valores pequenos, ex.: 0.04).
- Transições entre páginas: View Transitions (fade); navegadores sem suporte usam um fade simples.
- Tudo respeita "reduzir movimento" do sistema e usa apenas transform/opacity.

## Publicar no GitHub Pages
1. Crie um repositório e envie o conteúdo desta pasta para a branch `main`.
2. Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)` → Save.
3. O endereço sairá como `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
