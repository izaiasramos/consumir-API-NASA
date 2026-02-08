# NASA APOD Explorer

Front-end simples (HTML/CSS/JS) que consome a API **APOD (Astronomy Picture of the Day)** da NASA e mostra **imagem ou vídeo**, com UI moderna, loading/erro, e controles de data.

## Arquitetura (6 especialistas + 1 orquestradora)

- A função especialista `isoLocalDate()` tem como objetivo **gerar uma data `YYYY-MM-DD`** e faz isso primeiro **pegando ano/mês/dia** e depois **montando a string**.

- A função especialista `buildApodUrl()` tem como objetivo **montar a URL da API** e faz isso primeiro **criando a URL base**, depois **adicionando `api_key`**, e por fim **aplicando `date` ou `count=1`**.

- A função especialista `fetchApod()` tem como objetivo **buscar os dados do APOD** e faz isso primeiro **fazendo o `fetch`**, depois **lendo o JSON**, e por fim **tratando erros/retornando o item certo** (random pode vir em array).

- A função especialista `setLoading()` tem como objetivo **ligar/desligar o estado de carregamento** e faz isso primeiro **marcando `aria-busy`/skeleton** e depois **desabilitando botões**.

- A função especialista `renderApod()` tem como objetivo **preencher os textos (título, data, descrição)** e faz isso primeiro **escrevendo nos elementos da tela** e depois **chamando `renderMedia()`**.
git 
- A função especialista `renderMedia()` tem como objetivo **renderizar a mídia** e faz isso primeiro **checando `media_type`**, depois **mostrando `<img>` ou `<iframe>`**, e por fim **configurando abrir/baixar**.

- A função orquestradora `loadApod()` tem como objetivo **coordenar o fluxo completo** e faz isso primeiro **ligando loading**, depois **chamando `fetchApod()`**, depois **renderizando com `renderApod()`**, e por fim **salvando estado/toast e tratando erro**.

> Observação: `init()` só inicializa eventos e dispara o primeiro `loadApod()`.

## Controles

- Botões: **Carregar**, **Hoje**, **Surpresa**
- Atalhos: `T` (hoje) e `R` (aleatório)

